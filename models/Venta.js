import mongoose from 'mongoose'

const ventaSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: [true, 'El cliente es requerido']
  },
  productos: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1
    },
    precioUnitario: {
      type: Number,
      required: true
    }
  }],
  montoTotal: {
    type: Number,
    required: [true, 'El monto total es requerido'],
    min: 0
  },
  estado: {
    type: String,
    enum: ['pendiente', 'completada', 'cancelada'],
    default: 'pendiente'
  },
  metodoPago: {
    type: String,
    enum: ['efectivo', 'transferencia', 'tarjeta', 'otro'],
    default: 'efectivo'
  },
  notas: {
    type: String,
    trim: true
  },
  telegramChatId: {
    type: String
  }
}, {
  timestamps: true
})

// Actualizar estadísticas del cliente después de crear una venta
ventaSchema.post('save', async function() {
  if (this.estado === 'completada' && this.cliente) {
    const Cliente = mongoose.model('Cliente')
    await Cliente.findByIdAndUpdate(this.cliente, {
      $inc: { 
        totalCompras: 1,
        totalGastado: this.montoTotal
      }
    })
  }
})

const Venta = mongoose.model('Venta', ventaSchema)

export default Venta

