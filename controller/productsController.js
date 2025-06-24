const Warranty = require("../model/product");
const { cloudinary } = require("../config/cloudinary");

exports.createWarranty = async (req, res, next) => {
  try {
    const {
      productName,
      brandAndModel,
      serialNumber,
      purchaseDate,
      invoiceNumber,
      warrantyDuration,
      userEmail,
    } = req.body;

    let supportContactInfo = {};
    if (req.body.supportContactInfo) {
      try {
        supportContactInfo = JSON.parse(req.body.supportContactInfo);
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid support contact info format" });
      }
    }

    if (
      !productName ||
      !brandAndModel ||
      !serialNumber ||
      !purchaseDate ||
      !invoiceNumber ||
      warrantyDuration === undefined ||
      !userEmail
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let warrantyDocs = null;
    if (req.file) {
      warrantyDocs = req.file.path;
    }

    const warranty = new Warranty({
      productName,
      brandAndModel,
      serialNumber,
      purchaseDate,
      invoiceNumber,
      warrantyDuration,
      warrantyDocs,
      userEmail,
      supportContactInfo,
      userId: req.user.id,
    });

    await warranty.save();

    res
      .status(201)
      .json({ message: "Warranty created successfully", warranty });
  } catch (error) {
    next(error);
  }
};

exports.getWarrantyById = async (req, res) => {
  try {
    const id = req.params.id;
    const warranty = await Warranty.findById(id);

    if (!warranty) {
      return res.status(404).json({ message: "Warranty not found" });
    }

    res.status(200).json(warranty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getWarranties = async (req, res, next) => {
  try {
    const warranties = await Warranty.find({ userId: req.user.id });
    res.json(warranties);
  } catch (error) {
    next(error);
  }
};

exports.updateWarranty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      productName,
      brandAndModel,
      serialNumber,
      purchaseDate,
      invoiceNumber,
      warrantyDuration,
      userEmail,
      supportContactInfo,
    } = req.body;

    const warranty = await Warranty.findOne({ _id: id, userId: req.user.id });

    if (!warranty) {
      return res.status(404).json({ message: "Warranty not found" });
    }

    let warrantyDocs = warranty.warrantyDocs;
    if (req.file) {
      if (warranty.warrantyDocs) {
        const publicId = warranty.warrantyDocs
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      warrantyDocs = req.file.path;
    }
    let parsedSupportContactInfo = warranty.supportContactInfo;
    if (req.body.supportContactInfo) {
      try {
        parsedSupportContactInfo = JSON.parse(req.body.supportContactInfo);
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid support contact info format" });
      }
    }

    warranty.productName = productName || warranty.productName;
    warranty.brandAndModel = brandAndModel || warranty.brandAndModel;
    warranty.serialNumber = serialNumber || warranty.serialNumber;
    warranty.purchaseDate = purchaseDate || warranty.purchaseDate;
    warranty.invoiceNumber = invoiceNumber || warranty.invoiceNumber;
    warranty.warrantyDuration =
      warrantyDuration !== undefined
        ? warrantyDuration
        : warranty.warrantyDuration;
    warranty.userEmail = userEmail || warranty.userEmail;
    warranty.supportContactInfo = parsedSupportContactInfo;

    warranty.warrantyDocs = warrantyDocs;

    await warranty.save();

    res.json({ message: "Warranty updated successfully", warranty });
  } catch (error) {
    next(error);
  }
};

exports.deleteWarranty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const warranty = await Warranty.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!warranty) {
      return res.status(404).json({ message: "Warranty not found" });
    }

    if (warranty.warrantyDocs) {
      const publicId = warranty.warrantyDocs
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    res.json({ message: "Warranty deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.searchWarranties = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res
        .status(400)
        .json({ message: "Query parameter 'q' is required" });
    }

    const warranties = await Warranty.find({
      userId: req.user.id,
      $or: [
        { productName: { $regex: q, $options: "i" } },
        { serialNumber: { $regex: q, $options: "i" } },
      ],
    });

    res.json(warranties);
  } catch (error) {
    next(error);
  }
};
