const jwt = require("jsonwebtoken");
const secrets = process.env.JWT_SECRET || "lambda";

module.exports = (req, res, next) => {
  const token = req.headers.auth;

  if (token) {
    jwt.verify(token, secrets, (err, payload) => {
      if (err) {
        res.status(403).json({ message: "token not authorized" });
      } else {
        req.id = payload.id;
        next();
      }
    });
  } else {
    res.status(400).json({ message: "no creds provided" });
  }
};
