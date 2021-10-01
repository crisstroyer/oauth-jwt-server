/**
 * Get oAuthServer
 * @param {*} config general config object
 * @returns 
 */
module.exports.Server = function(config){
    'use strict'

    const cookieParser = require('cookie-parser');
    const { AuthMiddleware } = require('./src/Middleware/Auth');
    const { AuthService } = require('./src/Services/Auth');

    return {
        Authorization: (req, res, next) => AuthMiddleware.authorization(req, res, config.getAuthClients, config),
        Token: (req, res, next)=> AuthMiddleware.token(req, res, config.getAuthClients, config.getTokenServer, config),
        CookieParser: cookieParser(config.cookie.secretPassword),
        SetCookie: (res, jwtToken) => res.cookie(config.cookie.name, jwtToken, config.cookie.conf),
        getJwtToken: AuthService.getJwtToken
    }
};
