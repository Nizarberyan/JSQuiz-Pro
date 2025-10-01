const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

//only register and login routes are accessible to guests
router.use(['/login', '/register'], authMiddleware.ensureGuest);

// //the logout route is accessible to authenticated users only
// router.use([ '/logout'], authMiddleware.ensureAuth)

router.get('/login' , authController.showLogin);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/register', authController.showRegister);


router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

module.exports = router;