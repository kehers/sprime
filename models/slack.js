const got = require('got')
const timeago = require('timeago.js')

exports.getChannels = async (token) => {
  const r = await got('https://slack.com/api/conversations.list', {
    query: {
      token: token,
      exclude_archived: true,
      types: 'public_channel',
      limit: 1000
    },
    throwHttpErrors: false,
    json: true
  })

  const channels = r.body
  if (!channels.channels) { throw new Error('There has been an error getting your Slack channels') }

  // Remove "General" channel
  channels.channels = channels.channels.filter(channel => {
    return !channel.is_general
  })

  return channels.channels.map(channel => {
    channel.created = timeago.format(+channel.created * 1000)
    return {
      id: channel.id,
      name: channel.name,
      num_members: channel.num_members,
      created: channel.created
    }
  })
}

exports.archiveChannels = async (token, channels) => {
  const promises = []
  for (const channel of channels) {
    promises.push(got('https://slack.com/api/conversations.archive', {
      query: {
        token: token,
        channel
      },
      throwHttpErrors: false,
      json: true
    }))
  }

  return Promise.all(promises)
}
