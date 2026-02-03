require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');


const clienteRoutes = require('./src/routes/clienteRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const ventaRoutes = require('./src/routes/ventaRoutes');

const app = express();


connectDB();


app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.json({
    message: 'API de POS de Cafecito Feliz',
    version: '1.0.0',
    endpoints: {
      clientes: '/api/clientes',
      productos: '/api/productos',
      ventas: '/api/ventas' 
    }
  });
});

// Rutas de la API
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});