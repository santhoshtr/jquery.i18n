#!/usr/bin/env node

var extend = require( 'util' )._extend;
var pluralRuleParser = require( __dirname + '/../../CLDRPluralRuleParser/src/CLDRPluralRuleParser.js' );
var BananaMessageParser = require( __dirname + '/BananaMessageParser.js' ).BananaMessageParser;
var BananaMessageParserEmitter = require( __dirname + '/BananaMessageParser.js' ).BananaMessageParserEmitter;
var bidi =  require( __dirname + '/BananaMessageParserEmitterBidi.js' );
BananaMessageParserEmitter.prototype.bidi = bidi;
var BananaLanguage = require( __dirname + '/BananaDefaultLanguage.js' );
var Bosnian = require( __dirname + '/languages/bs.js' );
var Russian = require( __dirname + '/languages/ru.js' );
var languageDef = extend( BananaLanguage, Russian );
languageDef.pluralRuleParser = pluralRuleParser;
languageDef.language = 'ga';
var parser = new BananaMessageParser( languageDef );
console.log( parser.parse( "There {{plural:$1|is one animal|are $1 animals|third}} in this {{grammar:instrumental|zoo}}", [ 6 ] ) );
