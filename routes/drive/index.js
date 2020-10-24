const router = require("express").Router();
const Link = require("../../mongodb/modals/links");

router.post("/addFile", async (req, res) => {
  const fileId = req.body.file.id;
  const fileName = req.body.file.name;
  let link = await Link.findOne({ fileId });
  if (!link) {
    let createdOn = new Date();
    link = new Link({
      fileId,
      fileName,
      createdOn,
      downloads: 0,
    });
    link
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
    res.json({ message: "Link already generated for this file." });
  }
});

module.exports = router;
