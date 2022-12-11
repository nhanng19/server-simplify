const path = require("path");
const express = require("express");
const session = require("express-session");
const routes = require("./controllers");
const cors = require("cors");
const sequelize = require("./config/connection");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const app = express();
const PORT = process.env.PORT || 3001;

const sess = {
  secret: "Super secret secret",
  cookie: {
    maxAge: 86400000,
    httpOnly: true,
    secure: process.env.CLIENT_URL !== "http://localhost:3000",
    sameSite:
      process.env.CLIENT_URL !== "http://localhost:3000" ? "none" : "strict",
  },
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};

app.set("trust proxy", true);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["POST", "PUT", "GET", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    credentials: true,
  })
);

app.use(session(sess));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(routes);

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log("Now listening"));
});
