require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(bodyParser.urlencoded({ extended: false }));
// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

const shorturls = {};
app.post('/api/shorturl', body('url').isURL(),
  function (req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ error: 'invalid url' })
    }
    else {
      dns.lookup(req.body.url, (err, address) => {
        if (err.code !== 'ENOTFOUND') { res.json({ error: 'invalid hostname' }) }
        else {
          if (Object.values(shorturls).includes(req.body.url)) {
            Object.getOwnPropertyNames(shorturls).forEach(item => {
              if (shorturls[item] == req.body.url) {
                var short = item;
                res.json({ original_url: req.body.url, short_url: short })
              }
            })
          }
          else {
            var short = Object.keys(shorturls).length + 1
            shorturls[short] = req.body.url

            res.json({ original_url: req.body.url, short_url: short })
          }
        }
      })

    }

    console.log(shorturls)
  })
app.get('/api/shorturl/:code', (req, res) => {
  res.redirect(shorturls[req.params.code]);
})
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
