const { render } = require('../lib/utils.js')

const SlackStrategy = require('@kehers/passport-slack').Strategy
const Slack = require('../models/slack.js')

const bugsnag = require('@bugsnag/js')
const bugsnagClient = bugsnag({ apiKey: process.env.BS_KEY, logger: null })

module.exports = (router, passport) => {
  passport.use('slack', new SlackStrategy({
    clientID: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    callbackURL: process.env.SLACK_CB,
    skipUserProfile: true,
    state: true
  }, (token, data, profile, done) => {
    if (token && data.team) {
      return done(null, {
        token: token,
        team: data.team
      })
    } else { return done('Error authenticating your Slack account.') }
  }))

  // New signup
  router.get('/auth', passport.authenticate('slack', {
    user_scope: ['channels:write', 'groups:write', 'im:write', 'mpim:write', 'channels:read', 'groups:read', 'im:read', 'mpim:read']
  }))
  router.get('/auth/cb', (req, res, next) => {
    passport.authenticate('slack', (err, profile) => {
      // console.log(err, profile)
      if (err || !profile.team || !profile.token || !profile.team.id) {
        req.flash('error', 'There has been an authentication error.' +
          ' Please try again later')

        bugsnagClient.notify(err)
        return res.redirect('/')
      }

      req.login(profile, err => {
        if (err) {
          req.flash('error', 'There has been a login error.' +
            ' Please try again later.')
        }

        return res.redirect('/archive')
      })
    })(req, res, next)
  })

  router.get('/', async (req, res) => {
    res.render('index', render(req))
  })

  // Archive
  router.get('/archive', async (req, res) => {
    if (!req.user || !req.user.token) { return res.redirect('/') }

    try {
      const channels = await Slack.getChannels(req.user.token)
      res.render('list-channels', render(req, {
        channels,
        title: req.user.team.name || 'Channels'
      }))
    } catch (e) {
      req.flash('error', 'There has been a error pulling your channels.')
      res.redirect('/')
    }
  })
  router.post('/archive', async (req, res) => {
    if (!req.user || !req.user.token) { return res.redirect('/') }

    try {
      await Slack.archiveChannels(req.user.token, req.body.channels)
      req.flash('info', 'Channels marked for archive. Sit back and expect the magic.')
    } catch (e) {
      console.log(e)
      req.flash('error', 'There has been a error pulling your channels.')
    }
    res.redirect('/')
  })

  // Logout
  router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
  })
}
