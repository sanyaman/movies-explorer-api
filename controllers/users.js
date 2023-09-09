const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BAD_REQUEST = require('../errors/400');
const NOT_FOUND_ERROR = require('../errors/404');
const CONFLICT_ERROR = require('../errors/409');
const UNAUTHORIZED = require('../errors/401');

const { SECRET_KEY, NODE_ENV } = process.env;

module.exports.createUser = (req, res, next) => {
  const { name, email, password } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => res.status(201).send({
      data: {
        name: user.name,
        email: user.email,
      },
    }))
    .catch((err) => {
      if (err.code === 11000) {
        next(new CONFLICT_ERROR('Введенная почта уже используется'));
      } else if (err.name === 'ValidationError') {
        next(new BAD_REQUEST('Переданны не корректные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new UNAUTHORIZED('Неправильно указан логин и/или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UNAUTHORIZED('Неправильно указан логин и/или пароль');
          }
          const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production'
            ? SECRET_KEY : 'PUTIN', { expiresIn: '7d' });
          res.cookie('jwt', token, {
            maxAge: 3600000 * 24 * 7,
            httpOnly: true,
            sameSite: true,
          }).send({ token });
        }).catch(() => { throw new UNAUTHORIZED('Ошибка в создании токена'); });
    })
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send(user))
    .catch(next);
};

module.exports.setUserInfo = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .orFail(() => new NOT_FOUND_ERROR('Не удалось обновить информацию пользователя по указанному id'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.code === 11000) {
        next(new CONFLICT_ERROR('Переданы некорректные данные при обновлении профиля'));
      } else if (err.name === 'ValidationError') {
        next(new BAD_REQUEST('Переданные некорректные данные id'));
      } else {
        next(err);
      }
    });
};

module.exports.logout = (req, res) => {
  res.clearCookie('jwt')
    .send({ message: 'Вали!' });
};
