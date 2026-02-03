const Producto = require('../models/producto');

const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true });
    res.json({
      success: true,
      total: productos.length,
      productos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria } = req.body;
    
    if (!nombre || !precio) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y precio son obligatorios'
      });
    }
    
    const producto = new Producto({
      nombre,
      descripcion,
      precio,
      stock: stock || 0,
      categoria
    });
    
    await producto.save();
    
    res.status(201).json({
      success: true,
      mensaje: 'Producto creado exitosamente',
      producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria } = req.body;
    
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, precio, stock, categoria },
      { new: true, runValidators: true }
    );
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      mensaje: 'Producto actualizado exitosamente',
      producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      mensaje: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};