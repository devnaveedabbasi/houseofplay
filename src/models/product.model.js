import mongoose from 'mongoose';

const baseOptions = {
  discriminatorKey: 'productType',
  collection: 'products',
  timestamps: true,
};

const productSchema = new mongoose.Schema(
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
    productCode: {
      type: Number,
      unique: true,
    },
    status: {
      type: String,
      enum: ['approved', 'rejected', 'pending'],
      default: 'pending',
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
      type: String, // Cloudinary/Local URL
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
    supplierSKU: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  baseOptions
);

function arrayLimit(val) {
  return val.length <= 5;
}

// Ensure base model isn't compiled twice in Next.js
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// ─── Discriminators ──────────────────────────────────────────────────────────

const RawMaterial =
  Product.discriminators?.raw ||
  Product.discriminator(
    'raw',
    new mongoose.Schema({
      rawMaterialPrice: { type: Number, required: true },
      images: {
        type: [String], // Array of URLs
        validate: [arrayLimit, '{PATH} exceeds the limit of 5'],
      },
    })
  );

const Theme =
  Product.discriminators?.theme ||
  Product.discriminator(
    'theme',
    new mongoose.Schema({
      themePrice: { type: Number, required: true },
    })
  );

const External =
  Product.discriminators?.external ||
  Product.discriminator(
    'external',
    new mongoose.Schema({
      externalPrice: { type: Number, required: true },
    })
  );

export { Product, RawMaterial, Theme, External };
