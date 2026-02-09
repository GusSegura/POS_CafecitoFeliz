const express = require('express');
const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/productoController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

const router = express.Router();

router.use((req, res, next) => {

  next();
});

router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);

// Rutas protegidas con subida de imagen
router.post('/', 
  authMiddleware, 
  (req, res, next) => {

    next();
  },
  upload.single('imagen'), 
  (req, res, next) => {

    next();
  },
  crearProducto
);

router.put('/:id', 
  authMiddleware, 
  upload.single('imagen'), 
  actualizarProducto
);

router.delete('/:id', authMiddleware, eliminarProducto);

module.exports = router;