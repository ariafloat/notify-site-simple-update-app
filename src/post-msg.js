const fetch = require('node-fetch');

module.exports.slack = function (postName, postUrl) {
  const now = new Date();
  const postData = {
    channel: process.env.SLACK_CHANNEL,
    text: `【${postName}】\n"UPDATE Website"\n${now}\n${postUrl}`,
  };
  fetch(process.env.SLACK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  }).then(res => res.text()).then(console.log).catch(console.error);
}
