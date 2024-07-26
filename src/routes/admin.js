const express = require("express");
const checkAuth = require("./../middleware/checkAuth.js");
const { addSpecialUsers } = require("./../controllers/admin.js");

const router = express.Router();

router.post("/add-special-user", checkAuth, addSpecialUsers);

module.exports = router;
