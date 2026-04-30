const { getUsageSummary } = require("../config/apiRouter");

const getUsage = async (req, res, next) => {
  try {
    const summary = await getUsageSummary();
    res.status(200).json({
      success: true,
      usage: summary,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsage };
