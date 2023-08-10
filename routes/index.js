const router = require('express').Router();
const userRouters = require('./users');
const movieRouters = require('./movies');
const { createUser, login, logout } = require('../controllers/users');
const { validationUser, validationLogin } = require('../middlewares/validation');
const NOT_FOUND_ERROR = require('../errors/404');
const auth = require('../middlewares/auth');

router.post('/signup', validationUser, createUser);
router.post('/signin', validationLogin, login);
router.use(auth);
router.use('/users', userRouters);
router.use('/movies', movieRouters);
router.use('/signout', logout);

router.use('/*', (req, res, next) => next(new NOT_FOUND_ERROR('Запрашиваемая страница не найдена')));

module.exports = router;
