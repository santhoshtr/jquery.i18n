/*!
 * Grunt file
 *
 * @package jquery.i18n
 */
'use strict';

/* eslint-env node */

module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-contrib-connect' );

	grunt.initConfig( {
		connect: {
			server: {
				options: {
					port: 9001,
					base: '.'
				}
			}
		},
		eslint: {
			fix: {
				options: {
					fix: true
				},
				src: [
					'<%= eslint.main %>'
				]
			},
			main: [
				'*.js',
				'src/**/*.js',
				'test/**/*.js'
			]
		},
		qunit: {
			all: {
				options: {
					urls: [ 'http://localhost:<%=connect.server.options.port%>/test/index.html' ]
				}
			}
		}
	} );

	grunt.registerTask( 'server', [ 'connect' ] );
	grunt.registerTask( 'lint', [ 'eslint:main' ] );
	grunt.registerTask( 'fix', [ 'eslint:fix' ] );
	grunt.registerTask( 'unit', [ 'server', 'qunit' ] );
	grunt.registerTask( 'test', [ 'lint', 'unit' ] );
	grunt.registerTask( 'default', [ 'test' ] );
};
