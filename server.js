/**
* Dependencies.
*/
var Hapi = require('hapi');
var auth = require('hapi-twilio-auth');

// Create a new server
var server = new Hapi.Server();

// Setup the server with a host and port
server.connection({port: parseInt(process.env.PORT, 10)});

// Export the server to be required elsewhere.
module.exports = server;

/*
    Load all plugins and then start the server.
    First: community/npm plugins are loaded
    Second: project specific plugins are loaded
 */
server.register([
    {
        register: require("good"),
        options: {
            opsInterval: 5000,
            reporters: [{
                reporter: require('good-console'),
                args:[{ ops: '*', request: '*', log: '*', response: '*', 'error': '*' }]
            }]
        }
    },
    {
        register: require("hapi-assets"),
        options: require('./assets.js')
    },
    {
        register: require("hapi-named-routes")
    },
    {
        register: require("hapi-cache-buster")
    },
    {
        register: require('./server/assets/index.js')
    },
    {
      register: require('./server/base/index.js')
    }
], function () {

    server.auth.strategy('twilio-auth', 'twilio-signature', {
      baseUrl: 'https://mycompany.com/webhooks-path', // your twilio webhooks base url
      twilioAuthToken: 'xxxxxxxxxxx', // your twilio auth token
    })
    
    //Start the server
    server.start(function() {
        //Log to the console the host and port info
        console.log('Server started at: ' + server.info.uri);
    });
});
