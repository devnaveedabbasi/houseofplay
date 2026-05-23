import mongoose from 'mongoose';

const rawMaterialSchema = new mongoose.Schema(
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
    images: {
      type: [String], // Array of Cloudinary URLs
      validate: [arrayLimit, '{PATH} exceeds the limit of 5'],
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

function arrayLimit(val) {
  return val.length <= 5;
}

const RawMaterial = mongoose.models.RawMaterial || mongoose.model('RawMaterial', rawMaterialSchema);

export default RawMaterial;
