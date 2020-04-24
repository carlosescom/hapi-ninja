require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilio = require('twilio')(accountSid, authToken);
var Hapi = require('hapi');

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

    server.route({
        method: 'POST',
        path: '/sms',
        handler(request, h) {
            twilio.messages
            .create({
                body: 'Tú código de verificación es: 1234',
                from: process.env.TWILIO_PHONE,
                to: request.payload.patient_phone
            })
            .then(message => console.log(message.sid));
          
            server.response(messagingResponse.toString())
            .type('application/json')
            .code(200);
        },
        config: { auth: false },
    })

    //Start the server
    server.start(function() {
        //Log to the console the host and port info
        console.log('Server started at: ' + server.info.uri);
    });
});
