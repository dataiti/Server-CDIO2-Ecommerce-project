const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const router = require("./routes");
const handleError = require("./middlewares/handleError");

const app = express();

// connect db
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => {
    console.log("✅ Connect DB successfully !");
  })
  .catch((err) => {
    console.log(err);
  });

// middleware
app.use(morgan("dev"));
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: `http://localhost:${process.env.PORT_CLIENT}`,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// routes
router(app);

// handle error
handleError(app);

// port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("✅ Server running on port " + port);
});
