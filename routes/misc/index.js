const router = require("express").Router();
const Link = require("../../mongodb/modals/links");
const Download = require("../../mongodb/modals/downloads");
const { driveFileExists } = require("../drive/main");

router.get("/links/getAll", async (req, res) => {
  Link.find({})
    .then((links) => {
      res.json(links);
    })
    .catch((err) => {
      res.sendStatus(500);
    });
});

router.post("/downloads/getAll", async (req, res) => {
  let k = {
    fileId,
    fileName,
    userId,
    date,
  };
});

module.exports = router;
