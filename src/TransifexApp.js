
'use strict';

let App = require( './App.js' );

var validStates = [ 'success', 'failure', 'error', 'pending' ];

class TransifexApp extends App {
	/**
	 * Checks if given Pull Request modifies files from lang/*.js file, if so it will mark commit with an error status.
	 *
	 * @param {Number} pullRequestId
	 */
	validatePr( pullRequestId ) {
		this.getPrCommits( pullRequestId ).then( function( commits ) {
			let langFileRegExp = /^lang\/.+.js$/,
				whitelistedLangFiles = [ 'lang/en.js' ],
				//fileModifications = [].concat.apply( [], commits.map( item => item.files ) ),
				fileModifications = [].concat.apply( [], commits.map( item => {
					item.files.srcSha = item.sha;
					return item.files;
				} ) ),
				langModifications = fileModifications.filter( item => {
					return item.filename && item.filename.match( langFileRegExp ) && whitelistedLangFiles.indexOf( item.filename ) === -1;
				} );

			return {
				commits: commits,
				langModifications: langModifications
			};
		} ).then( ( function( info ) {
			let langModifications = info.langModifications;
			// Now let's put a proper status to the PR, depending if it contains violated files or not.
			if ( langModifications.length ) {
				console.log( `PR#${pullRequestId} modifies lang files :(\n\nHere\'s the list: \n* ${langModifications.map( el => el.filename ).join( '\n* ' )}` )
				// langModifications.forEach( el => this._setCommitStatus( el.sha, 'failure' ) );
			} else {
				console.log( commits[ commits.length - 1 ] );
				console.log( 'PR looking good, great!' );
			}
		} ).bind( this ) ).catch( err => console.log( 'getPrCommits(): ERROR:', err ) );
	}

	_setCommitStatus( sha, state, url, descr ) {
		if ( validStates.indexOf( state ) === -1 ) {
			throw new Error( `_setCommitStatus(): Invalid state value "${state}"` );
		}
		
		console.log( 'returning' );

		return new Promise( ( function( resolve, reject ) {
			this.repo.status( sha, {
				state: state,
				target_url: 'http://foo.dev.null',
				description: descr || 'Transifex validation failed',
				context: 'transifex-reminder'
			}, function( err, data ) {
				console.log( 'RES:', err );
				if ( err ) {
					return reject( err );
				}

				resolve( data );
			} );
		} ).bind( this ) ).catch( function( err ) {
		    console.log( 'EXCEPTION:', err );
		} );
	}
}

module.exports = TransifexApp;

