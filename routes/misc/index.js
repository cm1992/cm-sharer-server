const router = require("express").Router();
const User = require("../../mongodb/modals/users");
const Link = require("../../mongodb/modals/links");
const Download = require("../../mongodb/modals/downloads");
const { auth } = require("../admins/authorize");

router.post("/downloads/getAll", async (req, res) => {
  let k = {
    fileId,
    fileName,
    userId,
    date,
  };
  try {
    let downloads = await Download.find({});
    res.json({ nbdownloads: downloads.length });
  } catch (error) {
    res.sen;
  }
});

router.get("/stats/getall/:accessToken", async (req, res) => {
  const accessToken = req.params.accessToken;
  if ((await auth(accessToken)).authorized) {
    try {
      let users = (await User.find({})).length;
      let links = (await Link.find({})).length;
      let downloads = (await Download.find({})).length;
      res.json({ users, links, downloads });
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(401);
  }
});

module.exports = router;
