require('dotenv').config()
const express = require('express');
const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')
require('./mongodb')

const User = require('./mongodb/modals/user')

const app = express();
app.use(cors({ origin: "*" }))
app.use(morgan('tiny'));
app.use(bodyParser.json())

app.post('/api/v1/admin/login', async (req, res) => {

  if (!req.body.email || !req.body.password) {
    res.json({ authorized: false, error: "Provide all credentials." })
  } else {
    if (req.body.email.toLowerCase() !== process.env.ADMIN_LOGIN) {
      res.json({ authorized: false, error: "Admin Doesn't Exist" })
    } else if (req.body.password !== process.env.ADMIN_PASSW) {
      res.json({ authorized: false, error: "Password Incorrect" })
    } else {
      res.json({ authorized: true, error: null })
    }
  }

})

app.post('/api/v1/user/find', async (req, res) => {
  console.log(req.body);
  let _id = req.body.uid;
  let user = await User.findOne({ _id })
  if (!user) {
    let email = req.body.email;
    let username = req.body.username;
    let picture = req.body.picture;
    let joinedOn = new Date();
    user = new User({
      _id,
      username,
      email,
      picture,
      joinedOn
    })
    user.save().then((result) => {
      console.log(result);
      res.sendStatus(200)
    }).catch((err) => {
      console.log(err);
      res.sendStatus(500)
    });
  } else {
    console.log("user exists");
    res.sendStatus(200)
  }
})

app.get("/", (req,res) => {
  res.sendStatus(200)
})

let PORT = process.env.PORT || 4545
app.listen(PORT, () =>
  console.log(`⚡⚡ Server listening to port ${PORT} ⚡⚡`)
)
