const User = require("../models/user.model");
const userService = require("../services/user.service");

const Users = [];

async function provision() {
  //   await userService.deleteAll();
  for (const userData of Users) {
    try {
      await userService.create(userData);
      console.log(`Provisioned user: ${userData.email}`);
    } catch (err) {
      console.error(`Error provisioning user ${userData.email}:`, err.message);
    }
  }
}

module.exports = { provision };
