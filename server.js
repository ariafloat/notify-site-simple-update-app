const express = require('express');
const fetch = require('node-fetch');
const datastore = require('nedb-promise');
const post = require('./src/post-msg');

const db = {};
db.luoxin = new datastore({ filename: '.data/luoxin.db', autoload: true });

const app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

const sites = [
  { name: 'luoxin', url: 'https://www.luoxin.cn/list.aspx?node=53', postName: 'Luoxin' }
];

async function getSiteHtml(siteName, url) {
  const fetchData = await fetch(url);
  const htmlText = await fetchData.text();
  return htmlText;
}

async function detectChange(siteName, latestHtmlText, postName, postUrl) {
  const pastData = await db[siteName].findOne({});
  if (pastData !== null) {
    const pastHtmlText = pastData.htmlText;
    if (latestHtmlText !== pastHtmlText) {
      post.slack(postName, postUrl);
      await db[siteName].remove({}, { multi: true });
      const doc = { htmlText: latestHtmlText };
      await db[siteName].insert(doc);
    }
  }
}

const start = function () {
  sites.forEach((site) => {
    getSiteHtml(site.name, site.url).then((latestHtmlText) => {
      detectChange(site.name, latestHtmlText, site.postName, site.url).catch(console.error);
    }).catch(console.error);
  });
};

setInterval(start, 60000);

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
