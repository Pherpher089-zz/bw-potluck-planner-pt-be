require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secrets = process.env.JWT_SECRET || "lambda";
const Users = require("../data/models/usersModel.js");
const router = require("express").Router();

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    secrets,
    {
      expiresIn: "1h"
    }
  );
}

router.post("/register", (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;

  Users.insert(user)
    .then(saved => {
      const token = generateToken(saved);

      res.status(201).json({
        message: `welcome ${saved.firstName}, u are now registered`
      });
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

router.post("/login", (req, res) => {
  let { email, password } = req.body;

  Users.findByEmail(email)
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);

        res.status(200).json({
          message: `hello again ${user.firstName}, u are now logged in`,
          authToken: token
        });
      } else {
        res.status(401).json({ message: "invalid Credentials" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

module.exports = router;