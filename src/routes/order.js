const express = require('express');
const {
  orderById,
  createOrder,
  cancelOrder,
  updateStatusOrderByStore,
  getRevenueLast7Days,
  getTodoList,
  getOrderStatusByStore,
  getOrderStatusByUSer,
} = require('../controllers/order');
const { userById } = require('../controllers/user');
const { storeById } = require('../controllers/store');

const router = express.Router();

router.get('/get-orders-status/by-user/:userId', getOrderStatusByUSer);
router.get('/get-orders-status/by-store/:storeId', getOrderStatusByStore);
router.get('/get-revenue/last-7-days/:storeId', getRevenueLast7Days);
router.get('/get-todo-list', getTodoList);
router.post('/create-order/:userId/:storeId', createOrder);
router.put('/cancel-order/:userId/:orderId', cancelOrder);
router.put('/update-status-order/:storeId/:orderId', updateStatusOrderByStore);

// param
router.param('userId', userById);
router.param('storeId', storeById);
router.param('orderId', orderById);

module.exports = router;
