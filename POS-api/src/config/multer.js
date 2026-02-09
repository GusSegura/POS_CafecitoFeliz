const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Definir ruta de uploads
const uploadPath = path.join(__dirname, '../../public/uploads/productos');

// Crear carpeta si no existe
if (!fs.existsSync(uploadPath)) {

  fs.mkdirSync(uploadPath, { recursive: true });

} else {

}

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = 'producto-' + uniqueSuffix + ext;

    cb(null, filename);
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {

    return cb(null, true);
  }
  

  cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
};

// Configurar multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;