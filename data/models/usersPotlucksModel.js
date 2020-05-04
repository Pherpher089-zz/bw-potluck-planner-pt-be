const db = require("../knexConfig.js");

module.exports = {
  getAll,
  findById,
  insert,
  update,
  remove,
  findByUserIdAndPotluckId,
  findAdminPotlucks,
};

async function getAll() {
  return await db("usersPotlucks");
}

async function findById(id) {
  return await db("usersPotlucks")
    .where({ id: Number(id) })
    .first();
}

async function insert(record) {
  return await db("usersPotlucks").insert(record);
}

async function update(id, potluck) {
  return await db("usersPotlucks").where("id", Number(id)).update(potluck);
}

async function remove(id) {
  return await db("usersPotlucks").where("id", Number(id)).del();
}

async function findByUserIdAndPotluckId(userId, potluckId) {
  return await db("usersPotlucks")
    .where({ userId })
    .andWhere({ potluckId })
    .first();
}

async function findAdminPotlucks(userId) {
  return await db("usersPotlucks").where({ userId }).andWhere("role", 0);
}
