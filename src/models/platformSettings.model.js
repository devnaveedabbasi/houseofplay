import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    rawMaterialGuide: {
      images: [String], // local URLs, max 5
    },
    madeGuide: {
      images: [String], // local URLs, max 5
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Prevent redefining the model if it already exists (Next.js hot reload safety)
const PlatformSettings =
  mongoose.models.PlatformSettings ||
  mongoose.model('PlatformSettings', platformSettingsSchema);

export default PlatformSettings;
