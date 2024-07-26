const express = require("express");
const {
  addTask,
  editTask,
  getTasks,
  deleteTask
} = require("./../controllers/task.js");
const checkAuth = require("./../middleware/checkAuth.js");

const router = express.Router();

router.get("/tasks", checkAuth, getTasks);
router.post("/task", checkAuth, addTask);
router.patch("/task/:taskId", checkAuth, editTask);
router.delete("/task/:taskId", checkAuth, deleteTask);

module.exports = router;
