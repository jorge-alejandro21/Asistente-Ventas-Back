import mongoose from 'mongoose'

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  activo: {
    type: Boolean,
    default: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  imagen: {
    type: String
  }
}, {
  timestamps: true
})

const Producto = mongoose.model('Producto', productoSchema)

export default Producto

