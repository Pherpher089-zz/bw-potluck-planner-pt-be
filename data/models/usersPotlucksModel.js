const db = require("../knexConfig.js");

module.exports = {
  getAll,
  findById,
  insert,
  update,
  remove
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
  return await db("usersPotlucks")
    .where("id", Number(id))
    .update(potluck);
}

async function remove(id) {
  return await db("usersPotlucks")
    .where("id", Number(id))
    .del();
}
