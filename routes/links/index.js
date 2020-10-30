const router = require("express").Router();
const Link = require("../../mongodb/modals/links");
const Download = require("../../mongodb/modals/downloads");
const auth = require("../../auth");
const request = require("request");

router.post("/add/drive", auth.admin, async (req, res) => {
  const fileId = req.body.id;
  const fileName = req.body.name;
  let link = await Link.findOne({ fileId });
  if (!link) {
    let createdOn = new Date();
    link = new Link({
      fileId,
      fileName,
      slug: encodeURI(fileName.replace(/[ \{\[\}\]]/g, "-")).toLowerCase(),
      type: "gdrive",
      createdOn,
      downloads: 0,
    });
    link
      .save()
      .then(() => {
        res.json({
          message: "Link successfully generated for this file.",
          slug: encodeURI(fileName.replace(/[ \{\[\}\]]/g, "-")).toLowerCase(),
        });
      })
      .catch((err) => {
        res.json({
          message: "Internal Server Error.",
        });
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
      request(
        "https://cloud-api.yandex.net/v1/disk/public/resources?public_key=" +
          public_key,
        function (error, response, body) {
          body = JSON.parse(body);
          if (error) {
            res.send({ message: "Could not generate Link", error });
          } else if (body.error) {
            res.send({ message: "File not found" });
          } else {
            link = new Link({
              public_key,
              slug: encodeURI(
                body.name.replace(/[ \{\[\}\]]/g, "-")
              ).toLowerCase(),
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
                res.json({
                  message: "Link was Added",
                  slug: encodeURI(
                    body.name.replace(/[ \{\[\}\]]/g, "-")
                  ).toLowerCase(),
                });
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

router.get("/drive/:id", auth.admin, async (req, res) => {
  const fileId = req.params.id;
  let link = await Link.findOne({ fileId });
  if (!fileId || !link) {
    res.json({ fileExists: false });
  } else {
    res.json({ fileExists: true, ...link._doc });
  }
});

router.get("/:type", auth.admin, async (req, res) => {
  Link.find({ type: req.params.type })
    .then((links) => {
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

router.post("/search", auth.admin, (req, res) => {
  console.log(req.body);
  Link.find({
    fileName: { $regex: req.body.q, $options: "i" },
    type: req.body.type,
  })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

module.exports = router;
