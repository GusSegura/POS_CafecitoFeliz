const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es obligatorio'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  categoria: {
    type: String,
    enum: ['bebida', 'alimento', 'postre', 'otro'],
    default: 'otro'
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});
//para verificar si hay stock suficiente
productoSchema.methods.hayStockSuficiente = function(cantidad) {
  return this.stock >= cantidad;
};
// para reducir el stock
productoSchema.methods.reducirStock = function(cantidad) {
  if (this.hayStockSuficiente(cantidad)) {
    this.stock -= cantidad;
    return true;
  }
  return false;
};

module.exports = mongoose.model('Producto', productoSchema);