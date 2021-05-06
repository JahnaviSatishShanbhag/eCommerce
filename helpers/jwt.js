const { path } = require('dotenv/lib/env-options');
const expressJwt = require('express-jwt');

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            {url:/\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
            `${api}/users/login`,
            `${api}/users/register`
        ]
    });
}

function isRevoked(req, payload, done) {
    if (payload.isAdmin) {
        done();
    }
    else
    {
        if (req.method=='GET' && ['/api/v1/orders'].includes(req.url) || req.method=='PUT' && ['/api/v1/orders/:id'].includes(req.url)) {
            done(null,true);
        }
        else {

            done();
        }
    }
}

module.exports = authJwt;