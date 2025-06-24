const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const warrantySchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters long"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    brandAndModel: {
      type: String,
      required: [true, "Brand and model are required"],
      trim: true,
      maxlength: [100, "Brand and model cannot exceed 100 characters"],
    },
    serialNumber: {
      type: String,
      required: [true, "Serial number is required"],
      unique: true,
      trim: true,
      index: true,
      match: [
        /^[a-zA-Z0-9-]+$/,
        "Serial number must be alphanumeric with optional hyphens",
      ],
    },
    purchaseDate: {
      type: Date,
      required: [true, "Purchase date is required"],
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: "Purchase date cannot be in the future",
      },
    },
    invoiceNumber: {
      type: String,
      required: [true, "Invoice or bill number is required"],
      trim: true,
      match: [
        /^[a-zA-Z0-9-]+$/,
        "Invoice number must be alphanumeric with optional hyphens",
      ],
    },
    warrantyDuration: {
      type: Number,
      required: [true, "Warranty duration is required"],
      min: [0, "Warranty duration cannot be negative"],
    },
    warrantyExpiryDate: {
      type: Date,
    },
    warrantyDocs: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return !value || /^https:\/\/res\.cloudinary\.com\//.test(value);
        },
        message: "Warranty document must be a valid Document file",
      },
    },
    userEmail: {
      type: String,
      required: [true, "User email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    supportContactInfo: {
      phone: {
        type: String,
        trim: true,
        match: [/^\+?[\d\s-]{10,}$/, "Please provide a valid phone number"],
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [
          /^\S+@\S+\.\S+$/,
          "Please provide a valid support email address",
        ],
      },
      website: {
        type: String,
        trim: true,
        match: [/^https?:\/\/\S+$/, "Please provide a valid website URL"],
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastReminderSent: {
      type: Date,
      default: null,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

warrantySchema.virtual("isWarrantyValid").get(function () {
  return new Date() <= this.warrantyExpiryDate;
});

warrantySchema.pre("save", function (next) {
  if (this.purchaseDate && this.warrantyDuration && !this.warrantyExpiryDate) {
    const purchaseDate = new Date(this.purchaseDate);
    this.warrantyExpiryDate = new Date(
      purchaseDate.setMonth(purchaseDate.getMonth() + this.warrantyDuration)
    );
  }
  this.updatedAt = Date.now();
  next();
});

warrantySchema.pre("validate", function (next) {
  if (this.purchaseDate && this.warrantyDuration && this.warrantyExpiryDate) {
    const expectedExpiry = new Date(this.purchaseDate);
    expectedExpiry.setMonth(expectedExpiry.getMonth() + this.warrantyDuration);
    const expectedExpiryDate = new Date(expectedExpiry.setHours(0, 0, 0, 0));
    const providedExpiryDate = new Date(
      this.warrantyExpiryDate.setHours(0, 0, 0, 0)
    );
    if (expectedExpiryDate.getTime() !== providedExpiryDate.getTime()) {
      this.invalidate(
        "warrantyExpiryDate",
        "Warranty expiry date must match purchase date plus warranty duration"
      );
    }
  }
  next();
});

const Warranty = mongoose.model("Warranty", warrantySchema);

module.exports = Warranty;
