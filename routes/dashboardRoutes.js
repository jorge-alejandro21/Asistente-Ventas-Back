import express from 'express'
import Producto from '../models/Producto.js'
import Cliente from '../models/Cliente.js'
import Venta from '../models/Venta.js'

const router = express.Router()

// Obtener estadísticas del dashboard
router.get('/stats', async (req, res) => {
  try {
    const totalVentas = await Venta.countDocuments({ estado: 'completada' })
    const totalClientes = await Cliente.countDocuments()
    const totalProductos = await Producto.countDocuments({ activo: true })

    // Ingresos de hoy
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const ingresosHoy = await Venta.aggregate([
      {
        $match: {
          estado: 'completada',
          createdAt: { $gte: hoy }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$montoTotal' }
        }
      }
    ])

    const stats = {
      totalVentas,
      totalClientes,
      totalProductos,
      ingresosHoy: ingresosHoy.length > 0 ? ingresosHoy[0].total : 0
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener ventas recientes
router.get('/ventas-recientes', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const ventas = await Venta.find({ estado: 'completada' })
      .populate('cliente', 'nombre')
      .populate('productos.producto', 'nombre')
      .sort({ createdAt: -1 })
      .limit(limit)

    const ventasSimplificadas = ventas.map(venta => ({
      id: venta._id,
      cliente: venta.cliente?.nombre || 'Cliente eliminado',
      producto: venta.productos[0]?.producto?.nombre || 'Producto eliminado',
      monto: venta.montoTotal,
      fecha: venta.createdAt
    }))

    res.json(ventasSimplificadas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

