const express = require('express');
const {
  deliveryById,
  getDelivery,
  createDelivery,
  updateDelivery,
  removeDelivery,
  getListDeliveriesForAdmin,
} = require('../controllers/delivery');
const uploadCloud = require('../configs/configCloudinary');

const router = express.Router();

router.get('/list-deliveries/admin', getListDeliveriesForAdmin);
router.get('/get-delivery/:deliveryId', getDelivery);
router.post('/create-delivery', uploadCloud.single('logo'), createDelivery);
router.put('/update-delivery/:deliveryId', uploadCloud.single('logo'), updateDelivery);
router.delete('/remove-delivery/:deliveryId', removeDelivery);

router.param('deliveryId', deliveryById);

module.exports = router;
