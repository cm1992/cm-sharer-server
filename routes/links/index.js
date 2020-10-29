const router = require("express").Router();
const Link = require("../../mongodb/modals/links");
const Download = require("../../mongodb/modals/downloads");
const { driveFileExists } = require("../drive/main");
const auth = require("../../auth");
const request = require("request");

router.post("/add/drive", auth.admin, async (req, res) => {
  const fileId = req.body.file.id;
  const fileName = req.body.file.name;
  let link = await Link.findOne({ fileId });
  if (!link) {
    let createdOn = new Date();
    link = new Link({
      fileId,
      fileName,
      type: "gdrive",
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

router.post("/add/yandex", auth.admin, async (req, res) => {
  const public_key = req.body.public_key;
  try {
    let link = await Link.findOne({ type: "yandex", public_key });
    if (link) {
      res.json({ message: "Link Already Generated for this file" });
    } else {
      console.log(public_key);
      request(
        "https://cloud-api.yandex.net/v1/disk/public/resources?public_key=" +
          public_key,
        function (error, response, body) {
          body = JSON.parse(body);
          console.log(body);
          if (error) {
            res.send({ message: "Could not generate Link", error });
          } else if (body.error) {
            res.send({ message: "File not found" });
          } else {
            link = new Link({
              public_key,
              slug: body.name,
              fileName: body.name,
              createdOn: new Date(),
              fileType: body.mime_type,
              size: body.size,
              type: "yandex",
              downloads: 0,
              DDL: body.file,
            });
            link
              .save()
              .then((result) => {
                res.json({ message: "Link was Added", slug: body.name });
              })
              .catch((error) => {
                res.json({ message: "error adding link" });
                console.log(error);
              });
          }
        }
      );
    }
  } catch (error) {
    res.json({ message: "Internal Server Error" });
  }
});

router.get("/yandex/:slug", auth.admin, (req, res) => {
  const slug = req.params.slug;
  Link.findOne({ slug })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {});
  console.log(slug);
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

router.get("/all", auth.admin, async (req, res) => {
  Link.find({})
    .then((links) => {
      console.log(links);
      res.json(links);
    })
    .catch((err) => {
      res.sendStatus(500);
    });
});

router.delete("/:id", auth.admin, (req, res) => {
  Link.deleteOne({ _id: req.params.id })
    .then(() => {
      res.sendStatus(204); //no content status code
    })
    .catch((err) => {
      res.sendStatus(500);
    });
});

router.get("/search/:q", auth.admin, (req, res) => {
  Link.find({ fileName: { $regex: req.params.q, $options: "i" } })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

module.exports = router;
