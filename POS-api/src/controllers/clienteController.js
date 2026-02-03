const Cliente = require('../models/cliente');

const obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find({ activo: true });
    res.json({
      success: true,
      total: clientes.length,
      clientes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const obtenerClientePorId = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }
    
    const descuento = cliente.calcularDescuento();
    
    res.json({
      success: true,
      cliente,
      descuentoActual: `${descuento}%`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const crearCliente = async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;
    
    // Valida que vengan los datos requeridos
    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y email son obligatorios'
      });
    }
    
    // Verifica si ya existe un cliente con ese email
    const clienteExistente = await Cliente.findOne({ email });
    if (clienteExistente) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un cliente con ese email'
      });
    }
    
    const cliente = new Cliente({
      nombre,
      email,
      telefono
    });
    
    await cliente.save();
    
    res.status(201).json({
      success: true,
      mensaje: 'Cliente registrado exitosamente',
      cliente
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const actualizarCliente = async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;
    
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      { nombre, email, telefono },
      { new: true, runValidators: true }
    );
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }
    
    res.json({
      success: true,
      mensaje: 'Cliente actualizado exitosamente',
      cliente
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const eliminarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }
    
    res.json({
      success: true,
      mensaje: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente
};