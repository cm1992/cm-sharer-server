const router = require("express").Router();
const { driveFileExists } = require("./main");
const Link = require("../../mongodb/modals/links");

router.post("/getFile", async (req, res) => {
  const fileId = req.body.fileId;
  if (!fileId) {
    res.json({ fileExists: false });
  } else {
    try {
      let data = await driveFileExists(fileId);
      if (data && data.result) {
        res.json({
          fileExists: true,
          file: data.result,
        });
      } else {
        res.json({ fileExists: false });
      }
    } catch (error) {
      res.sendStatus(500);
      console.log(error);
    }
  }
});

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
