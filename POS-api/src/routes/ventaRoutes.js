const express = require('express');
const router = express.Router();
const {
  obtenerVentas,
  obtenerVentaPorId,
  obtenerVentasPorCliente,
  crearVenta,
  cancelarVenta,
  obtenerEstadisticas
} = require('../controllers/ventaController');


router.get('/', obtenerVentas);                           // GET /api/ventas
router.get('/estadisticas', obtenerEstadisticas);         // GET /api/ventas/estadisticas
router.get('/:id', obtenerVentaPorId);                    // GET /api/ventas/:id
router.get('/cliente/:clienteId', obtenerVentasPorCliente); // GET /api/ventas/cliente/:clienteId
router.post('/', crearVenta);                             // POST /api/ventas
router.put('/:id/cancelar', cancelarVenta);               // PUT /api/ventas/:id/cancelar

module.exports = router;