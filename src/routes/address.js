const express = require('express');
const {
  getListAdressesByUser,
  addAddress,
  updateAddress,
  removeAddress,
  addressById,
} = require('../controllers/address');
const { userById } = require('../controllers/user');

const router = express.Router();

router.get('/list-addreeses/:userId', getListAdressesByUser);
router.post('/add-address/:userId', addAddress);
router.put('/update-address/:userId/:addressId', updateAddress);
router.delete('/remove-address/:userId/:addressId', removeAddress);

router.param('addressId', addressById);
router.param('userId', userById);

module.exports = router;
