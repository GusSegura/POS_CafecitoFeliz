const Venta = require('../models/venta');

exports.obtenerEstadisticas = async (req, res) => {
  try {
    const totalVentas = await Venta.countDocuments();
    const ventas = await Venta.find();

    const totalIngresos = ventas.reduce((acc, v) => acc + v.total, 0);

    res.json({
      totalVentas,
      totalIngresos
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener estadísticas' });
  }
};
