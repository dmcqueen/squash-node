squash-node
==============

Node.js module that pushes errors to the Squash (https://github.com/SquareSquash/web) reporting system.   

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
			"apihost" : "http://squash.neudesic-dev.com",
			"apikey" : "00200418-be5e-491c-8bf4-0e30fa5409a9",
			"env" : "production"
		}
	} 
	
	 
Then add an error handling middleware 

	app.use(function(err, req, res, next){
		squash.report(err);
    		next();
	});

