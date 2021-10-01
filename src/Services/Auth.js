

module.exports.AuthService = (()=>{
    'use strict'
      
    const jwt = require('jwt-simple');
    const moment = require('moment');

    /**
     * index list key value
     * @param {*} clients oauth client list
     * @returns 
     */
    let index = (clients)=>{
        return clients.reduce((acc, curr)=> (acc[curr.id] = curr, acc), {});
    }

    /**
     * get jwt token
     * @param {*} sub token id
     * @param {*} secretPassword secret password
     * @param {*} algorithm algorithm
     * @param {*} exp time exp
     * @param {*} unit unit time exp 'days'
     * @returns 
     */
    let getJwtToken = (sub, secretPassword, algorithm, exp, unit)=>{
        var payload = {
            sub: sub,
            iat: moment().unix(),
            exp: moment().add(exp, unit).unix(),
        };
        return jwt.encode(payload, secretPassword, algorithm);
    }

    /**
     * decode a jwt token
     * @param {*} token jwt token
     * @param {*} secretPassword secret password for token
     * @param {*} algorithm algorithm ''
     * @returns 
     */
    let decodeJwtToken = (token, secretPassword, algorithm) => {
        return jwt.decode(token, secretPassword, false, algorithm);
    }

    /**
     * validate if the jwt token is valid
     * @param {*} token jwt token
     * @param {*} jwtConfig jwt token config
     * @returns 
     */
    let isTokenValid = (token, jwtConfig)=>{
        let payload;
        try{
            payload = decodeJwtToken(token, jwtConfig.secretPassword, jwtConfig.algorithm);
        }catch(e){
            payload = null;
        }        

        return payload? payload.exp > moment().unix(): false;
    }

    /**
     * get authorization token code
     * @param {*} sub Sub Id for user logged
     * @param {*} jwtConfig Jwt config for authorization code
     * @returns 
     */
    let getAuthCode = (sub, jwtConfig)=>{
        return getJwtToken(sub, jwtConfig.secretPassword, jwtConfig.algorithm, jwtConfig.exp, jwtConfig.unit);
    }    

    /**
     * get client authorization oauth
     * @param {*} clientId Unique Client Id
     * @param {*} redirectUri Client Redirection Uri
     * @param {*} authClients oAuth Client List
     * @param {*} jwtConfig Basic config for jwt token for authorization code
     * @returns 
     */
    let getAuthorization = (clientId, redirectUri, authClients, jwtConfig) => {
        const clients = index(authClients);
        let client = clients[clientId] || {redirect_uri: null};
        let result = client.redirect_uri == redirectUri? {redirect_uri: redirectUri, code: getAuthCode(clientId, jwtConfig.authCode)}: null;
        return result;
    }

    /**
     * Get the server token once there is an access authorization
     * @param {*} clientId Unique Client Id
     * @param {*} code Authorization Code
     * @param {*} secretPassword Secret Password for oAuth client
     * @param {*} authClients oAuth Client List
     * @param {*} jwtConfig Basic Config for jwt token for authorization Code
     * @param {*} getTokenServer Callback function for get token jwt from server
     * @returns 
     */
    let getTokenServer = async function(clientId, code, secretPassword, authClients, jwtConfig, getTokenServer){
        const clients = index(authClients);
        let client = clients[clientId] || { secretPassword: null };
        let token = isTokenValid(code, jwtConfig.authCode) && secretPassword && client.secretPassword == secretPassword? 
            await getTokenServer(): 
            null;

        return token;
    }
    
    return {
        getAuthorization: getAuthorization,
        getTokenServer: getTokenServer,
        getJwtToken: getJwtToken
    }
})();