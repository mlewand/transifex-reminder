
'use strict';

var github = require( 'octonode' );


class App {
	constructor( config ) {
		this.config = config;

		this._validateConfig( config );

		this.client = github.client( config.token );
		this.repo = this.client.repo( config.repo );
	}

	start() {
		console.log( 'all fine' );
	}

	/**
	 * Gets commit list in a given pull request.
	 *
	 * @param {Number} prId
	 * @returns {Promise<Array>}
	 */
	getPrCommits( prId ) {
		var that = this;

		let ret = new Promise( function( resolve, reject ) {
			let pr = that.client.pr( that.config.repo, prId );

			pr.commits( function( err, data ) {
				if ( err ) {
					return reject( err );
				}

			    resolve( data );
			} );
		} ).then( function( data ) {
			// pr.commits will return us only brief info, we need detailed info to see what files
			// were modified.
			return Promise.all( data.map( function( commitInfo ) {
				return new Promise( function( resolve, reject ) {
					that.repo.commit( commitInfo.sha, function( err, data ) {
						if ( err ) {
							return reject( err );
						}

						resolve( data );
					} );
				} );
			} ) );
		} );

		return ret;
	}

	_validateConfig( config ) {
		if ( !config.token ) {
			console.log( 'Missing config.token property' );
			process.exit();
		}

		if ( !config.repo ) {
			console.log( 'Missing config.repo property' );
			process.exit();
		}
	}
}

module.exports = App;