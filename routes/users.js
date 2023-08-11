const router = require('express').Router();
const { getUser, setUserInfo } = require('../controllers/users');
const { validationUserInfo } = require('../middlewares/validation');

router.get('/me', getUser);
router.patch('/me', validationUserInfo, setUserInfo);

module.exports = router;
