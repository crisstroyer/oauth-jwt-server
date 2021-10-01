# oauth-jwt-server
[![npm Version][npm-image]][npm-url]
[![npm Downloads][downloads-image]][downloads-url]
[![MIT Licensed][license-image]][license-url]

Complete, compliant and well tested module for implementing an OAuth2 server with [JWT(JSON Web Token)](http://self-issued.info/docs/draft-jones-json-web-token.html) token in [Node.js](https://nodejs.org).

The *oauth-jwt-server* module is officially supported wrappers available for popular HTTP server framework [Express](https://npmjs.org/package/express-oauth-server) 

## Install

    $ npm install oauth-jwt-server

## Usage

```javascript
var express = require('express')
//Get oAuth Server Reference
const { Server }  = require('../index');

/*The use of jwt-simple and moment is only illustrative, you can choose the method that is most considered pertinent, 
in this case it is used to simulate the generation of the server token (identification of client requests for the rest api)*/
const jwt = require('jwt-simple');
const moment = require('moment');

let oAuthServer = Server(config);
var app = express();

//Cookie parser for oAuth Server Identification Access
app.use(oAuthServer.CookieParser);

//endpoint to manage the User Session
app.get('/auth/login', function(req, res){
    //Set de reference user cookie for oAuth identification access
    oAuthServer.SetCookie(res, "1234");
    res.status(200).jsonp('ok');
});

/*In OAuth, the client requests access to resources controlled by the resource owner 
and hosted by the resource server and is issued a different set of credentials than 
those of the resource owner. Instead of using the resource owner's credentials to access protected resources, 
the client obtains an access token--a string denoting a specific scope, lifetime, 
and other access attributes. Access tokens are issued to third-party clients by an 
authorization server with the approval of the resource owner. */
app.get('/auth/authorization', oAuthServer.Authorization);

/*Requesting tokens with a grant
JWT bearer assertion -- a signed JSON Web Token (JWT), issued by a third-party token service (STS) or issued by the client itself, to obtain an access and / or ID token.
*/
app.get('/auth/token', oAuthServer.Token);

app.listen(80);
```

### config params

```javascript
let config = {
    /*Jwt Config for authorization code*/
    jwt: {
        authCode: {
            secretPassword: 'RIJJQuDtUa7ksfSTcHGyNkZhN29snfTC',
            exp: 35,
            algorithm: 'HS512',
            unit: "days"
        }
    },
    /*oauth cookie config for aurhorization access*/
    cookie:  {
        name: "SSID_OAUTH",
        secretPassword : "thebest",
        conf: {
            httpOnly: true,     // to disable accessing cookie via client side js
            secure: true,       // to force https (if you use it)
            maxAge: 1000000000, // ttl in ms (remove this option and cookie will die when browser is closed)
            signed: true        // if you use the secret with cookieParser
        }
    },
    /*reference to the function that returns the configuration of oauth clients registered in your system, 
    it must return a list with the following parameters*/
    getAuthClients: ()=>{
        //Get de oauth client list
        return [{
            id: "l2mp/a5NDlMw1b9wQvIgg==", 
            name: "Market Place", 
            redirect_uri: "https://external/auth",
            secretPassword: "secret"
        }];
    },
    /*each rest api uses a unique identification to generate the access authorization (jwt), 
    this function allows assigning any type of token once the authorization has been processed*/
    getTokenServer: ()=>{
        //Example for jwt token
        var payload = {
            sub: "1234",
            iat: moment().unix(),
            exp: moment().add(1, "days").unix(),
        };
        return jwt.encode(payload, "secretPassword", "HS512");
    }
};
```

## Features

- Supports `authorization_code`, `client_credentials`, `refresh_token` and `password` grant, as well as *extension grants*
- Can be used with *promises*, *Node-style callbacks*, *ES6 generators* and *async*/*await*
- Fully [RFC 6749](https://tools.ietf.org/html/rfc6749.html) and [RFC 6750](https://tools.ietf.org/html/rfc6750.html) compliant.

### Jwt Algorithms
By default the algorithm to encode is `HS256`.
The supported algorithms for encoding and decoding are `HS256`, `HS384`, `HS512` and `RS256`.

[npm-image]: https://img.shields.io/npm/v/oauth-jwt-server.svg
[npm-url]: https://npmjs.org/package/oauth-jwt-server
[downloads-image]: https://img.shields.io/npm/dm/oauth-jwt-server.svg
[downloads-url]: https://npmjs.org/package/oauth-jwt-server
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://raw.githubusercontent.com/crisstroyer/node-oauth-jwt-server/master/LICENSE