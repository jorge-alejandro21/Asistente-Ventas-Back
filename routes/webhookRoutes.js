import express from 'express'
import Cliente from '../models/Cliente.js'
import Venta from '../models/Venta.js'
import Producto from '../models/Producto.js'

const router = express.Router()

// Middleware para validar webhook (opcional - puedes agregar autenticación)
const validateWebhook = (req, res, next) => {
  // Aquí puedes agregar validación de token si lo necesitas
  // const token = req.headers['x-webhook-token']
  // if (token !== process.env.WEBHOOK_TOKEN) {
  //   return res.status(401).json({ error: 'Token inválido' })
  // }
  next()
}

// Webhook para crear cliente desde n8n/Telegram
router.post('/cliente', validateWebhook, async (req, res) => {
  try {
    const { nombre, cedula, telefono, email, telegramId } = req.body

    if (!nombre || !telefono) {
      return res.status(400).json({ 
        error: 'Nombre y teléfono son requeridos' 
      })
    }

    // Verificar si el cliente ya existe por telegramId o teléfono
    let cliente = await Cliente.findOne({
      $or: [
        { telegramId: telegramId },
        { telefono: telefono }
      ]
    })

    if (cliente) {
      // Actualizar cliente existente
      cliente.nombre = nombre
      if (cedula) cliente.cedula = cedula
      if (email) cliente.email = email
      if (telegramId) cliente.telegramId = telegramId
      await cliente.save()
      return res.json({ 
        message: 'Cliente actualizado',
        cliente 
      })
    }

    // Crear nuevo cliente
    cliente = new Cliente({
      nombre,
      cedula: cedula || '',
      telefono,
      email: email || '',
      telegramId: telegramId || ''
    })

    await cliente.save()

    res.status(201).json({
      message: 'Cliente creado exitosamente',
      cliente
    })
  } catch (error) {
    console.error('Error en webhook cliente:', error)
    res.status(500).json({ 
      error: 'Error al crear cliente',
      message: error.message 
    })
  }
})

// Webhook para crear venta desde n8n/Telegram
router.post('/venta', validateWebhook, async (req, res) => {
  try {
    const { 
      clienteId, 
      telegramId, 
      productos, // Array de { productoId, cantidad }
      metodoPago,
      notas 
    } = req.body

    // Buscar cliente por ID o telegramId
    let cliente
    if (clienteId) {
      cliente = await Cliente.findById(clienteId)
    } else if (telegramId) {
      cliente = await Cliente.findOne({ telegramId })
    }

    if (!cliente) {
      return res.status(404).json({ 
        error: 'Cliente no encontrado' 
      })
    }

    if (!productos || productos.length === 0) {
      return res.status(400).json({ 
        error: 'Debe incluir al menos un producto' 
      })
    }

    // Validar y calcular monto total
    let montoTotal = 0
    const productosConPrecio = []

    for (const item of productos) {
      const producto = await Producto.findById(item.productoId)
      
      if (!producto) {
        return res.status(404).json({ 
          error: `Producto ${item.productoId} no encontrado` 
        })
      }

      if (!producto.activo) {
        return res.status(400).json({ 
          error: `Producto ${producto.nombre} no está activo` 
        })
      }

      if (producto.stock < item.cantidad) {
        return res.status(400).json({ 
          error: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}` 
        })
      }

      const precioUnitario = producto.precio
      montoTotal += precioUnitario * item.cantidad

      productosConPrecio.push({
        producto: producto._id,
        cantidad: item.cantidad,
        precioUnitario
      })

      // Actualizar stock
      producto.stock -= item.cantidad
      await producto.save()
    }

    // Crear venta
    const venta = new Venta({
      cliente: cliente._id,
      productos: productosConPrecio,
      montoTotal,
      estado: 'completada',
      metodoPago: metodoPago || 'efectivo',
      notas: notas || `Venta desde Telegram - ${cliente.nombre}`,
      telegramChatId: telegramId
    })

    await venta.save()

    // Las estadísticas del cliente se actualizan automáticamente por el hook post-save

    const ventaPopulada = await Venta.findById(venta._id)
      .populate('cliente', 'nombre telefono email')
      .populate('productos.producto', 'nombre precio')

    res.status(201).json({
      message: 'Venta creada exitosamente',
      venta: ventaPopulada
    })
  } catch (error) {
    console.error('Error en webhook venta:', error)
    res.status(500).json({ 
      error: 'Error al crear venta',
      message: error.message 
    })
  }
})

// Webhook para obtener productos disponibles
router.get('/productos', validateWebhook, async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true, stock: { $gt: 0 } })
      .select('nombre precio stock descripcion')
      .sort({ nombre: 1 })

    res.json({
      productos,
      total: productos.length
    })
  } catch (error) {
    console.error('Error al obtener productos:', error)
    res.status(500).json({ 
      error: 'Error al obtener productos',
      message: error.message 
    })
  }
})

// Webhook para obtener información de cliente por Telegram ID
router.get('/cliente/:telegramId', validateWebhook, async (req, res) => {
  try {
    const { telegramId } = req.params
    
    const cliente = await Cliente.findOne({ telegramId })
      .select('nombre cedula telefono email totalCompras totalGastado')

    if (!cliente) {
      return res.status(404).json({ 
        error: 'Cliente no encontrado' 
      })
    }

    res.json({ cliente })
  } catch (error) {
    console.error('Error al obtener cliente:', error)
    res.status(500).json({ 
      error: 'Error al obtener cliente',
      message: error.message 
    })
  }
})

export default router

