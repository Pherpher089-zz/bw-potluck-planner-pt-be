const Users = require("../../data/models/usersModel.js");
const restricted = require("../../auth/restricted-middleware.js");

const router = require("express").Router();

router.get("/all", (req, res) => {
  Users.getAllUsers()
    .then(users => res.json(users))
    .catch(err => res.status(500).json(err));
});

router.get("/:id", restricted, (req, res) => {
  const { id } = req.params;
  if (req.id == id) {
    Users.findById(id)
      .then(user => res.json(user))
      .catch(err => res.status(500).json(err));
  } else {
    res
      .status(401)
      .json({ message: "you are not authorized to see this user" });
  }
});

router.get("/by-potluck/:id", restricted, async (req, res) => {
  try {
    const { id } = req.params;
    let users = await Users.findByPotluckId(id);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
