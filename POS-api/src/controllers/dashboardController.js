const Venta = require('../models/venta');

exports.obtenerEstadisticas = async (req, res) => {
  try {
    const totalVentas = await Venta.countDocuments(); //SELECT COUNT(*) FROM ventas;
    const ventas = await Venta.find();//SELECT * FROM ventas;

    const totalIngresos = ventas.reduce((acc, v) => acc + v.total, 0); //acc acumulador, v venta actual, similar a un for

    res.json({
      totalVentas,
      totalIngresos
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener estadísticas' });
  }
};
