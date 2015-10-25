
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
				modifications = {};

			// Fill out modifications object in a way, that commit hash is used as a key and contains an array of file modifications
			// that violates the rule. If commit does not violate it won't be added to object keys.
			commits.forEach( function( item ) {
				let violatedFiles = item.files.filter( file => file.filename && file.filename.match( langFileRegExp ) && whitelistedLangFiles.indexOf( file.filename ) === -1 );
				if ( violatedFiles.length ) {
					modifications[ item.sha ] = violatedFiles;
				}
			} );
			
			return {
				commits: commits,
				modifications: modifications
			};
		} ).then( ( function( info ) {
			let modifications = info.modifications,
				commits = info.commits,
				violated = Object.keys( modifications ).length > 0;

			// Now let's put a proper status to the PR, depending if it contains violated files or not.
			if ( violated ) {
				console.log( `PR#${pullRequestId} modifies lang files :(` );
				for ( let sha in modifications ) {
					let modifiedFileList = modifications[ sha ].map( el => el.filename ).join( ', ' );

					if ( modifiedFileList.length > 90 ) {
						// In case if there's just too many changed files in the commit.
						modifiedFileList = modifiedFileList.substr( 0, 87 ) + '...';
					}

					console.log( `Failed commit: ${sha}` );
					this._setCommitStatus( sha, 'failure', 'http://docs.ckeditor.com/#!/guide/dev_contributing_code-section-changes-that-cannot-be-accepted-as-a-pull-request', `Modified lang files (${modifiedFileList})` );
				}
			} else {
				console.log( commits[ commits.length - 1 ] );
				console.log( 'PR looking good, great!' );
				// Adding success status to the last commit.
				this._setCommitStatus( commits[ commits.length - 1 ].sha, 'success', null, 'No issues detected' );
			}
		} ).bind( this ) ).catch( err => console.log( 'getPrCommits(): ERROR:', err ) );
	}

	_setCommitStatus( sha, state, url, descr ) {
		if ( validStates.indexOf( state ) === -1 ) {
			throw new Error( `_setCommitStatus(): Invalid state value "${state}"` );
		}
		
		return new Promise( ( function( resolve, reject ) {
			this.repo.status( sha, {
				state: state,
				target_url: url,
				description: descr || 'Transifex validation failed',
				context: 'transifex-reminder'
			}, function( err, data ) {
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

