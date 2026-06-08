const http = require("http");
const app = require("./src/app");

const server = http.createServer(app);

const PORT = process.env.PORT || 3100;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
