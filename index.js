require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const shortuid = require('short-unique-id')

const uuid = new shortuid({ length: 8 })

const mongourl = process.env.MONGO_URL;

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors());

async function main() {
  await mongoose.connect(mongourl).then(() => console.log('connected db'))
}
main();

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
})

const Url = new mongoose.model("Url", urlSchema);

const urlPattern = /^(http(s)?:\/\/)[\w.-]+(\.[a-zA-Z]{2,6})([-\w@:%_\+.~#?&//=]*)$/;

function isValidUrl(string) {
    return urlPattern.test(string);
}

// app.use((req, res)=>{
//   console.log("from middleware ", dns.lookup("https://3000-gouravg8-backendfccamp-l1onov7n3lw.ws-us115.gitpod.io"))
// })

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post("/api/shorturl", async (req, res) => {
  const { url } = req.body;
  if (!isValidUrl(url)) {
    return res.json({ error: 'invalid url' });
  }

  const short_url = Math.floor(Math.random() * 1000000 + 1000);
  try {
    await Url.create({ original_url: url, short_url });
    return res.json({ original_url: url, short_url });
  } catch (error) {
    console.log(error);
    return res.json({ error: "Database error" });
  }
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const { short_url } = req.params;

  try {
    const outurl = await Url.findOne({ short_url });
    if (outurl) {
      return res.redirect(outurl.original_url);
    } else {
      { error: 'invalid url' }
    }
  } catch (error) {
    return res.json({ error: "Database error" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
