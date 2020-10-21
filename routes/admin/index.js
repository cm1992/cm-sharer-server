const router = require("express").Router();
const jwt = require("jsonwebtoken");

router.post("/authenticate", (req, res) => {
  const accessToken = req.body.accessToken;
  console.log(accessToken);
  if (!accessToken) {
    res.send({ error: "no token sent" });
  } else {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.send({ error: "unauthorized" });
      res.send({ authorized: true });
    });
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
