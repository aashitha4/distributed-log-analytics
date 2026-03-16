import Anomaly from '../models/Anomaly.js';
import LogStats from '../models/LogStats.js';

export const getResults = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 500);
    const data = await LogStats.find({})
      .sort({ minuteWindow: 1 })
      .limit(limit)
      .lean();

    return res.json(data);
  } catch (error) {
    return next(error);
  }
};

export const getAnomalies = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 500);
    const data = await Anomaly.find({})
      .sort({ minuteWindow: -1 })
      .limit(limit)
      .lean();

    return res.json(data);
  } catch (error) {
    return next(error);
  }
};
