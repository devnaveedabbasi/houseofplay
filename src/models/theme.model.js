import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      unique: true,
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    standard: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    denominationPackSize: {
      type: Number,
      required: true,
    },
    thumbnail: {
      type: String, // Cloudinary URL
    },
    measurements: {
      lengthMM: { type: Number, required: true },
      widthMM: { type: Number, required: true },
      heightMM: { type: Number, required: true },
      installationTimeMins: { type: Number },
      weightKgs: { type: Number },
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    supplierName: {
      type: String, // If new supplier added inline without ID
    },
    rawMaterialPrice: {
      type: Number,
      required: true,
    },
    supplierSKU: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Theme = mongoose.models.Theme || mongoose.model('Theme', themeSchema);

export default Theme;
