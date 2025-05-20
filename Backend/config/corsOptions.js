const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: ["GET", "POST"],
  credentials: true,
};

module.exports = { corsOptions };
