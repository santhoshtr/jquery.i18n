/**
 * Russian (Русский) language functions
 */


var BananaLanguageRu = {
	language: 'ru'
};

BananaLanguageRu.convertGrammar = function ( word, form ) {
	if ( form === 'genitive' ) { // родительный падеж
		if ( word.substr( -1 ) === 'ь' ) {
			word = word.substr( 0, word.length - 1 ) + 'я';
		} else if ( word.substr( -2 ) === 'ия' ) {
			word = word.substr( 0, word.length - 2 ) + 'ии';
		} else if ( word.substr( -2 ) === 'ка' ) {
			word = word.substr( 0, word.length - 2 ) + 'ки';
		} else if ( word.substr( -2 ) === 'ти' ) {
			word = word.substr( 0, word.length - 2 ) + 'тей';
		} else if ( word.substr( -2 ) === 'ды' ) {
			word = word.substr( 0, word.length - 2 ) + 'дов';
		} else if ( word.substr( -3 ) === 'ник' ) {
			word = word.substr( 0, word.length - 3 ) + 'ника';
		}
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
		root.BananaLanguages.ru = factory;
	}
}( this, BananaLanguageRu ) );
