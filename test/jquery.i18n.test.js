( function ( $ ) {
	'use strict';

	QUnit.module( 'jquery.i18n - $.fn.i18n Tests', {
		beforeEach: function () {
			$.i18n( {
				locale: 'localex'
			} );
		},
		afterEach: function () {
			$.i18n().destroy();
		}
	} );

	QUnit.test( 'Message parse tests', function ( assert ) {
		var i18n = $( document ).data( 'i18n' ),
			$fixture = $( '#qunit-fixture' );
		// Load messages for localex
		i18n.load( {
			x: 'X'
		}, 'localex' );
		$fixture.data( 'i18n', 'x' );
		assert.strictEqual( $fixture.i18n().text(), 'X', 'Content of fixture localized' );
	} );

	QUnit.test( 'Message parse HTML', function ( assert ) {
		var i18n = $( document ).data( 'i18n' ),
			$fixture = $( '#qunit-fixture' );
		// Load messages for localex
		i18n.load( {
			x: 'X<i>Y</i>'
		}, 'localex' );
		$fixture.data( 'i18n', 'x' );
		assert.strictEqual( $fixture.i18n().html(), 'X&lt;i&gt;Y&lt;/i&gt;', 'Content of fixture localized with HTML encoded' );
		$fixture.data( 'i18n', '[html]x' );
		assert.strictEqual( $fixture.i18n().html(), 'X<i>Y</i>', 'Content of fixture localized with HTML as is' );
	} );

	QUnit.test( 'Message parse attrbutes', function ( assert ) {
		var i18n = $( document ).data( 'i18n' ),
			$fixture = $( '#qunit-fixture' );
		// Load messages for localex
		i18n.load( {
			x: 'title X'
		}, 'localex' );
		$fixture.data( 'i18n', '[title]x' );
		assert.strictEqual( $fixture.i18n().attr( 'title' ), 'title X', 'Content of title attribute localized' );
	} );

	QUnit.module( 'jquery.i18n', {
		beforeEach: function () {
			$.i18n( {
				locale: 'en'
			} );
		},
		afterEach: function () {
			$.i18n().destroy();
		}
	} );

	QUnit.test( 'Message parse tests (en)', function ( assert ) {
		var pluralAndGenderMessage,
			pluralAndGenderMessageWithLessParaMS,
			pluralAndGenderMessageWithCase,
			pluralAndGenderMessageWithSyntaxError,
			pluralAndGenderMessageWithSyntaxError2,
			i18n = $( document ).data( 'i18n' ),
			done = assert.async();

		i18n.load( 'i18n/test-en.json', 'en' ).then( function () {
			assert.strictEqual( i18n.locale, 'en', 'Locale is English' );
			assert.strictEqual( $.i18n( 'message_1' ), 'ONE', 'Simple message' );
			done();
		} );
		assert.strictEqual(
			$.i18n( 'This message key does not exist' ),
			'This message key does not exist',
			'This message key does not exist'
		);
		assert.strictEqual( $.i18n( 'Hello $1', 'Bob' ), 'Hello Bob', 'Parameter replacement' );
		pluralAndGenderMessage = '$1 has $2 {{plural:$2|kitten|kittens}}. ' +
			'{{gender:$3|He|She}} loves to play with {{plural:$2|it|them}}.';
		pluralAndGenderMessageWithLessParaMS = '$1 has $2 {{plural:$2|kitten}}. ' +
			'{{gender:$3|He|She}} loves to play with {{plural:$2|it}}.';
		pluralAndGenderMessageWithCase = '$1 has $2 {{plURAl:$2|kitten}}. ' +
			'{{genDER:$3|He|She}} loves to play with {{pLural:$2|it}}.';
		pluralAndGenderMessageWithSyntaxError = '$1 has $2 {{plural:$2|kitten}. ' +
			'{{gender:$3|He|She}} loves to play with {plural:$2|it}}.';
		pluralAndGenderMessageWithSyntaxError2 = '$1 has $2 {{plural:$2|kitten}}. ' +
			'{gender:$3|He|She}} loves to play with {plural:$2|it}}.';
		assert.strictEqual(
			$.i18n( pluralAndGenderMessage, 'Meera', 1, 'female' ),
			'Meera has 1 kitten. She loves to play with it.',
			'Plural and gender test - female, singular'
		);
		assert.throws(
			function () {
				$.i18n( pluralAndGenderMessageWithSyntaxError, 'Meera', 1, 'female' );
			},
			/Parse error at position 10/,
			'Message has syntax error'
		);
		assert.throws(
			function () {
				$.i18n( pluralAndGenderMessageWithSyntaxError2, 'Meera', 1, 'female' );
			},
			/Parse error at position 32/,
			'Message has syntax error'
		);
		assert.strictEqual(
			$.i18n( pluralAndGenderMessageWithLessParaMS, 'Meera', 1, 'female' ),
			'Meera has 1 kitten. She loves to play with it.',
			'Plural and gender test - female, singular, but will less parameters in message'
		);
		assert.strictEqual(
			$.i18n( pluralAndGenderMessageWithCase, 'Meera', 1, 'female' ),
			'Meera has 1 kitten. She loves to play with it.',
			'Plural and gender test - female, singular. Plural, gender keywords with upper and lower case'
		);
		assert.strictEqual(
			$.i18n( pluralAndGenderMessage, 'Meera', 1, 'randomtext' ),
			'Meera has 1 kitten. He loves to play with it.',
			'Plural and gender test - wrong gender- fallback to fist gender'
		);
		assert.strictEqual(
			$.i18n( pluralAndGenderMessage ),
			'$1 has $2 kittens. He loves to play with them.',
			'Plural and gender test - no params passed. Should not fail'
		);
		assert.strictEqual(
			$.i18n( pluralAndGenderMessage, 'Meera', 1, 'randomtext', 'extraparam' ),
			'Meera has 1 kitten. He loves to play with it.',
			'Plural and gender test - more params passed. Should not fail'
		);
		assert.strictEqual(
			$.i18n( pluralAndGenderMessage, 'Harry', 2, 'male' ),
			'Harry has 2 kittens. He loves to play with them.',
			'Plural and gender test - male, plural'
		);
		assert.strictEqual(
			$.i18n( 'This costs $1.' ),
			'This costs $1.',
			'No parameter supplied, $1 appears as is'
		);

	} );
	QUnit.test( 'Message parse tests (ml, fr)', function ( assert ) {
		return $.when(
			$.i18n().load( 'i18n/test-ml.json', 'ml' )
		).then( function () {
			var i18n = $( document ).data( 'i18n' ),
				pluralAndGenderMessage;
			$.i18n( {
				locale: 'ml'
			} );
			assert.strictEqual( i18n.locale, 'ml', 'Locale is Malayalam' );
			assert.strictEqual( $.i18n( 'message_1' ), 'ഒന്ന്', 'Simple message' );
			assert.strictEqual( $.i18n( 'This message key does not exist' ),
				'This message key does not exist', 'This message key does not exist' );
			assert.strictEqual( $.i18n( 'Hello $1', 'Bob' ), 'Hello Bob', 'Parameter replacement' );
			pluralAndGenderMessage = '$1 has $2 {{plural:$2|kitten|kittens}}. ' +
				'{{gender:$3|He|She}} loves to play with {{plural:$2|it|them}}.';
			assert.strictEqual( $.i18n( pluralAndGenderMessage, 'മീര', 1, 'female' ),
				'മീരയ്ക്കു് ഒരു പൂച്ചക്കുട്ടി ഉണ്ടു്. അവൾ അതുമായി കളിക്കാൻ ഇഷ്ടപ്പെടുന്നു.',
				'Plural and gender test - female, singular' );
			assert.strictEqual( $.i18n( pluralAndGenderMessage, 'ഹാരി', 2, 'male' ),
				'ഹാരിയ്ക്കു് 2 പൂച്ചക്കുട്ടികൾ ഉണ്ടു്. അവൻ അവറ്റകളുമായി കളിക്കാൻ ഇഷ്ടപ്പെടുന്നു.',
				'Plural and gender test - male, plural' );
			i18n.locale = 'fr';
			assert.strictEqual( $.i18n( 'Restaurer $1 {{PLURAL:$1|modification|modifications}}', 1 ),
				'Restaurer 1 modification', 'Plural rule parsed correctly for French' );
			assert.strictEqual( $.i18n( 'Restaurer $1 {{PLURAL:$1|modification|modifications}}', 2 ),
				'Restaurer 2 modifications', 'Plural rule parsed correctly for French' );
		} );
	} );

	QUnit.test( 'Message load tests', function ( assert ) {
		var i18n,
			done = assert.async();
		$.i18n();
		i18n = $( document ).data( 'i18n' );
		$.i18n().load( 'i18n/test-en.json', 'en' ).then( function () {
			// Load without any parameter
			$.i18n( {
				locale: 'test-en'
			} );

			assert.strictEqual( $.i18n( 'message_3' ), 'THREE', 'Messages loaded for locale test-en' );
			done();
		} );

		i18n.locale = 'localex';
		assert.strictEqual( i18n.locale, 'localex', 'Locale is localex' );

		// Load messages for localez
		i18n.load( {
			x: 'X'
		}, 'localex' );
		assert.strictEqual(
			$.i18n( 'x' ),
			'X',
			'Message loaded for localex, message key "x" is present'
		);

		// Load messages for two locales - localey and localez
		i18n.load( {
			localey: {
				y: 'Y'
			},
			localez: {
				z: 'Z'
			}
		} );
		i18n.load( {
			localey: {
				y1: 'Y1'
			}
		} );

		// Switch to locale localey
		i18n.locale = 'localey';
		assert.strictEqual( i18n.locale, 'localey', 'Locale switched to localey' );
		assert.strictEqual(	$.i18n( 'y1' ), 'Y1',
			'Message loaded for localey, message key "y1" is present'
		);
		assert.strictEqual(
			$.i18n( 'y' ),
			'Y',
			'Message loaded for localey, message key "y" is still present, not overwritten by second message load.'
		);

		// Switch back to locale localex
		i18n.locale = 'localex';
		assert.strictEqual( i18n.locale, 'localex', 'Going back-Locale is localex' );
		assert.strictEqual( $.i18n( 'x' ), 'X', 'Messages are not lost for localex' );

		// Switch to locale localez
		i18n.locale = 'localez';
		assert.strictEqual( i18n.locale, 'localez', 'Locale is localez' );
		assert.strictEqual(
			$.i18n( 'z' ),
			'Z',
			'Message loaded for localez, message key "z" is present'
		);

		// Load messages for en - with and without country code
		i18n.load( {
			'en-US': {
				'english-us': 'English-US'
			},
			en: {
				english: 'English'
			}
		} );
		i18n.locale = 'en-US';
		assert.strictEqual( i18n.locale, 'en-US', 'Locale is en-US' );
		assert.strictEqual(
			$.i18n( 'english-us' ),
			'English-US',
			'Message loaded for en-US, message key "english-us" is present'
		);
		assert.strictEqual(
			$.i18n( 'english' ),
			'English',
			'Message was resolved from en even though current locale is en-US'
		);
	} );

	QUnit.module( 'jquery.i18n - Fallback test', {
		beforeEach: function () {
			$.i18n().destroy();
			$.i18n();
		},
		afterEach: function () {
			$.i18n().destroy();
		}
	} );

	QUnit.test( 'Locale Fallback test', function ( assert ) {
		var i18n = $( document ).data( 'i18n' );

		return i18n.load( {
			hi: { hindi: 'हिन्दी' },
			en: { 'this-does-not-exist': 'This does not exist' },
			ru: { tt: 'russian-tt' }
		} ).then( function () {
			i18n.locale = 'sa';
			assert.strictEqual( i18n.locale, 'sa', 'Locale is Sanskrit' );
			assert.strictEqual( $.i18n( 'hindi' ), 'हिन्दी', 'Message got from fallback locale - Hindi' );
			assert.strictEqual( $.i18n( 'this-does-not-exist' ), 'This does not exist', 'Message got from fallback locale - English' );

			i18n.locale = 'tt-cyrl';
			assert.strictEqual( i18n.locale, 'tt-cyrl', 'Locale is tt-cyrl' );
			assert.strictEqual( $.i18n( 'tt' ), 'russian-tt',
				'Message is from fallback locale - Russian' );
			i18n.locale = 'tt';
			assert.strictEqual( $.i18n().locale, 'tt', 'Locale is tt' );
			assert.strictEqual( $.i18n( 'tt' ), 'russian-tt',
				'Message is from fallback locale - Russian' );
		} );
	} );

	QUnit.test( 'Support fallback loading from folder tests', function ( assert ) {
		var i18n = $( document ).data( 'i18n' );

		return i18n.load( 'i18n/fallback/en.json', 'en' ).then( function () {
			i18n.setLocale( 'uk' );
			//	assert.strictEqual( i18n.locale, 'uk', 'Locale is uk' );
			assert.strictEqual( $.i18n( 'message_1' ), 'ONE', 'Message loaded from fallback locale English' );
		} );
	} );

}( jQuery ) );
