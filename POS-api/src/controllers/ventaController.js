const Venta = require('../models/venta');
const Cliente = require('../models/cliente');
const Producto = require('../models/producto');

const obtenerVentas = async (req, res) => {
  try {
    const ventas = await Venta.find()
      .populate('cliente', 'nombre email')
      .populate('productos.producto', 'nombre precio')
      .sort({ createdAt: -1 }); // para mostrar mas recientes primero
    
    res.json({
      success: true,
      total: ventas.length,
      ventas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const obtenerVentaPorId = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('cliente', 'nombre email telefono')
      .populate('productos.producto', 'nombre precio categoria');
    
    if (!venta) {
      return res.status(404).json({
        success: false,
        error: 'Venta no encontrada'
      });
    }
    
    res.json({
      success: true,
      venta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const obtenerVentasPorCliente = async (req, res) => {
  try {
    const ventas = await Venta.find({ 
      cliente: req.params.clienteId,
      estado: 'completada'
    })
      .populate('productos.producto', 'nombre precio')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      total: ventas.length,
      ventas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


const crearVenta = async (req, res) => {
  try {
    const { clienteId, productos, metodoPago } = req.body;
    
    // 1. Validar que vengan productos (Es lo único estrictamente obligatorio ahora)
    if (!productos || productos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Los productos son obligatorios'
      });
    }

    let cliente = null;
    let descuentoPorcentaje = 0;

    // 2. Lógica de Cliente Opcional
    if (clienteId) {
      cliente = await Cliente.findById(clienteId);
      if (!cliente) {
        return res.status(404).json({
          success: false,
          error: 'El cliente especificado no existe'
        });
      }
      // Si el cliente existe, calculamos su descuento
      descuentoPorcentaje = cliente.calcularDescuento();
    }
    
    // 3. Validar stock y preparar lista de productos para la venta
    const productosVenta = [];
    const productosInsuficientes = [];
    
    for (const item of productos) {
      const producto = await Producto.findById(item.productoId);
      
      if (!producto) {
        return res.status(404).json({
          success: false,
          error: `Producto con ID ${item.productoId} no encontrado`
        });
      }
      
      if (!producto.activo) {
        return res.status(400).json({
          success: false,
          error: `El producto ${producto.nombre} no está disponible`
        });
      }
      
      if (!producto.hayStockSuficiente(item.cantidad)) {
        productosInsuficientes.push({
          nombre: producto.nombre,
          stockDisponible: producto.stock,
          cantidadSolicitada: item.cantidad
        });
      }
      
      productosVenta.push({
        producto: producto._id,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: producto.precio,
        subtotal: producto.precio * item.cantidad
      });
    }
    
    if (productosInsuficientes.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Stock insuficiente para algunos productos',
        productosInsuficientes
      });
    }
    
    // 4. Crear la instancia de la Venta
    const venta = new Venta({
      cliente: cliente ? cliente._id : null, // Si no hay cliente, se guarda como null
      productos: productosVenta,
      descuentoPorcentaje: descuentoPorcentaje,
      metodoPago: metodoPago || 'efectivo'
    });
    
    // 5. Calcular totales usando el método del modelo
    venta.calcularTotales();
    
    // 6. Guardar la venta
    await venta.save();
    
    // 7. Actualizar Inventario y contador del Cliente
    for (const item of productos) {
      const producto = await Producto.findById(item.productoId);
      producto.reducirStock(item.cantidad);
      await producto.save();
    }
    
    // Solo incrementamos compras si el cliente existe
    if (cliente) {
      cliente.purchasesCount += 1;
      await cliente.save();
    }
    
    // 8. Respuesta final limpia
    const ventaCompleta = await Venta.findById(venta._id)
      .populate('cliente', 'nombre email purchasesCount')
      .populate('productos.producto', 'nombre categoria');
    
    res.status(201).json({
      success: true,
      mensaje: cliente ? `Venta registrada a ${cliente.nombre}` : 'Venta a Público General exitosa',
      venta: ventaCompleta,
      descuentoAplicado: `${descuentoPorcentaje}%`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const cancelarVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);
    
    if (!venta) {
      return res.status(404).json({
        success: false,
        error: 'Venta no encontrada'
      });
    }
    
    if (venta.estado === 'cancelada') {
      return res.status(400).json({
        success: false,
        error: 'La venta ya está cancelada'
      });
    }
    
    // 1. Devolver el stock
    for (const item of venta.productos) {
      const producto = await Producto.findById(item.producto);
      if (producto) {
        producto.stock += item.cantidad;
        await producto.save();
      }
    }
    
    // 2. Reducir el contador de compras del cliente
    const cliente = await Cliente.findById(venta.cliente);
    if (cliente && cliente.purchasesCount > 0) {
      cliente.purchasesCount -= 1;
      await cliente.save();
    }
    
    // 3. Marcar la venta como cancelada
    venta.estado = 'cancelada';
    await venta.save();
    
    res.json({
      success: true,
      mensaje: 'Venta cancelada exitosamente',
      venta
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


const obtenerEstadisticas = async (req, res) => {
  try {
    const totalVentas = await Venta.countDocuments({ estado: 'completada' });
    const ventasCanceladas = await Venta.countDocuments({ estado: 'cancelada' });
    
    const ventasCompletadas = await Venta.find({ estado: 'completada' });
    
    const totalIngresos = ventasCompletadas.reduce((sum, venta) => sum + venta.total, 0);
    const totalDescuentos = ventasCompletadas.reduce((sum, venta) => sum + venta.descuentoMonto, 0);
    
    res.json({
      success: true,
      estadisticas: {
        totalVentas,
        ventasCanceladas,
        totalIngresos: totalIngresos.toFixed(2),
        totalDescuentos: totalDescuentos.toFixed(2),
        promedioVenta: totalVentas > 0 ? (totalIngresos / totalVentas).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  obtenerVentas,
  obtenerVentaPorId,
  obtenerVentasPorCliente,
  crearVenta,
  cancelarVenta,
  obtenerEstadisticas
};