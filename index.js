
'use strict';

let TransifexApp = require( './src/TransifexApp.js' ),
	config = require( './config.json' ),
	pullRequestId = 3,
	app;

app = new TransifexApp( config );
app.start();

app.validatePr( pullRequestId );

