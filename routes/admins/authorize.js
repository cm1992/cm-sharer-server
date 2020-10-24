const jwt = require("jsonwebtoken");

exports.auth = async (accessToken) => {
  return new Promise((resolve, reject) => {
    if (!accessToken) {
      resolve({ error: "No access token sent to the server" });
    } else {
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err)
          resolve({
            error: "Unauthorized Access",
            message: "No access token sent to the server",
          });
        resolve({ authorized: true });
      });
    }
  });
};
