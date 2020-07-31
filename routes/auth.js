const express = require('express');
const { 
  register, 
  login, 
  getProfile,
  logout,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/auth');

const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.post('/forgotpassword', forgotPassword);

router.post('/reset/:resetToken', resetPassword);

router.post('/changepassword', protect, updatePassword);

router
  .route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.post('/logout', logout);

module.exports = router;