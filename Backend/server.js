const http = require("http");
const app = require("./app");
const { connectDB } = require("./config/db");
const { setupSocket } = require("./sockets");

const server = http.createServer(app);
setupSocket(server);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  server.listen(PORT, '0.0.0.0',() =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
});
