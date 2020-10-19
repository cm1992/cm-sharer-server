const router = require("express").Router();

const User = require("../../mongodb/modals/users");

router.post("/addOne", async (req, res) => {
  console.log(req.body);
  let _id = req.body.uid;
  let user = await User.findOne({ _id });
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
      joinedOn,
    });
    user
      .save()
      .then((result) => {
        console.log(result);
        res.sendStatus(200);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  } else {
    console.log("user exists");
    res.sendStatus(200);
  }
});

router.get("/getAll", async (req, res) => {
  User.find({})
    .sort("joinedOn")
    .exec(function (err, users) {
      if (err) {
        res.send({ err });
      }
      res.send({ users });
    });
});

module.exports = router;
