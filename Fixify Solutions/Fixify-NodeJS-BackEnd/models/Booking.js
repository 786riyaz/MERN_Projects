// models/Booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },

    contractor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    address: {
      line1: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
    },

    rejected_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
      }
    ],

    issue_images: [
      {
        type: String, // URL or file name
      }
    ],

    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
        "rejected"
      ],
      default: "pending",
      index: true,
    }
  },

  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Improve performance
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("Booking", BookingSchema);
