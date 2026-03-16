import mongoose from 'mongoose';

const AnomalySchema = new mongoose.Schema(
  {
    sourceFile: { type: String, index: true },
    ipAddress: { type: String, index: true },
    minuteWindow: { type: Date, index: true },
    requestCount: { type: Number, default: 0 },
    errorRate: { type: Number, default: 0 },
    cluster: { type: Number },
    distanceFromCentroid: { type: Number },
    reason: { type: String }
  },
  { timestamps: true, collection: 'anomalies' }
);

export default mongoose.model('Anomaly', AnomalySchema);
