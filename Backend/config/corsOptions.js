const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://collab-edit-mci7x4gdv-dev-bholas-projects.vercel.app",
  ],
  methods: ["GET", "POST"],
  credentials: true,
};

module.exports = { corsOptions };
