const axios = require('axios');

let VueOauth2DiscordConfig = {
    host: 'localhost',
    port: 5000,
    ssl: false,
    withCredentials: true,
    path: `/discord`,
    headers: {}
}

let uri = generateURI();

async function login(redirectTo, callback) {
    return new Promise((resolve, reject) => {
        axios.post(`${uri}/login`, {
            redirectTo: redirectTo || null
        }, {
            withCredentials: VueOauth2DiscordConfig.withCredentials,
            headers: VueOauth2DiscordConfig.headers
        }).then(response => {
            callback(response);
            resolve();
        }).catch(e => reject(e));

    })
}

module.exports.login = login;

module.exports.initClient = function initClient(app, vueOauth2DiscordConfig) {
    if (vueOauth2DiscordConfig)
        VueOauth2DiscordConfig = vueOauth2DiscordConfig;
    uri = generateURI();
    app.config.globalProperties.$login = login;
}

function generateURI() {
    return `http${VueOauth2DiscordConfig.ssl ? 's' : ''}://${VueOauth2DiscordConfig.host}${[80, 8080].includes(VueOauth2DiscordConfig.port) ? '' : `:${VueOauth2DiscordConfig.port}`}${VueOauth2DiscordConfig.path}`;
}

module.exports.Server = class Server {

    constructor(app, apiHost, webHost, path) {
        this.apiHost = apiHost;
        this.path = path || '/discord';
        app.post(`${this.path}/login`, (req, res) => {
            const {redirectTo} = req.body;
            if (!req.isAuthenticated())
                return res.status(200).send({
                    isAuthenticated: false,
                    redirect: `${this.apiHost}${this.path}${redirectTo ? `?redirectTo=${redirectTo}` : ''}`
                })
            if (!req.user) return res.status(200).send({
                isAuthenticated: false,
                redirect: `${this.apiHost}${this.path}${redirectTo ? `?redirectTo=${redirectTo}` : ''}`
            })
            res.status(200).send({
                isAuthenticated: true,
                user: req.user
            })
        })

        app.get(this.path, function(req, res, next) {
            req.session.redirectTo = req.query['redirectTo'];
            app.passport.authenticate('discord', {scope: ['identify'], prompt: 'none'})(req, res, next);
        });

        app.get(`${this.path}/callback`, app.passport.authenticate('discord', { failureRedirect: '/'}), function(req, res) {
            const redirectTo = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            res.redirect(`${webHost}${redirectTo}`)
        });

        app.post(`${this.path}/disconnect`, function(req, res) {
            req.logout();
            res.send();
        });
    }

}