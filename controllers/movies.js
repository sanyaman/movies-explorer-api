const Movie = require('../models/movies');
const FORBIDDEN = require('../errors/403');
const BAD_REQUEST = require('../errors/400');
const NOT_FOUND_ERROR = require('../errors/404');

module.exports.getMovies = (req, res, next) => {
  const { _id } = req.user;
  Movie.find({ owner: _id })
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.addMovies = (req, res, next) => {
  const { _id } = req.user;
  Movie.create({ owner: _id, ...req.body })
    .then((movie) => res.status(201).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BAD_REQUEST('Переданы некорректные данные при добавлении фильма'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovieById = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail(() => new NOT_FOUND_ERROR('Фильм с данным _id не найден'))
    .then((movie) => {
      if (!movie.owner.equals(req.user._id)) {
        return next(new FORBIDDEN('Невозможно удалить Фильм с другим _id'));
      }
      return Movie.deleteOne(movie)
        .then(() => res.status(200).send({ message: 'НЕ ЗАШЛО' }))
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BAD_REQUEST('Переданы некорректные данные при удалении фильма'));
      } else {
        next(err);
      }
    });
};
