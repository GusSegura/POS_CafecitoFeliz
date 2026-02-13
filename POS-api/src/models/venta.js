const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: false
  },
  productos: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    nombre: String,
    cantidad: {
      type: Number,
      required: true,
      min: [1, 'La cantidad debe ser al menos 1']
    },
    precioUnitario: {
      type: Number,
      required: true,
      min: 0
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  descuentoPorcentaje: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  descuentoMonto: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  metodoPago: {
    type: String,
    enum: ['efectivo', 'tarjeta'],
    default: 'efectivo'
  },
  estado: {
    type: String,
    enum: ['completada', 'cancelada'],
    default: 'completada'
  },
  usuario: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true
  },
  fecha: {
    type: Date,
    default: Date.now,
    index: true
  },
}, {
  timestamps: true
});

// para calcular totales
ventaSchema.methods.calcularTotales = function() {
  this.subtotal = this.productos.reduce((sum, item) => {
    item.subtotal = item.cantidad * item.precioUnitario;
    return sum + item.subtotal;
  }, 0);

  // para calcular monto de descuento
  this.descuentoMonto = (this.subtotal * this.descuentoPorcentaje) / 100;

  // Calcular total final
  this.total = this.subtotal - this.descuentoMonto;
};

module.exports = mongoose.model('Venta', ventaSchema);