
var http = require('http'),
	TransifexApp = require( './src/TransifexApp.js' ),
	app = new TransifexApp( require( './config.json' ) );
const PORT = 20388;

function handleRequest( request, response ){
	response.end( 'Got request' );

	var body = '';
	request.addListener('data', function(chunk){
		body += chunk;
	});

	request.on('end', function( evt ) {
		let fs = require('fs'),
			formattedJson = JSON.stringify( JSON.parse( body ), null, 4 );

		fs.writeFile("./request.json", formattedJson, function(err) {
			if(err) {
				return console.log(err);
			}
		});

		try {
			let payload = JSON.parse( body ),
				action = payload.action;
			if ( !payload.number ) {
				throw new Error( 'Payload has no number property' );
			}

			if ( action == 'opened' || action == 'synchronize' ) {
				console.log( `Validating PR#${payload.number}` );
				app.validatePr( Number( payload.number ) );
			}
		} catch ( e ) {
			console.log( `Error: ${e}` );
		}
	});
}

var server = http.createServer(handleRequest);
server.listen(PORT, function(){
	console.log("Server listening on: http://localhost:%s", PORT);
});
