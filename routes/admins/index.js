const router = require("express").Router();
const bcrypt = require("bcrypt");
const Admin = require("../../mongodb/modals/admins");
const jwt = require("jsonwebtoken");
const { auth } = require("./authorize");

router.post("/authorize", async (req, res) => {
  const accessToken = req.body.accessToken;
  res.json(await auth(accessToken));
});

router.post("/login", async (req, res) => {
  const email = req.body.email,
    password = req.body.password;
  if (!email) {
    res.json({ authorized: false, message: "Please enter Email." });
  } else if (!password) {
    res.json({ authorized: false, message: "Please enter a password." });
  } else {
    try {
      let admin = await Admin.findOne({ email: email });
      if (!admin) {
        res.json({
          authorized: false,
          message: "This is not an admin email.",
        });
      } else {
        if (await bcrypt.compare(password, admin.password)) {
          const accessToken = jwt.sign(
            admin.email,
            process.env.ACCESS_TOKEN_SECRET
          );
          res.json({ authorized: true, error: null, accessToken });
        } else {
          res.json({
            authorized: false,
            message: "Password is incorrect.",
          });
        }
      }
    } catch (error) {
      res.sendStatus(500);
      console.log(error);
    }
  }
});

router.post("/add", async (req, res) => {
  const accessToken = req.body.accessToken,
    email = req.body.email,
    password = req.body.password;
  if (await auth(accessToken).authorized) {
    if (!email) {
      res.json({ result: false, message: "Please provide an Email." });
    } else if (!password) {
      res.json({ result: false, message: "Please enter a password." });
    } else if (
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        email
      )
    ) {
      res.json({ result: false, message: "Email is invalid" });
    } else if (password.length < 5) {
      res.json({ result: false, message: "Password have at least 5 chars." });
    } else {
      try {
        let admin = await Admin.findOne({ email: email });
        if (admin) {
          res.json({
            result: false,
            message: "This admin already exists.",
          });
        } else {
          const salt = await bcrypt.genSalt();
          const hashedPass = await bcrypt.hash(password, salt);
          admin = new Admin({
            email,
            password: hashedPass,
            addedOn: new Date(),
          });
          let newAdmin = await admin.save();
          res.json({
            result: true,
            message: "Admin '" + newAdmin.email + "' was just added.",
          });
        }
      } catch (error) {
        res.sendStatus(500);
        console.log(error);
      }
    }
  } else {
    res.sendStatus(401);
  }
});

router.post("/getProfile", async (req, res) => {
  const accessToken = req.body.accessToken;
  const email = req.body.email;
  if ((await auth(accessToken)).authorized) {
    Admin.findOne({ email })
      .then((admin) => {
        console.log(admin);
        res.json(admin);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(401);
  }
});

router.post("/update/username", async (req, res) => {
  const accessToken = req.body.accessToken;
  const email = req.body.email;
  const username = req.body.username;

  if (!accessToken) {
    res.send({
      error: "Unauthorized Access",
      message: "No access token sent to the server",
    });
  } else if (!username) {
    res.send({
      error: "Username Not Provided",
    });
  } else if (!email) {
    res.send({
      error: "Email Missing",
    });
  } else {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err)
        return res.send({
          error: "Unauthorized Access",
          message: "No access token sent to the server",
        });
      Admin.updateOne({ email }, { username })
        .then((admin) => {
          res.sendStatus(200);
        })
        .catch((err) => {
          console.log(err);
          res.sendStatus(500);
        });
    });
  }
});

router.post("/update/password", (req, res) => {
  const accessToken = req.body.accessToken;
  const email = req.body.email;
  const oldPassw = req.body.oldPassw;
  const newPassw = req.body.newPassw;
  if (!accessToken) {
    res.json({
      error: "Unauthorized Access",
      message: "No access token sent to the server",
    });
  } else if (!oldPassw) {
    res.json({
      error: "Please enter old password",
    });
  } else if (!newPassw) {
    res.json({
      error: "Please enter new password",
    });
  } else {
    jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, user) => {
        if (err)
          return res.json({
            error: "Unauthorized Access",
            message: "No access token sent to the server",
          });

        try {
          let admin = await Admin.findOne({ email: email });
          if (!admin) {
            res.json({
              error: "This is not an admin email.",
            });
          } else {
            if (await bcrypt.compare(oldPassw, admin.password)) {
              const salt = await bcrypt.genSalt();
              const hashedPass = await bcrypt.hash(newPassw, salt);
              Admin.updateOne({ email }, { password: hashedPass })
                .then((result) => {
                  res.sendStatus("OK");
                })
                .catch((err) => {
                  res.json({
                    error:
                      "Password could not be updated. Please Try again later.",
                  });
                });
            } else {
              res.json({
                error: "Password is incorrect.",
              });
            }
          }
        } catch (error) {
          res.sendStatus(500);
          console.log(error);
        }
      }
    );
  }
});

module.exports = router;
