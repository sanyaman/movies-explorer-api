require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const requestLimit = require('express-rate-limit');
// const cors = require('./middlewares/cors');
const cors = require("cors");
const routes = require('./routes/index');
const errorServer = require('./middlewares/errorServer');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;
const { MONGODB = 'mongodb://127.0.0.1:27017/diplomdb' } = process.env;

const allowedCors =  ['https://movie-hub.nomoredomainsicu.ru', 'http://localhost:3001', 'http://localhost:3000'];

const corsOptions = {
  origin: allowedCors,
  optionsSuccessStatus: 200,
  credentials: true,
};

const app = express();
app.use(express.json());
app.use(cookieParser());

mongoose.connect(MONGODB);
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);
app.use(cors(corsOptions));
// app.use(cors);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

const limiter = requestLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message:
  'Превышено количество запросов на сервер, попробуйте выполнить запрос позднее',
});

app.use(limiter);
app.use(routes);
app.use(errorLogger);

app.use(errors());
app.use(errorServer);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Запуск адронного коллайдера : ${PORT}`);
});
