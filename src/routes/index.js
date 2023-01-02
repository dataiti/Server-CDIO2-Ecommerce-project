const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const storeRouter = require('./storeRouter');
const productRouter = require('./productRouter');
const categoryRouter = require('./categoryRouter');
const userFollowStoreRouter = require('./userFollowStoreRouter');

const router = (app) => {
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/user', userRouter);
  app.use('/api/v1/product', productRouter);
  app.use('/api/v1/store', storeRouter);
  app.use('/api/v1/category', categoryRouter);
  app.use('/api/v1/userFollowStore', userFollowStoreRouter);
};

module.exports = router;
