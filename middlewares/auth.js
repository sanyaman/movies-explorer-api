const jwt = require('jsonwebtoken');

const UNAUTHORIZED = require('../errors/401');

const { SECRET_KEY, NODE_ENV } = process.env;

module.exports = (req, res, next) => {
  let token;
  try {
    token = req.cookies.jwt;
  } catch (err) {
    next(new UNAUTHORIZED('Неправильно указан логин и/или пароль 1'));
  }
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? SECRET_KEY : 'PUTIN');
  } catch (err) {
    next(new UNAUTHORIZED('Неправильно указан логин и/или пароль 2'));
  }
  req.user = payload;
  next();
};
