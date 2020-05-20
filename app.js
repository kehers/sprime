require('dotenv').config()
const express = require('express')
const Liquid = require('liquidjs')
const engine = new Liquid()
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const bodyParser = require('body-parser')
const path = require('path')
const flash = require('flash')
const compression = require('compression')
const favicon = require('serve-favicon')
const helmet = require('helmet')
const passport = require('passport')

const bugsnag = require('@bugsnag/js')
const bugsnagExpress = require('@bugsnag/plugin-express')
const bugsnagClient = bugsnag({ apiKey: process.env.BS_KEY, logger: null })

bugsnagClient.use(bugsnagExpress)
const bsmiddleware = bugsnagClient.getPlugin('express')

// Config
const app = express()
app.listen(process.env.PORT || 3000)

// Middlewares
app.use(bsmiddleware.requestHandler)
app.use(bsmiddleware.errorHandler)
app.use(helmet())
app.use(session({
  store: new FileStore(),
  secret: process.env.KEY,
  resave: false,
  saveUninitialized: false
}))
app.engine('liquid', engine.express())
app.set('view engine', 'liquid')
app.set('views', path.join(__dirname, '/views'))
app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')))
app.use(flash())
app.use(compression())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '/static')))
app.use(passport.initialize())
app.use(passport.session())

// Routes
require('./routes/main.js')(app, passport)

// No matching route
app.use((req, res, next) => {
  res.status(404)
    .send('Page not found.')
})
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.end()
})

passport.serializeUser((user, done) => {
  done(null, user)
})
passport.deserializeUser((user, done) => {
  done(null, user)
})
