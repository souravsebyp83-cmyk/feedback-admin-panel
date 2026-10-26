
const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

const courses = {
  "MERN Stack Development": ["CRS-001", "12 Weeks"],
  "Web Development": ["CRS-002", "10 Weeks"],
  "Python Programming": ["CRS-003", "8 Weeks"],
  "Data Structures": ["CRS-004", "8 Weeks"],
};

router.get("/", async (req, res) => {
  try {
    const data = await Feedback.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { courseName, comments, rating } = req.body;

    if (!courseName?.trim() || !comments?.trim()) {
      return res.status(400).json({ message: "Complete all fields." });
    }

    if (!Number.isInteger(Number(rating)) ||
        Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: "Rating must be 1 to 5." });
    }

    const details = courses[courseName.trim()];
    if (!details) {
      return res.status(400).json({ message: "Select a valid course." });
    }

    const feedback = await Feedback.create({
      courseId: details[0],
      courseName: courseName.trim(),
      courseDuration: details[1],
      comments: comments.trim(),
      rating: Number(rating),
    });

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { courseName, comments, rating } = req.body;

    if (!courseName?.trim() || !comments?.trim() ||
        !Number.isInteger(Number(rating)) ||
        Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: "Check the submitted fields." });
    }

    const details = courses[courseName.trim()];
    if (!details) {
      return res.status(400).json({ message: "Select a valid course." });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        courseId: details[0],
        courseName: courseName.trim(),
        courseDuration: details[1],
        comments: comments.trim(),
        rating: Number(rating),
      },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    res.json({ message: "Feedback deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
