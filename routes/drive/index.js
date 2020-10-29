const router = require("express").Router();
const { driveFileExists } = require("../drive/main");

router.post("/verifFile", async (req, res) => {
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

module.exports = router;
