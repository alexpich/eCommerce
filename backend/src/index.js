const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");

const server = createServer();

// Uses express middleware to handle cookies with JWT
server.express.use(cookieParser());
// TODO Use express middleware to pupulate current user

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  info => {
    console.log(`Server is now running on port http:/localhost:${info.port}`);
  }
);
