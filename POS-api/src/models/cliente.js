const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true
  },
  telefono: {
    type: String,
    trim: true
  },
  purchasesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true 
});

// *Para hacer el calculo del descuento*
clienteSchema.methods.calcularDescuento = function() {
  if (this.purchasesCount === 0) return 0;
  if (this.purchasesCount >= 1 && this.purchasesCount <= 3) return 5;
  if (this.purchasesCount >= 4 && this.purchasesCount <= 7) return 10;
  if (this.purchasesCount >= 8) return 15;
  return 0;
};

module.exports = mongoose.model('Cliente', clienteSchema);