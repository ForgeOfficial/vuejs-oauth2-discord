# VueJs Oauth2 Discord
**VueJS v3 REQUIRED**


## `Installation`

`npm i vuejs-oauth2-discord`

## ```Exemples```

## In VueJs:
`Main.js`
```js
import { createApp } from 'vue'
import App from './App.vue'
import {initClient} from 'vuejs-oauth2-discord';

createApp(App).use(initClient, {
    host: `api.yourhost.xyz`,
    port: 80,
    ssl: true,
    withCredentials: true,
    path: '/discord',
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://yourhost.xyz/',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
    }
}).mount('#app');
```

`In Component`

```js
this.$login(`/redirection/test`, (response) => {
    console.log(response.data['isAuthenticated']) // true or false
    this.user = response.data['user']; // save user in session
    window.location.href = response.data['redirect']; // for redirect to page
})

this.$disconnect(() => {
    //callback

    window.location.href = "/"; // redirect to /
})
```


## In Server (expressJs):
`server.js`
```js
const
    express = require('express'),
    session = require('express-session'),
    passport = require('passport'),
    DiscordStrategy = require('passport-discord').Strategy,
    {Server} = require('vuejs-oauth2-discord');

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

const app = express();

passport.use(new DiscordStrategy({
    clientID: 'yourClientId',
    clientSecret: 'yourClientSecret',
    callbackURL: 'https://api.yourhost.xyz/discord/callback',
    scope: ['identify'],
    prompt: 'none'
}, async function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

app.use(passport.initialize());
app.use(passport.session());

// CONFIG ROUTES FOR OAUTH 2 DISCORD
new Server(app, `https://api.yourhost.xyz`, `https://yourhost.xyz`, "/discord");

require('http').createServer(app).listen(5000);
```