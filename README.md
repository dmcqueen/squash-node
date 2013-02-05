squash-node
==============

Node.js module that pushes errors to the Squash (https://github.com/SquareSquash/web) reporting system.   

Install with 

	npm install squash-node

An example express app with error handling middleware can be seen here.
https://github.com/dmcqueen/squash-express


To config squash using nconf and git-rev for your latest git revision add this to your express.

	var git = require('git-rev')
	var Squash = require('squash-node');
	var squash = new Squash(); 

	var nconf = require('nconf');
	var configPath = __dirname + "/./config.json";

	console.log('loading settings from: ' + configPath);
	nconf.file({
	    file: configPath
	});

	git.long(function (rev) {
	    squash.configure({ APIHost: nconf.get("squash:apihost"),
	           APIKey: nconf.get("squash:apikey"),
	           environment: nconf.get("squash:env"),
	           revision: rev
	       });
	       console.log('Squash Config');
	       console.log(squash.options);
	});

You'll need a config.json for nconf like so

	{
		"squash" : {
			"apihost" : "http://your-squash-server",
			"apikey" : "the-key-for-your-project",
			"env" : "production|development|whatever"
		}
	} 
	
	 
Then add error handling middleware that reports Error objects to Squash from your express app 

	app.use(function(err, req, res, next){
		squash.report(err);
    		next();
	});

