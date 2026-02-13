const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  obtenerVentas,
  obtenerVentaPorId,
  obtenerVentasPorCliente,
  crearVenta,
  cancelarVenta,
  obtenerEstadisticas
} = require('../controllers/ventaController');


router.get('/', obtenerVentas);
router.get('/estadisticas', obtenerEstadisticas);
router.get('/:id', obtenerVentaPorId);
router.get('/cliente/:clienteId', obtenerVentasPorCliente);
router.post('/', authMiddleware, crearVenta);
router.put('/:id/cancelar', cancelarVenta);

module.exports = router;