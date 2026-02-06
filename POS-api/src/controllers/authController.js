const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Registrar usuario
const register = async (req, res) => {
  try {
    const { nombre, email, password, role } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, email y contraseña son obligatorios'
      });
    }

    // Verificar si el usuario ya existe
const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    // Crear usuario
const user = new User({
      nombre,
      email,
      password,
      role: role || 'cajero' // Por defecto cajero
    });

    await user.save();

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    // Responder sin la contraseña
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        activo: user.activo
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son obligatorios'
      });
    }

    // Buscar usuario
const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar si está activo
    if (!user.activo) {
      return res.status(401).json({
        success: false,
        error: 'Usuario inactivo'
      });
    }

    // Comparar contraseña
const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Generar token
const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        activo: user.activo
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Obtener usuario actual
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};