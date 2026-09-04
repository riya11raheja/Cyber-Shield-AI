const express = require("express");
const TrustedContact = require("../models/TrustedContact");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// ADD TRUSTED CONTACT
// ========================================

router.post("/", async (req, res) => {
  try {
    const {
      name,
      phone,
      relationship,
      priority,
      isPrimary,
    } = req.body;

    // Required fields
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    // If this contact is primary,
    // make all other contacts non-primary
    if (isPrimary === true) {
      await TrustedContact.updateMany(
      { user: req.body.user },
        { $set: { isPrimary: false } }
      );
    }

    const contact = await TrustedContact.create({
      user: req.body.user,
      name,
      phone,
      relationship: relationship || "Trusted Contact",
      priority: priority || 1,
      isPrimary: isPrimary || false,
    });

    res.status(201).json({
      success: true,
      message: "Trusted contact added successfully",
      contact,
    });
  } catch (error) {
    console.error("Add contact error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to add trusted contact",
      error: error.message,
    });
  }
});

// ========================================
// GET ALL TRUSTED CONTACTS
// ========================================

router.get("/", protect, async (req, res) => {
  try {
    const contacts = await TrustedContact.find({
      user: req.user.id,
    }).sort({
      priority: 1,
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error("Get contacts error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch trusted contacts",
      error: error.message,
    });
  }
});

// ========================================
// UPDATE TRUSTED CONTACT
// ========================================

router.put("/:id", protect, async (req, res) => {
  try {
    const {
      name,
      phone,
      relationship,
      priority,
      isPrimary,
    } = req.body;

    const contact = await TrustedContact.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Trusted contact not found",
      });
    }

    // If making this contact primary,
    // remove primary status from others
    if (isPrimary === true) {
      await TrustedContact.updateMany(
        {
          user: req.user.id,
          _id: { $ne: req.params.id },
        },
        { $set: { isPrimary: false } }
      );
    }

    if (name !== undefined) {
      contact.name = name;
    }

    if (phone !== undefined) {
      contact.phone = phone;
    }

    if (relationship !== undefined) {
      contact.relationship = relationship;
    }

    if (priority !== undefined) {
      contact.priority = priority;
    }

    if (isPrimary !== undefined) {
      contact.isPrimary = isPrimary;
    }

    await contact.save();

    res.status(200).json({
      success: true,
      message: "Trusted contact updated successfully",
      contact,
    });
  } catch (error) {
    console.error("Update contact error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update trusted contact",
      error: error.message,
    });
  }
});

// ========================================
// DELETE TRUSTED CONTACT
// ========================================

router.delete("/:id", protect, async (req, res) => {
  try {
    const contact = await TrustedContact.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Trusted contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Trusted contact deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete trusted contact",
      error: error.message,
    });
  }
});

module.exports = router;
