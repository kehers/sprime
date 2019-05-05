require('dotenv').config();
const express = require('express')
    , Liquid = require('liquidjs')
    , engine = new Liquid()
    , session = require('express-session')
    , FileStore = require('session-file-store')(session)
    , bodyParser = require('body-parser')
    , path = require('path')
    , flash = require('flash')
    , compression = require('compression')
    , favicon = require('serve-favicon')
    , helmet = require('helmet')

    , passport = require('passport')

    , bugsnag = require('@bugsnag/js')
    , bugsnagExpress = require('@bugsnag/plugin-express')
    , bugsnagClient = bugsnag({apiKey: process.env.BS_KEY, logger: null})
    ;

bugsnagClient.use(bugsnagExpress);
const bsmiddleware = bugsnagClient.getPlugin('express');

// Config
const app = express();
app.listen(process.env.PORT || 3000);

// Middlewares
app.use(bsmiddleware.requestHandler);
app.use(bsmiddleware.errorHandler);
app.use(helmet());
app.use(session({
    store: new FileStore(),
    secret: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));
app.engine('liquid', engine.express());
app.set('view engine', 'liquid');
app.set('views', __dirname + '/views');
app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')));
app.use(flash());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/static'));
app.use(passport.initialize());
app.use(passport.session());

// Routes
require('./routes/main.js')(app, passport);

// No matching route
app.use((req, res, next) => {
  res.status(404)
    .send('Page not found.');
});
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.end();
});

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
