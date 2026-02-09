const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');


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
      // Eliminar archivo si se subió
      if (req.file) {
        const filePath = path.join(__dirname, '../../public/uploads/productos', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);

        }
      }
      
      return res.status(400).json({
        success: false,
        error: 'Nombre y precio son obligatorios'
      });
    }
    
    // Preparar datos del producto
    const productoData = {
      nombre,
      descripcion: descripcion || '',
      precio: parseFloat(precio),
      stock: parseInt(stock) || 0,
      categoria: categoria || 'otro'
    };

    // Si se subió una imagen, agregarla
    if (req.file) {
      productoData.imagen = `/uploads/productos/${req.file.filename}`;

    } else {

    }
    // Crear y guardar producto
    const producto = new Producto(productoData);
    await producto.save();
    
    res.status(201).json({
      success: true,
      mensaje: 'Producto creado exitosamente',
      producto
    });
    
  } catch (error) {
    
    // Si hubo error y se subió archivo, eliminarlo
    if (req.file) {
      const filePath = path.join(__dirname, '../../public/uploads/productos', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);

      }
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria } = req.body;
    
    const producto = await Producto.findById(req.params.id);
    
    if (!producto) {

      if (req.file) {
        const filePath = path.join(__dirname, '../../public/uploads/productos', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

   // Si se subió nueva imagen
    if (req.file) {
      
      // Eliminar imagen anterior (si existe y no es la default)
      if (producto.imagen && !producto.imagen.includes('default-producto.png')) {
        const oldImagePath = path.join(__dirname, '../../public', producto.imagen);
        
        
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);

          } catch (err) {

          }
        } else {

        }
      }
      
      // Asignar nueva imagen
      producto.imagen = `/uploads/productos/${req.file.filename}`;
    }

    // Actualizar otros campos solo si vienen en el body
    if (nombre !== undefined) {
      producto.nombre = nombre;

    }
    
    if (descripcion !== undefined) {
      producto.descripcion = descripcion;

    }
    
    if (precio !== undefined) {
      producto.precio = parseFloat(precio);

    }
    
    if (stock !== undefined) {
      producto.stock = parseInt(stock);

    }
    
    if (categoria !== undefined) {
      producto.categoria = categoria;

    }

    // Guardar cambios
    await producto.save();

    
    res.json({
      success: true,
      mensaje: 'Producto actualizado exitosamente',
      producto
    });
    
  } catch (error) {

    
    // Si hubo error y se subió archivo, eliminarlo
    if (req.file) {
      const filePath = path.join(__dirname, '../../public/uploads/productos', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);

      }
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Eliminar un producto (soft delete)
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