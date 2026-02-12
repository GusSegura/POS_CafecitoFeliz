const express = require('express');
const router = express.Router();
const { 
    getUsers, 
    createUser, 
    updateUser, 
    deleteUser,
    activateUser 
} = require('../controllers/usuarioController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación y ser admin
router.use(authMiddleware);
router.use(adminOnly);

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/activate', activateUser);

module.exports = router;