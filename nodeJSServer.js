// Dennis Stephens - P3

var http = require('http');
var fs = require('fs');
var exec = require('child_process').exec;

// Defines the upper and lower bound of the random port chosen.
const LOWERPORT = 2000;
const UPPERPORT = 35000;

// Assigns a random number between the upper and lower bound to randPort for 
// the createServer call
var randPort = Math.floor(Math.random() * (UPPERPORT - LOWERPORT + 1)) + LOWERPORT;

// Displays in the console the url and port the server is listening on
console.log("Server started. Listening on iris.cs.uky.edu:",randPort);

// Creates the server listening on a random port
http.createServer(serveURL).listen(randPort);


function serveURL(req, res) {

	// Creates the regular expressions that will result in a valid request
	var comicExp = new RegExp(/^\/COMIC\/([0-9][0-9][0-9][0-9]\-[0-9][0-9]\-[0-9][0-9]|CURRENT)/m);
	var searchExp = new RegExp(/^\/SEARCH\/[a-zA-Z0-9]+$/gm);
	var fileExp = new RegExp(/^\/MYFILE\/[a-zA-Z0-9_]+.html$/gm)

	// Converts the users url request into a string
	var requestedURL = req.url.toString();
	// Splits the string delimited by the '/' character
	var urlArray = requestedURL.split("/");
	
	// Determines whether the user requested a comic, search or file
	// by comparing the url string to the valid regular expressions
	if (comicExp.test(requestedURL)) {
		console.log(requestedURL + " - VALID");
		giveComic(urlArray, res);
	}
	else if (searchExp.test(requestedURL)) {
		console.log(requestedURL + " - VALID");
		doSearch(urlArray, res);
	}
	else if (fileExp.test(requestedURL)){
		console.log(requestedURL + " - VALID");
		giveFile(urlArray, res);
	}
	else
		console.log(requestedURL + " - BAD");

}


function giveComic(urlArray, res) {

	var comicURL;

	if (urlArray[2] == "CURRENT")
		comicURL = "http://dilbert.com";
	else
		comicURL = "http://dilbert.com/strip/" + urlArray[2];

	exec("curl " + comicURL, {env: {'PATH': '/usr/bin'}}, function(error, stdout, stderr) {
		
		if (!!error) {
			console.log('exec error: ' + error);
			return res.json({message: error.message});
		}

		console.log('stderr: ' + stderr);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(stdout);
	});
	
}

function doSearch(urlArray, res) {

	var searchURL = "https://duckduckgo.com/html/?q=" + urlArray[2] + "&ia=web";


	exec("curl " + searchURL, {env: {'PATH': '/usr/bin'}}, function(error, stdout, stderr) {
		
		if (!!error) {
			console.log('exec error: ' + error);
			return res.json({message: error.message});
		}

		console.log('stderr: ' + stderr);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(stdout);
	});
}

function giveFile(urlArray, res) {

	var file = _dirname + '/private_html/' + urlArray[2];

	if (fs.existsSync(file)) {

		fs.readFile(file, function(error, data) {

			if (!!error) {
				console.log('exec error: ' + error);
				return res.json({message: error.message});
			}

			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(data);
		});
	}	
	
	else {
		
		res.status(403);
		res.end("Error 403: File Not Found");
	}
}
