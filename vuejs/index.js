import axios from 'axios';

class Client {
    constructor() {
        this.vueOauth2DiscordConfig = {
            host: 'localhost',
            port: 5000,
            ssl: false,
            withCredentials: true,
            path: `/discord`,
            headers: {}
        }

        this.uri = this.generateURI();
    }

    init(app, vueOauth2DiscordConfig) {
        this.vueOauth2DiscordConfig = vueOauth2DiscordConfig;
        this.uri = this.generateURI();
        app.config.globalProperties.oauth2discord.login = this.login;
    }

    async login(component, redirectTo) {
        return new Promise((resolve, reject) => {
            axios.post(this.uri, {
                redirectTo: redirectTo ?? null
            }, {
                withCredentials: this.vueOauth2DiscordConfig.withCredentials,
                headers: this.vueOauth2DiscordConfig.headers
            }).then(response => {
                component.isAuthenticated = response.data['isAuthenticated'];

                if (response.data['isAuthenticated'])
                    component.user = response.data['user'];

                if (response.data['redirect'])
                    window.location.href = response.data['redirect'];
            }).catch(e => reject(e));

        })
    }

    generateURI() {
        return `http${this.vueOauth2DiscordConfig.ssl ? 's' : ''}://${this.vueOauth2DiscordConfig.host}${[80, 8080].includes(this.vueOauth2DiscordConfig.port) ? '' : `:${this.vueOauth2DiscordConfig.port}`}${this.vueOauth2DiscordConfig.path}`;
    }
}

module.exports = Client;