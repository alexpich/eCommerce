const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");

const server = createServer();

// Uses express middleware to handle cookies with JWT
server.express.use(cookieParser());

// Decode JWT to get user ID on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    // Put userId onto the req for future req to access
    req.userId = userId;
  }
  next();
});

// Create middleware that populates user on each request
server.express.use(async (req, res, next) => {
  // if not logged in, skip
  if (!req.userId) return next();
  const user = await db.query.user(
    { where: { id: req.userId } },
    "{id, permissions, email, name}"
  );
  req.user = user;
  next();
});

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
