const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const router = require('./routes');
const handleError = require('./middlewares/handleError');

const app = express();

// connect db
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => {
    console.log('✅ Connect DB successfully !');
  })
  .catch((err) => {
    console.log(err);
  });

// middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);

// routes
router(app);

// handle error
handleError(app);

// port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log('✅ Server running on port ' + port);
});
