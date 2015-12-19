/**
 * jQuery Internationalization library
 *
 * Copyright (C) 2011-2013 Santhosh Thottingal, Neil Kandalgaonkar
 *
 * jquery.i18n is dual licensed GPLv2 or later and MIT. You don't have to do
 * anything special to choose one license or the other and you don't have to
 * notify anyone which license you are using. You are free to use
 * UniversalLanguageSelector in commercial projects as long as the copyright
 * header is left intact. See files GPL-LICENSE and MIT-LICENSE for details.
 *
 * @licence GNU General Public Licence 2.0 or later
 * @licence MIT License
 */

var MessageParserEmitter;

function MessageParser( language, options ) {
	this.options = options;
	this.language = language;
	this.emitter = new MessageParserEmitter( language );
}

MessageParser.prototype = {

	simpleParse: function ( message, parameters ) {
		return message.replace( /\$(\d+)/g, function ( str, match ) {
			var index = parseInt( match, 10 ) - 1;

			return parameters[ index ] !== undefined ? parameters[ index ] : '$' + match;
		} );
	},

	parse: function ( message, replacements ) {
		if ( message.indexOf( '{{' ) < 0 ) {
			return this.simpleParse( message, replacements );
		}

		return this.emitter.emit( this.ast( message ), replacements );
	},

	ast: function ( message ) {
		var pipe, colon, backslash, anyCharacter, dollar, digits, regularLiteral,
			regularLiteralWithoutBar, regularLiteralWithoutSpace, escapedOrLiteralWithoutBar,
			escapedOrRegularLiteral, templateContents, templateName, openTemplate,
			closeTemplate, expression, paramExpression, result,
			pos = 0;

		// Try parsers until one works, if none work return null
		function choice( parserSyntax ) {
			return function () {
				var i, result;

				for ( i = 0; i < parserSyntax.length; i++ ) {
					result = parserSyntax[ i ]();

					if ( result !== null ) {
						return result;
					}
				}

				return null;
			};
		}

		// Try several parserSyntax-es in a row.
		// All must succeed; otherwise, return null.
		// This is the only eager one.
		function sequence( parserSyntax ) {
			var i, res,
				originalPos = pos,
				result = [];

			for ( i = 0; i < parserSyntax.length; i++ ) {
				res = parserSyntax[ i ]();

				if ( res === null ) {
					pos = originalPos;

					return null;
				}

				result.push( res );
			}

			return result;
		}

		// Run the same parser over and over until it fails.
		// Must succeed a minimum of n times; otherwise, return null.
		function nOrMore( n, p ) {
			return function () {
				var originalPos = pos,
					result = [],
					parsed = p();

				while ( parsed !== null ) {
					result.push( parsed );
					parsed = p();
				}

				if ( result.length < n ) {
					pos = originalPos;

					return null;
				}

				return result;
			};
		}

		// Helpers -- just make parserSyntax out of simpler JS builtin types

		function makeStringParser( s ) {
			var len = s.length;

			return function () {
				var result = null;

				if ( message.substr( pos, len ) === s ) {
					result = s;
					pos += len;
				}

				return result;
			};
		}

		function makeRegexParser( regex ) {
			return function () {
				var matches = message.substr( pos ).match( regex );

				if ( matches === null ) {
					return null;
				}

				pos += matches[ 0 ].length;

				return matches[ 0 ];
			};
		}

		pipe = makeStringParser( '|' );
		colon = makeStringParser( ':' );
		backslash = makeStringParser( '\\' );
		anyCharacter = makeRegexParser( /^./ );
		dollar = makeStringParser( '$' );
		digits = makeRegexParser( /^\d+/ );
		regularLiteral = makeRegexParser( /^[^{}\[\]$\\]/ );
		regularLiteralWithoutBar = makeRegexParser( /^[^{}\[\]$\\|]/ );
		regularLiteralWithoutSpace = makeRegexParser( /^[^{}\[\]$\s]/ );

		// There is a general pattern:
		// parse a thing;
		// if it worked, apply transform,
		// otherwise return null.
		// But using this as a combinator seems to cause problems
		// when combined with nOrMore().
		// May be some scoping issue.
		function transform( p, fn ) {
			return function () {
				var result = p();

				return result === null ? null : fn( result );
			};
		}

		// Used to define "literals" within template parameters. The pipe
		// character is the parameter delimeter, so by default
		// it is not a literal in the parameter
		function literalWithoutBar() {
			var result = nOrMore( 1, escapedOrLiteralWithoutBar )();

			return result === null ? null : result.join( '' );
		}

		function literal() {
			var result = nOrMore( 1, escapedOrRegularLiteral )();

			return result === null ? null : result.join( '' );
		}

		function escapedLiteral() {
			var result = sequence( [ backslash, anyCharacter ] );

			return result === null ? null : result[ 1 ];
		}

		choice( [ escapedLiteral, regularLiteralWithoutSpace ] );
		escapedOrLiteralWithoutBar = choice( [ escapedLiteral, regularLiteralWithoutBar ] );
		escapedOrRegularLiteral = choice( [ escapedLiteral, regularLiteral ] );

		function replacement() {
			var result = sequence( [ dollar, digits ] );

			if ( result === null ) {
				return null;
			}

			return [ 'REPLACE', parseInt( result[ 1 ], 10 ) - 1 ];
		}

		templateName = transform(
			// see $wgLegalTitleChars
			// not allowing : due to the need to catch "PLURAL:$1"
			makeRegexParser( /^[ !"$&'()*,.\/0-9;=?@A-Z\^_`a-z~\x80-\xFF+\-]+/ ),

			function ( result ) {
				return result.toString();
			}
		);

		function templateParam() {
			var expr,
				result = sequence( [ pipe, nOrMore( 0, paramExpression ) ] );

			if ( result === null ) {
				return null;
			}

			expr = result[ 1 ];

			// use a "CONCAT" operator if there are multiple nodes,
			// otherwise return the first node, raw.
			return expr.length > 1 ? [ 'CONCAT' ].concat( expr ) : expr[ 0 ];
		}

		function templateWithReplacement() {
			var result = sequence( [ templateName, colon, replacement ] );

			return result === null ? null : [ result[ 0 ], result[ 2 ] ];
		}

		function templateWithOutReplacement() {
			var result = sequence( [ templateName, colon, paramExpression ] );

			return result === null ? null : [ result[ 0 ], result[ 2 ] ];
		}

		templateContents = choice( [
				function () {
				var res = sequence( [
						// templates can have placeholders for dynamic
						// replacement eg: {{PLURAL:$1|one car|$1 cars}}
						// or no placeholders eg:
						// {{GRAMMAR:genitive|{{SITENAME}}}
						choice( [ templateWithReplacement, templateWithOutReplacement ] ),
						nOrMore( 0, templateParam )
					] );

				return res === null ? null : res[ 0 ].concat( res[ 1 ] );
				},
				function () {
				var res = sequence( [ templateName, nOrMore( 0, templateParam ) ] );

				if ( res === null ) {
					return null;
				}

				return [ res[ 0 ] ].concat( res[ 1 ] );
				}
			] );

		openTemplate = makeStringParser( '{{' );
		closeTemplate = makeStringParser( '}}' );

		function template() {
			var result = sequence( [ openTemplate, templateContents, closeTemplate ] );

			return result === null ? null : result[ 1 ];
		}

		expression = choice( [ template, replacement, literal ] );
		paramExpression = choice( [ template, replacement, literalWithoutBar ] );

		function start() {
			var result = nOrMore( 0, expression )();

			if ( result === null ) {
				return null;
			}

			return [ 'CONCAT' ].concat( result );
		}

		result = start();

		/*
		 * For success, the pos must have gotten to the end of the input
		 * and returned a non-null.
		 * n.b. This is part of language infrastructure, so we do not throw an internationalizable message.
		 */
		if ( result === null || pos !== message.length ) {
			throw new Error( 'Parse error at position ' + pos.toString() + ' in input: ' + message );
		}

		return result;
	}

};

MessageParserEmitter = function ( language ) {
	this.language = language;
};

MessageParserEmitter.prototype = {
	/**
	 * (We put this method definition here, and not in prototype, to make
	 * sure it's not overwritten by any magic.) Walk entire node structure,
	 * applying replacements and template functions when appropriate
	 *
	 * @param {Mixed} node abstract syntax tree (top node or subnode)
	 * @param {Array} replacements for $1, $2, ... $n
	 * @return {Mixed} single-string node or array of nodes suitable for
	 *  jQuery appending.
	 */
	emit: function ( node, replacements ) {
		var ret, subnodes, operation, nodes, n, i,
			messageParserEmitter = this;

		switch ( typeof node ) {
		case 'string':
		case 'number':
			ret = node;
			break;
		case 'object':
			// node is an array of nodes
			subnodes = [];
			nodes = node.slice( 1 );
			for ( i = 0; i < nodes.length; i++ ) {
				n = nodes[ i ];
				subnodes.push( messageParserEmitter.emit( n, replacements ) );
			}

			operation = node[ 0 ].toLowerCase();

			if ( typeof messageParserEmitter[ operation ] === 'function' ) {
				ret = messageParserEmitter[ operation ]( subnodes, replacements );
			} else {
				throw new Error( 'unknown operation "' + operation + '"' );
			}

			break;
		case 'undefined':
			// Parsing the empty string (as an entire expression, or as a
			// paramExpression in a template) results in undefined
			// Perhaps a more clever parser can detect this, and return the
			// empty string? Or is that useful information?
			// The logical thing is probably to return the empty string here
			// when we encounter undefined.
			ret = '';
			break;
		default:
			throw new Error( 'unexpected type in AST: ' + typeof node );
		}

		return ret;
	},

	/**
	 * Parsing has been applied depth-first we can assume that all nodes
	 * here are single nodes Must return a single node to parents -- a
	 * jQuery with synthetic span However, unwrap any other synthetic spans
	 * in our children and pass them upwards
	 *
	 * @param {Array} nodes Mixed, some single nodes, some arrays of nodes.
	 * @return String
	 */
	concat: function ( nodes ) {
		var result = '';

		nodes.forEach( function ( node ) {
			// strings, integers, anything else
			result += node;
		} );

		return result;
	},

	/**
	 * Return escaped replacement of correct index, or string if
	 * unavailable. Note that we expect the parsed parameter to be
	 * zero-based. i.e. $1 should have become [ 0 ]. if the specified
	 * parameter is not found return the same string (e.g. "$99" ->
	 * parameter 98 -> not found -> return "$99" ) TODO throw error if
	 * nodes.length > 1 ?
	 *
	 * @param {Array} nodes One element, integer, n >= 0
	 * @param {Array} replacements for $1, $2, ... $n
	 * @return {string} replacement
	 */
	replace: function ( nodes, replacements ) {
		var index = parseInt( nodes[ 0 ], 10 );

		if ( index < replacements.length ) {
			// replacement is not a string, don't touch!
			return replacements[ index ];
		} else {
			// index not found, fallback to displaying variable
			return '$' + ( index + 1 );
		}
	},

	/**
	 * Transform parsed structure into pluralization n.b. The first node may
	 * be a non-integer (for instance, a string representing an Arabic
	 * number). So convert it back with the current language's
	 * convertNumber.
	 *
	 * @param {Array} nodes List [ {String|Number}, {String}, {String} ... ]
	 * @return {String} selected pluralized form according to current
	 *  language.
	 */
	plural: function ( nodes ) {
		var count = parseFloat( this.language.convertNumber( nodes[ 0 ], 10 ) ),
			forms = nodes.slice( 1 );

		return forms.length ? this.language.convertPlural( count, forms ) : '';
	},

	/**
	 * Transform parsed structure into gender Usage
	 * {{gender:gender|masculine|feminine|neutral}}.
	 *
	 * @param {Array} nodes List [ {String}, {String}, {String} , {String} ]
	 * @return {String} selected gender form according to current language
	 */
	gender: function ( nodes ) {
		var gender = nodes[ 0 ],
			forms = nodes.slice( 1 );

		return this.language.gender( gender, forms );
	},

	/**
	 * Transform parsed structure into grammar conversion. Invoked by
	 * putting {{grammar:form|word}} in a message
	 *
	 * @param {Array} nodes List [{Grammar case eg: genitive}, {String word}]
	 * @return {String} selected grammatical form according to current
	 *  language.
	 */
	grammar: function ( nodes ) {
		var form = nodes[ 0 ],
			word = nodes[ 1 ];

		return word && form && this.language.convertGrammar( word, form );
	}
};

( function ( root, parser, emitter ) {
	if ( typeof define === 'function' && define.amd ) {
		// AMD. Register as an anonymous module.
		define( parser );
		define( emitter );
	} else if ( typeof exports === 'object' ) {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports =  {
			BananaMessageParser: parser,
			BananaMessageParserEmitter: emitter
		};
	} else {
		// Browser globals (root is window)
		root.BananaMessageParser = parser;
		root.BananaMessageParserEmitter = emitter;
	}
}( this, MessageParser, MessageParserEmitter ) );
