const restricted = require("../../auth/restricted-middleware.js");
const Potlucks = require("../../data/models/potlucksModel.js");
const UsersPotlucks = require("../../data/models/usersPotlucksModel.js");
const Users = require("../../data/models/usersModel.js");
const PotluckRequirements = require("../../data/models/potluckRequirementsModel.js");
const Food = require("../../data/models/foodModel.js");

const router = require("express").Router();

module.exports = router;

router.post("/", restricted, async (req, res) => {
  try {
    let newPotluck = req.body;
    console.log(newPotluck);
    let {
      locationName,
      locationAddress,
      locationStreet,
      locationUnit,
      locationState,
      locationCity,
      locationCountry,
      locationPostcode,
    } = req.body;
    if (
      !locationName ||
      !locationAddress ||
      !locationStreet ||
      !locationUnit ||
      !locationState ||
      !locationCity ||
      !locationCountry ||
      !locationPostcode
    ) {
      res.status(400).json({
        message:
          "please provide a name, address, street, state, city, country and postalcode",
      });
    }
    await Potlucks.insert(newPotluck);
    let savedPotluck = await Potlucks.findByLocation(locationName);

    const newRelationship = {
      userId: req.id,
      potluckId: savedPotluck.id,
      role: 0,
      attendance: 2,
    };
    await UsersPotlucks.insert(newRelationship);
    let savedRelationship = await UsersPotlucks.findByUserIdAndPotluckId(
      req.id,
      savedPotluck.id
    );

    res.status(200).json([savedPotluck, savedRelationship]);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/", restricted, async (req, res) => {
  try {
    let potlucks = await Potlucks.findMyPotlucks(req.id);
    res.status(200).json(potlucks);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/:id", restricted, async (req, res) => {
  try {
    let potluckId = req.params.id;
    let potluck = await Potlucks.findById(potluckId);
    res.status(200).json(potluck);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/user/add", restricted, async (req, res) => {
  try {
    let { potluckId, role, email } = req.body;
    if (!potluckId || !role || !email) {
      res.status(400).json({
        message:
          "please provide a the potluckId of the potluck to add, as well as user's email and role",
      });
    }
    let user = await Users.findByEmail(email);
    let toInsert = {
      userId: user.id,
      potluckId,
      role,
      attendance: 2,
    };
    await UsersPotlucks.insert(toInsert);
    res.status(200).json(toInsert);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/user/remove", restricted, async (req, res) => {
  try {
    let { potluckId, userId } = req.body;
    if (!userId) {
      res.status(400).json({
        message: " Please provide a valid userId",
      });
    }
    if (!potluckId) {
      res.status(400).json({
        message: " Please provide a valid potluckId",
      });
    }
    let user = await UsersPotlucks.findByUserIdAndPotluckId(userId, potluckId);
    await UsersPotlucks.remove(user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/mine", restricted, async (req, res) => {
  try {
    let potlucks = await Potlucks.findAdminPotlucks(req.id);
    res.status(200).json(potlucks);
  } catch (error) {
    res.status(500).error;
  }
});

router.post("/reqs/:id", restricted, async (req, res) => {
  let potluckId = req.params.id;
  let { foodCategory, foodDescription, servings, fufilled } = req.body;
  try {
    let response = {
      potluckId,
      foodCategory,
      foodDescription,
      servings,
      fufilled,
    };
    await PotluckRequirements.insert(response);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).error;
  }
});

router.put("/reqs/:id", restricted, async (req, res) => {
  let reqId = req.params.id;
  let fufilled = req.id;
  let { potluckId, foodCategory, foodDescription, servings } = req.body;
  try {
    let response = {
      potluckId,
      foodCategory,
      foodDescription,
      servings,
      fufilled,
    };
    let resp = await PotluckRequirements.update(reqId, response);
    res.status(200).json(resp);
  } catch (error) {
    res.status(500).error;
  }
});

router.get("/reqs/:id", restricted, async (req, res) => {
  let potluckId = req.params.id;
  console.log(potluckId);
  try {
    const response = await PotluckRequirements.getByPotluckId(potluckId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});
router.delete("/reqs/:id", restricted, async (req, res) => {
  let reqId = req.params.id;
  try {
    await PotluckRequirements.remove(reqId);
    res
      .status(200)
      .json({ message: `Potluck requirement ${reqId} has been removed` });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put("/:id", restricted, async (req, res) => {
  let id = req.params.id;
  console.log(id);
  try {
    let potluck = await Potlucks.findById(id);
    let relationship = await UsersPotlucks.findByUserIdAndPotluckId(req.id, id);
    if (!potluck) {
      res.status(404).json({
        message: "no such potluck",
      });
    } else if (relationship && relationship.role === 0) {
      await Potlucks.update(id, req.body);
      let updatedPotluck = await Potlucks.findById(id);
      res.status(200).json(updatedPotluck);
    } else {
      res.status(400).json({
        message:
          "you are not an organizer of this potluck, so you cannot edit it",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/:id", restricted, async (req, res) => {
  let id = req.params.id;
  try {
    let potluck = await Potlucks.findById(id);
    let relationship = await UsersPotlucks.findByUserIdAndPotluckId(req.id, id);
    if (!potluck) {
      res.status(404).json({
        message: "no such potluck",
      });
    } else if (relationship && relationship.role === 0) {
      await Potlucks.remove(id);
      res.status(200).json(potluck);
    } else {
      res.status(400).json({
        message:
          "you are not an organizer of this potluck, so you cannot delete it",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/items/:id", restricted, async (req, res) => {
  let id = req.params.id;
  try {
    let items = await Food.getByPotluckId(id);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/items/:id", restricted, async (req, res) => {
  let id = req.params.id;
  let userId = req.id;
  let { foodCategory, foodDescription, servings } = req.body;

  let newRecord = {
    userId: userId,
    potluckId: id,
    foodCategory: foodCategory,
    foodDescription: foodDescription,
    servings: servings,
  };
  try {
    let item = await Food.insert(newRecord);
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json(error);
  }
});
