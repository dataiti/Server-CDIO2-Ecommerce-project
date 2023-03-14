const authRouter = require('./auth');
const userRouter = require('./user');
const addressRouter = require('./address');
const categoryRouter = require('./category');
const deliveryRouter = require('./delivery');
const storeRouter = require('./store');
const productRouter = require('./product');
const cartRouter = require('./cart');
const orderRouter = require('./order');

const router = (app) => {
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/user', userRouter);
  app.use('/api/v1/address', addressRouter);
  app.use('/api/v1/category', categoryRouter);
  app.use('/api/v1/delivery', deliveryRouter);
  app.use('/api/v1/store', storeRouter);
  app.use('/api/v1/product', productRouter);
  app.use('/api/v1/cart', cartRouter);
  app.use('/api/v1/order', orderRouter);
};

module.exports = router;
