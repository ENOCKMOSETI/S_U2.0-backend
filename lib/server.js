// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');

// Instantiate the server module
var server = {};


// @TODO GET RID OF THIS
// helpers.sendTwilioSms('+17743533169', 'Hello!', (err) => {
//     console.log('this was the error', err);
// });

// var _data = require('./lib/data');
// // TEST
// // @TODO delete this
// _data.delete('test', 'newFile', (err,) => {
//     console.log('this was the error', err);
// });


// Instantiate the HTTP server
server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req,res);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
    'key' : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    'cert' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    server.unifiedServer(req, res);
});

// All the server logic for both http and https server
server.unifiedServer = (req, res) => {
    
        // Get the URL and parse it
        var parsedUrl = url.parse(req.url, true);
    
        // Get the path
        var path = parsedUrl.pathname;
        var trimmedPath = path.replace(/^\/+|\/+$/g,'');
    
        // Get the query string as an object
        var queryStringObject = parsedUrl.query;
    
        // Get the http method
        var method = req.method.toLowerCase();
    
        // Get the headers as an object
        var headers = req.headers;
    
        // Get the payload, if any
        var decoder = new StringDecoder('utf-8');
        var buffer = '';
        req.on('data', (data) => {
            buffer += decoder.write(data);
        });
        req.on('end', () => {
            buffer += decoder.end();
    
            // Choose the router for a matching path for a hanlder, if one is not found, default to noFound handler
            var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;
    
            // Construct the data object to send to the handler
            var data = {
                'trimmedPath' : trimmedPath,
                'queryStringObject' : queryStringObject,
                'method' : method,
                'headers' : headers,
                'payload' : helpers.parseJsonToObject(buffer)
            };
    
            // Route the request specified in the router
            chosenHandler(data, (statusCode, payload, contentType) => {
                // Determine type of response (fallback to JSON)
                contentType = typeof(contentType) == 'string' ? contentType : 'json';

                // Use the status code called back by the handler, or default to 200
                statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

                // Return the response parts that are content-specific
                var payloadString = '';
                if (contentType == 'json') {
                    res.setHeader('Content-Type', 'application/json');
                    payload = typeof(payload) == 'object' ? payload : {};
                    payloadString = JSON.stringify(payload);
                } 
                if (contentType == 'html') {
                    res.setHeader('Content-Type', 'text/html');
                    payloadString = typeof(payload) == 'string' ? payload : '';
                }

                //  Return the response parts that are common to all content-types
                res.writeHead(statusCode);  
                res.end(payloadString);         
    
                // Logs
                console.log('Returning this response: ', statusCode, payloadString);
            });     
        });
};

    // Define a request router
    server.router = {
        '' : handlers.index,
        'account/create' : handlers.accountCreate,
        'account/edit' : handlers.accountEdit,
        'account/deleted' : handlers.accountDeleted,
        'session/create' : handlers.sessionCreate,
        'session/deleted' : handlers.sessionDeleted,
        'checks/all' : handlers.checksList,
        'checks/create' : handlers.checksCreate,
        'checks/edit' : handlers.checksEdit,
        'ping' : handlers.ping,
        'api/users' : handlers.users,
        'api/tokens' : handlers.tokens,
        'api/checks' : handlers.checks
    };

    // Init script
    server.init = () => {
        server.httpServer.listen(config.httpPort, () => {
            console.log(`server is listening on port ${config.httpPort} in ${config.envName} mode`);
        });

        
        server.httpsServer.listen(config.httpsPort, () => {
            console.log(`server is listening on port ${config.httpsPort} in ${config.envName} mode`);
        });
    };

    module.exports = server;