const Venta = require('../models/venta');

describe('Modelo Venta - calcularTotales', () => {

    it('calcula subtotal y total correctamente sin descuento', () => {

    const venta = new Venta({
    productos: [
        { nombre: 'Latte', cantidad: 2, precioUnitario: 50 },
        { nombre: 'Americano', cantidad: 1, precioUnitario: 30 }
    ],
    descuentoPorcentaje: 0,
      usuario: '64f000000000000000000001' // cualquier ObjectId simulado
    });

    venta.calcularTotales();

    expect(venta.subtotal).toBe(130);
    expect(venta.descuentoMonto).toBe(0);
    expect(venta.total).toBe(130);
    });



    it('aplica descuento correctamente', () => {

    const venta = new Venta({
    productos: [
    { nombre: 'Capuccino', cantidad: 3, precioUnitario: 40 }
    ],
    descuentoPorcentaje: 10,
    usuario: '64f000000000000000000001'
    });

    venta.calcularTotales();

    expect(venta.subtotal).toBe(120);
    expect(venta.descuentoMonto).toBe(12);
    expect(venta.total).toBe(108);
});


it('recalcula subtotal aunque venga incorrecto desde entrada', () => {
const venta = new Venta({
    productos: [
    { nombre: 'Mocha', cantidad: 2, precioUnitario: 50, subtotal: 999 }
    ],
    descuentoPorcentaje: 0,
    usuario: '64f000000000000000000001'
});

venta.calcularTotales();

  // Debe ignorar 999 y recalcular correctamente
    expect(venta.productos[0].subtotal).toBe(100);
    expect(venta.subtotal).toBe(100);
});


it('suma múltiples productos correctamente', () => {

    const venta = new Venta({
    productos: [
    { cantidad: 1, precioUnitario: 10 },
    { cantidad: 2, precioUnitario: 20 },
    { cantidad: 3, precioUnitario: 30 }
    ],
    descuentoPorcentaje: 5,
    usuario: '64f000000000000000000001'
});

venta.calcularTotales();

  // subtotal = 10 + 40 + 90 = 140
  // descuento = 7
  // total = 133

expect(venta.subtotal).toBe(140);
expect(venta.descuentoMonto).toBe(7);
expect(venta.total).toBe(133);
});


it('maneja descuento del 100% correctamente', () => {

const venta = new Venta({
    productos: [
    { cantidad: 2, precioUnitario: 50 }
    ],
    descuentoPorcentaje: 100,
    usuario: '64f000000000000000000001'
});

venta.calcularTotales();

expect(venta.subtotal).toBe(100);
expect(venta.descuentoMonto).toBe(100);
expect(venta.total).toBe(0);
});



it('no falla si productos está vacío', () => {
const venta = new Venta({
    productos: [],
    descuentoPorcentaje: 10,
    usuario: '64f000000000000000000001'});

venta.calcularTotales();

expect(venta.subtotal).toBe(0);
expect(venta.total).toBe(0);
});


it('calcula correctamente con precios decimales', () => {

const venta = new Venta({
    productos: [
    { cantidad: 3, precioUnitario: 19.90 }
    ],
    descuentoPorcentaje: 10,
    usuario: '64f000000000000000000001'
});

venta.calcularTotales();

expect(venta.subtotal).toBeCloseTo(59.7);
expect(venta.total).toBeCloseTo(53.73);
});

});
