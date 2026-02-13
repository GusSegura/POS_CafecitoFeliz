const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/estadisticas', dashboardController.obtenerEstadisticas);

module.exports = router;