const router = require("express").Router();

const admin = require("./admin");
const users = require("./users");

router.use("/admin", admin);
router.use("/users", users);

module.exports = router;
