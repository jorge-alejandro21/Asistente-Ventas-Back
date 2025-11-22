import express from 'express'
import Venta from '../models/Venta.js'
import Producto from '../models/Producto.js'

const router = express.Router()

// Obtener todas las ventas
router.get('/', async (req, res) => {
  try {
    const ventas = await Venta.find()
      .populate('cliente', 'nombre telefono email')
      .populate('productos.producto', 'nombre precio')
      .sort({ createdAt: -1 })
    res.json(ventas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener una venta por ID
router.get('/:id', async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('cliente', 'nombre telefono email')
      .populate('productos.producto', 'nombre precio')
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' })
    }
    res.json(venta)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Crear una nueva venta
router.post('/', async (req, res) => {
  try {
    const { cliente, productos, metodoPago, notas, telegramChatId } = req.body

    // Validar y calcular monto total
    let montoTotal = 0
    const productosConPrecio = []

    for (const item of productos) {
      const producto = await Producto.findById(item.producto)
      if (!producto) {
        return res.status(404).json({ error: `Producto ${item.producto} no encontrado` })
      }
      if (producto.stock < item.cantidad) {
        return res.status(400).json({ 
          error: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}` 
        })
      }

      const precioUnitario = item.precioUnitario || producto.precio
      montoTotal += precioUnitario * item.cantidad

      productosConPrecio.push({
        producto: item.producto,
        cantidad: item.cantidad,
        precioUnitario
      })

      // Actualizar stock
      producto.stock -= item.cantidad
      await producto.save()
    }

    const venta = new Venta({
      cliente,
      productos: productosConPrecio,
      montoTotal,
      metodoPago: metodoPago || 'efectivo',
      notas,
      telegramChatId
    })

    const ventaGuardada = await venta.save()
    const ventaPopulada = await Venta.findById(ventaGuardada._id)
      .populate('cliente', 'nombre telefono email')
      .populate('productos.producto', 'nombre precio')

    res.status(201).json(ventaPopulada)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Actualizar una venta
router.put('/:id', async (req, res) => {
  try {
    const venta = await Venta.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('cliente', 'nombre telefono email')
      .populate('productos.producto', 'nombre precio')

    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' })
    }
    res.json(venta)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Eliminar una venta
router.delete('/:id', async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' })
    }

    // Restaurar stock si la venta estaba completada
    if (venta.estado === 'completada') {
      for (const item of venta.productos) {
        const producto = await Producto.findById(item.producto)
        if (producto) {
          producto.stock += item.cantidad
          await producto.save()
        }
      }
    }

    await Venta.findByIdAndDelete(req.params.id)
    res.json({ message: 'Venta eliminada correctamente' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

