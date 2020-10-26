const router = require("express").Router();
const Link = require("../../mongodb/modals/links");
const Download = require("../../mongodb/modals/downloads");
const { driveFileExists } = require("../drive/main");
const auth = require("../../auth");

router.post("/getFile", async (req, res) => {
  const fileId = req.body.fileId;
  let exists = await Link.findOne({ fileId });
  console.log(exists);
  if (!fileId || !exists) {
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

router.post("/getAll", auth.admin, async (req, res) => {
  Link.find({})
    .then((links) => {
      console.log(links);
      res.json(links);
    })
    .catch((err) => {
      res.sendStatus(500);
    });
});

router.post("/downloadOne", async (req, res) => {
  const fileId = req.body.fileId;
  const userId = req.body.userId;
  try {
    let link = await Link.findOne({ fileId });
    link.downloads++;
    let download = new Download({
      fileId,
      fileName: link.fileName,
      userId,
      date: new Date(),
    });
    await download.save();
    await link.save();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.delete("/:id", auth.admin, (req, res) => {
  Link.deleteOne({ _id: req.params.id })
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      res.sendStatus(500);
    });
});

router.post("/search/:q", auth.admin, (req, res) => {
  const q = req.params.q || "";

  Link.find({ fileName: { $regex: q, $options: "i" } })
    .then((docs) => {
      console.log(docs);
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

module.exports = router;
