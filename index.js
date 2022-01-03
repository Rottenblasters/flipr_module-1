require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");

// Database connection
mongoose.connect(process.env.MONGO_CONNECTION_URL);
const connection = mongoose.connection;
connection.on("error", console.error.bind(console, "connection error:"));
connection.once("open", () => {
  console.log("Database connected");
});

// Assets
app.use(express.urlencoded({ extended: true }));
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);
app.use(cookieParser());

require("./src/routes/api")(app);
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
