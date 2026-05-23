import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional if seeded or created by admin without explicit tracking
    },
  },
  { timestamps: true }
);

const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);

export default Supplier;
