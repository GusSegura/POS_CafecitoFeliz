const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController'); // ← Asegúrate de importar getMe
const { authMiddleware } = require('../middlewares/authMiddleware');

// Rutas públicas (sin autenticación)
router.post('/login', login);
router.post('/register', register);

// Ruta protegida
router.get('/me', authMiddleware, getMe);

module.exports = router;