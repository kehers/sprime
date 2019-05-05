const got = require('got')
    , timeago = require("timeago.js")
    ;

exports.getChannels = async (token) => {
  try {
    const r = await got('https://slack.com/api/conversations.list', {
      query: {
        token: token,
        exclude_archived: true,
        types: 'public_channel',
        limit: 1000
      }, throwHttpErrors: false,
      json: true
    });

    const channels = r.body;
    if (!channels.channels)
      throw new Error('There has been an error getting your Slack channels');

    // Remove "General" channel
    channels.channels = channels.channels.filter(channel => {
      return !channel.is_general;
    })

    return channels.channels.map(channel => {
      channel.created = timeago.format(+channel.created * 1000);
      return {
        id: channel.id,
        name: channel.name,
        num_members: channel.num_members,
        created: channel.created
      }
    });
  }
  catch(e) {
    throw e;
  }
}

exports.archiveChannels = async (token, channels) => {
  try {
    const promises = [];
    for (channel of channels) {
      promises.push(got('https://slack.com/api/conversations.archive', {
        query: {
          token: token,
          channel: channel
        }, throwHttpErrors: false,
        json: true
      }));
    }

    return await Promise.all(promises);
  }
  catch(e) {
    console.log(e);
    throw e;
  }
}
