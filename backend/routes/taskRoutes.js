const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");

// OPTIONAL (only if you already have socket setup)
let sendNotification;
try {
  ({ sendNotification } = require("../socket/socket"));
} catch {
  sendNotification = () => {};
}

const router = express.Router();

/**
 * CREATE TASK (with assignment)
 */
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ msg: "Title is required" });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo: assignedTo || null
    });

    // Real-time notification (safe optional)
    sendNotification({ message: "New task created" });

    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: "Failed to create task" });
  }
});

/**
 * GET ALL TASKS (populate assigned user)
 */
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch tasks" });
  }
});

/**
 * UPDATE TASK (status / reassignment)
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const { status, assignedTo } = req.body;

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { status, assignedTo },
      { new: true }
    ).populate("assignedTo", "name email");

    if (!updated) {
      return res.status(404).json({ msg: "Task not found" });
    }

    sendNotification({ message: "Task updated" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Update failed" });
  }
});

/**
 * DELETE TASK
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ msg: "Task not found" });
    }

    sendNotification({ message: "Task deleted" });

    res.json({ msg: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Delete failed" });
  }
});

module.exports = router;