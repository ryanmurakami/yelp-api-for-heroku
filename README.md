# Yelp API for Heroku

A diy-Yelp API for fun & not-profit.

Info:
* Built with [hapi.js](http://hapijs.com/)
* Templates driven by [Handlebars](http://handlebarsjs.com/)
* API request limiting with [limiter](https://github.com/jhurliman/node-rate-limiter)


## Getting Started
- Sign up for a Yelp account. https://www.yelp.com/signup
- http://www.yelp.com/developers/getting_started/api_access
- Generate API v2.0 keys here: http://www.yelp.com/developers/manage_api_keys
- Copy the credentials into `credentials.json`
- `npm install` to install dependencies.
- After installing the heroku toolbelt, type `heroku create` in the directory
- `git push heroku master` deploys your app to your heroku account
- Visit your heroku site to view the root

## Tweaks

Change the amount of request limiting in `index.js`. Lines 73 & 93. Available interval options: 'hour', 'second', 'minute', 'day', or a number of milliseconds

    limiters[req.info.remoteAddress] = new RateLimiter(<number of requests>, <period of time>, true);

Modify the root template in `index.html`.

### Questions
* Reach me here: [@ryanmurakami](http://twitter.com/ryanmurakami)
