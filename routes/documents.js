const express = require("express");
const Document = require("../models/Document");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// ✅ Get all documents for the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const documents = await Document.find({ owner: req.user.id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: "❌ Server error: Unable to fetch documents" });
  }
});

// ✅ Get a single document by ID (Ensure user has access)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: "❌ Document not found" });

    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "❌ Not authorized to view this document" });
    }

    res.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ message: "❌ Server error" });
  }
});

// ✅ Create a new document
router.post("/", verifyToken, async (req, res) => {
  const { title, content } = req.body;
  try {
    const newDocument = await Document.create({
      title,
      content,
      owner: req.user.id,
    });
    res.status(201).json(newDocument);
  } catch (error) {
    res.status(500).json({ message: "❌ Server error: Unable to create document" });
  }
});

// ✅ Update a document (Only owner can update)
router.put("/:id", verifyToken, async (req, res) => {
  const { title, content } = req.body;
  try {
    let document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: "❌ Document not found" });

    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "❌ Not authorized to edit this document" });
    }

    document.title = title;
    document.content = content;
    await document.save();

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: "❌ Server error: Unable to update document" });
  }
});

// ✅ Delete a document (Only owner can delete)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: "❌ Document not found" });

    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "❌ Not authorized to delete this document" });
    }

    await document.deleteOne();
    res.json({ message: "✅ Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error: Unable to delete document" });
  }
});

module.exports = router;
