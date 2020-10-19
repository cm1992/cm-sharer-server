const router = require("express").Router();
const jwt = require("jsonwebtoken");

router.post("/authenticate", (req, res) => {
  const accessToken = req.body;
  if (!accessToken) {
    res.send({ error: "unauthorized" });
  } else {
    res.send({ authorized: true });
  }
});

router.post("/login", async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.json({ authorized: false, error: "Provide all credentials." });
  } else {
    if (req.body.email.toLowerCase() !== process.env.ADMIN_LOGIN) {
      res.json({ authorized: false, error: "Admin Doesn't Exist" });
    } else if (req.body.password !== process.env.ADMIN_PASSW) {
      res.json({ authorized: false, error: "Password Incorrect" });
    } else {
      const admin = {
        username: req.body.username,
        password: req.body.password,
      };
      const accessToken = jwt.sign(admin, process.env.ACCESS_TOKEN_SECRET);
      res.json({ authorized: true, error: null, accessToken });
    }
  }
});

module.exports = router;
