var Hapi = require('hapi');
var querystring = require('querystring');
var fs = require('fs');
var oauth = require('oauth').OAuth;
var RateLimiter = require('limiter').RateLimiter;

//load yelp api v2.0 credentials
var credentials = JSON.parse(fs.readFileSync('credentials.json'));

var limiters = {};

//generate oauthclient for requests
var oauthClient = new oauth(
  null,
  null,
  credentials.Consumer_Key,
  credentials.Consumer_Secret,
  '1.0',
  null,
  'HMAC-SHA1'
);

function yelpSearch(client, creds, params, callback) {
  var url = 'http://api.yelp.com/v2/search?' + querystring.stringify(params);
  client.get(
      url, 
      creds.Token, 
      creds.Token_Secret, 
      function(error, data, response) {
      if(!error) data = JSON.parse(data);
      callback(error, data, response);
    });
}

function yelpBusiness(client, creds, id, callback) {
  var url = 'http://api.yelp.com/v2/business/' + id;
  client.get(
      url, 
      creds.Token, 
      creds.Token_Secret, 
      function(error, data, response) {
      if(!error) data = JSON.parse(data);
      callback(error, data, response);
    });
}

// Config for our handlebars views
var options = {
    views: {
        engines: { html: require('handlebars') },
        path: __dirname + '/templates'
    }
};

// Create a server with a host and port
var server = new Hapi.Server(+process.env.PORT || 8080, options);

// Search route
server.route({
  method: 'GET',
  path: '/',
  handler: function(req, reply) {
    reply.view("index", {});
  }
});

// Search route
server.route({
  method: 'GET',
  path: '/search',
  handler: function (req, reply) {
    if(!limiters[req.info.remoteAddress]) {
      limiters[req.info.remoteAddress] = new RateLimiter(100, 'hour', true);
    }
    limiters[req.info.remoteAddress].removeTokens(1, function(err, remainingRequests) {
      if(remainingRequests < 0) {
        reply('You have requested more than the allowed requests. Please wait for another hour before requesting again');
      } else {
        yelpSearch(oauthClient, credentials, req.query, function(err, data, res) {
          reply(data);
        });
      }
    });
  }
});

// Business route
server.route({
  method: 'GET',
  path: '/business/{id}',
  handler: function (req, reply) {
    if(!limiters[req.info.remoteAddress]) {
      limiters[req.info.remoteAddress] = new RateLimiter(100, 'hour', true);
    }
    limiters[req.info.remoteAddress].removeTokens(1, function(err, remainingRequests) {
      if(remainingRequests < 0) {
        reply('You have requested more than the allowed requests. Please wait for another hour before requesting again');
      } else {
        yelpBusiness(oauthClient, credentials, req.params.id, function(err, data, res) {
          reply(data);
        });
      }
    });
  }
});

// styles
server.route({
    path: "/css/{path*}",
    method: "GET",
    handler: {
        directory: {
            path: "./css",
            listing: false,
            index: false
        }
    }
});

// Start the server
server.start();
console.log('Listening on port ' + server.info.uri);