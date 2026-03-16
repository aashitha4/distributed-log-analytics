import mongoose from 'mongoose';

const LogStatsSchema = new mongoose.Schema(
  {
    sourceFile: { type: String, index: true },
    minuteWindow: { type: Date, index: true },
    requestCount: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    errorRate: { type: Number, default: 0 },
    status2xx: { type: Number, default: 0 },
    status4xx: { type: Number, default: 0 },
    status5xx: { type: Number, default: 0 }
  },
  { timestamps: true, collection: 'log_stats' }
);

export default mongoose.model('LogStats', LogStatsSchema);
