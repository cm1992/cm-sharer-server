const router = require("express").Router();

const admin = require("./admin");
const users = require("./users");
const drive = require("./drive");
const misc = require("./misc");

router.use("/admin", admin);
router.use("/users", users);
router.use("/drive", drive);
router.use("", misc);

module.exports = router;
