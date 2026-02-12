const express = require('express');
const router = express.Router();
const {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} = require('../controllers/clienteController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', obtenerClientes);           // GET /api/clientes
router.get('/:id', obtenerClientePorId);    // GET /api/clientes/:id
router.post('/', crearCliente);             // POST /api/clientes
router.put('/:id', actualizarCliente);      // PUT /api/clientes/:id
router.delete('/:id', eliminarCliente);     // DELETE /api/clientes/:id

module.exports = router;