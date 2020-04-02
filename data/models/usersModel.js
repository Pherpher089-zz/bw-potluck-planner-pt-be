const db = require("../knexConfig.js");

module.exports = {
  insert,
  update,
  remove,
  findById,
  findByEmail,
  findByPotluckId,
  getAllUsers
};

async function remove(id) {
  return await db("users")
    .where("id", Number(id))
    .del();
}

async function getAllUsers() {
  return await db("users");
}

async function findById(id) {
  return await db("users")
    .where({ id: Number(id) })
    .first();
}

async function findByEmail(email) {
  return await db("users")
    .where({ email })
    .first();
}

async function findByPotluckId(id) {
  return await db("users")
    .innerJoin("usersPotlucks", "usersPotlucks.userId", "users.id")
    .where("potluckId", Number(id));
}

async function insert(record) {
  return await db("users").insert(record);
}

async function update(id, record) {
  return await db("users")
    .where("id", Number(id))
    .update(record);
}
