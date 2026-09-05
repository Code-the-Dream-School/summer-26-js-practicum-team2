const getHealth = (_req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "sprout-api",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getHealth };
