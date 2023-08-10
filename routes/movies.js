const router = require('express').Router();
const { getMovies, addMovies, deleteMovieById } = require('../controllers/movies');
const { validationAddMovie, validationDeleteMovie } = require('../middlewares/validation');

router.get('/', getMovies);
router.post('/', validationAddMovie, addMovies);
router.delete('/:movieId', validationDeleteMovie, deleteMovieById);

module.exports = router;
