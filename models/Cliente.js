import mongoose from 'mongoose'

const clienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del cliente es requerido'],
    trim: true
  },
  cedula: {
    type: String,
    trim: true
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  telegramId: {
    type: String,
    unique: true,
    sparse: true
  },
  totalCompras: {
    type: Number,
    default: 0,
    min: 0
  },
  totalGastado: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
})

const Cliente = mongoose.model('Cliente', clienteSchema)

export default Cliente

