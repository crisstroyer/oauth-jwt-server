var express = require('express')
//Get oAuth Server Reference
const { Server }  = require('../index');

/*The use of jwt-simple and moment is only illustrative, you can choose the method that is most considered pertinent, 
in this case it is used to simulate the generation of the server token (identification of client requests for the rest api)*/
const jwt = require('jwt-simple');
const moment = require('moment');

let config = {
    jwt: {
        authCode: {
            secretPassword: 'RIJJQuDtUa7ksfSTcHGyNkZhN29snfTC',
            exp: 35, // minutos
            algorithm: 'HS512',
            unit: "days"
        }
    },
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
    getAuthClients: ()=>{
        return [{
            id: "l2mp/a5NDlMw1b9wQvIgg==", 
            name: "Market Place", 
            redirect_uri: "https://external/auth",
            secretPassword: "secret"
        }];
    },
    getTokenServer: ()=>{
        var payload = {
            sub: "1234",
            iat: moment().unix(),
            exp: moment().add(1, "days").unix(),
        };
        return jwt.encode(payload, "secretPassword", "HS512");
    }
};

let oAuthServer = Server(config);
var app = express();

app.use(oAuthServer.CookieParser);

app.get('/auth/login', function(req, res){
    oAuthServer.SetCookie(res, "1234");
    res.status(200).jsonp('ok');
});

app.get('/auth/authorization', oAuthServer.Authorization);

app.get('/auth/token', oAuthServer.Token);

app.listen(8086);