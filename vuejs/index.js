import axios from 'axios';

let VueOauth2DiscordConfig = {
    host: 'localhost',
    port: 5000,
    ssl: false,
    withCredentials: true,
    path: `/discord`,
    headers: {}
}

let uri = generateURI();

export async function login(component, redirectTo) {
    return new Promise((resolve, reject) => {
        axios.post(uri, {
            redirectTo: redirectTo ?? null
        }, {
            withCredentials: VueOauth2DiscordConfig.withCredentials,
            headers: VueOauth2DiscordConfig.headers
        }).then(response => {
            component.isAuthenticated = response.data['isAuthenticated'];

            if (response.data['isAuthenticated'])
                component.user = response.data['user'];

            if (response.data['redirect'])
                window.location.href = response.data['redirect'];
        }).catch(e => reject(e));

    })
}

export default function (app, vueOauth2DiscordConfig) {
    VueOauth2DiscordConfig = vueOauth2DiscordConfig;
    uri = generateURI();
    app.config.globalProperties.oauth2discord.login = login;
}

function generateURI() {
    return `http${VueOauth2DiscordConfig.ssl ? 's' : ''}://${VueOauth2DiscordConfig.host}${[80, 8080].includes(VueOauth2DiscordConfig.port) ? '' : `:${VueOauth2DiscordConfig.port}`}${VueOauth2DiscordConfig.path}`;
}