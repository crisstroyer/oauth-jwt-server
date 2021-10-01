

module.exports.AuthMiddleware = (()=>{
    'use strict'
      
    const { AuthService } = require('../Services/Auth');

    /**
     * deny access
     * @param {*} res res object
     */
    let deny = (res)=>{
        res.status(401).jsonp({ code: 401, message: "Unauthorized"});
    }

    /**
     * set redirect action for authorization process
     * @param {*} res res object
     * @param {*} redirect_uri redirect uri for oauth client
     * @param {*} code authorization code
     */
    let redirect = (res, redirect_uri, code) =>{
        res.writeHead(302, {Location: redirect_uri + '?code=' + encodeURIComponent(code)});
        res.end();
    }

    /**
     * set approval response
     * @param {*} res res object
     * @param {*} access_token access_token for server
     */
    let approve = (res, access_token) => {
        res.status(200).jsonp({"access_token": access_token});
    }

    /**
     * get client authorization oauth
     * @param {*} req req object
     * @param {*} res response object
     * @param {*} getAuthClientsRef callback for get oauth clients list
     * @param {*} config General server config
     */
    let authorization = (req, res, getAuthClientsRef, config)=>{ 
        if(!req.signedCookies) throw new Error('Not cookie session, please login first');
        let userToken = req.signedCookies[config.cookie.name];
        let client = req.query.client_id && req.query.redirect_uri && userToken? 
            AuthService.getAuthorization(req.query.client_id, req.query.redirect_uri, getAuthClientsRef(), config.jwt): 
            null;

        client? redirect(res, client.redirect_uri, client.code): deny(res);        
    }

    /**
     * Get the server token once there is an access authorization
     * @param {*} req req object
     * @param {*} res response object
     * @param {*} getAuthClientsRef callback for get oauth clients list
     * @param {*} getTokenServerRef callback for get token server
     * @param {*} config General server config
     */
    let token = async (req, res, getAuthClientsRef, getTokenServerRef, config) => {
        let token = req.headers.code && req.headers.secret_pass && req.headers.client_id? 
            await AuthService.getTokenServer(req.headers.client_id, req.headers.code, req.headers.secret_pass, getAuthClientsRef(), config.jwt, getTokenServerRef): 
            null;

        token? approve(res, token): deny(res);
    }

    return {
        authorization: authorization,
        token: token
    }

})();