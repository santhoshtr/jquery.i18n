/**
 * Bosnian (bosanski) language functions
 */

var BananaLanguageBs = {
	language: 'bs'
};

BananaLanguageBs.convertGrammar = function ( word, form ) {
	switch ( form ) {
	case 'instrumental': // instrumental
		word = 's ' + word;
		break;
	case 'lokativ': // locative
		word = 'o ' + word;
		break;
	}

	return word;
};

( function ( root, factory ) {
	if ( typeof define === 'function' && define.amd ) {
		// AMD. Register as an anonymous module.
		define( factory );
	} else if ( typeof exports === 'object' ) {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory;
	} else {
		// Browser globals (root is window)
		root.BananaLanguages = root.BananaLanguages || {};
		root.BananaLanguages.bs = factory;
	}
}( this, BananaLanguageBs ) );
