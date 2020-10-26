const jwt = require("jsonwebtoken");

exports.admin = (req, res, next) => {
  const accessToken = req.body.accessToken;
  if (!accessToken) {
    res.json({ error: "No access token sent to the server" });
  } else {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err)
        res.json({
          error: "Unauthorized Access",
          message: "No access token sent to the server",
        });
      //token verified so call next
      next();
    });
  }
};
