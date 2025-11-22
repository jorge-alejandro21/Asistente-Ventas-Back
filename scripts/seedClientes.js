import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Cliente from '../models/Cliente.js'
import Venta from '../models/Venta.js'
import Producto from '../models/Producto.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../.env') })

const clientesData = [
  {
    nombre: 'Pepito',
    cedula: '1023456789',
    telefono: '+57 300 123 4567',
    email: 'pepito.rodriguez@email.com',
    telegramId: '123456789'
  },
  {
    nombre: 'Carolina',
    cedula: '5234567890',
    telefono: '+57 310 987 6543',
    email: 'carolina.martinez@email.com',
    telegramId: '987654321'
  },
  {
    nombre: 'Alan',
    cedula: '7890123456',
    telefono: '+57 315 555 1234',
    email: 'alan.torres@email.com',
    telegramId: '456789123'
  }
]

const seedClientes = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Conectado a MongoDB')

    // Obtener productos disponibles
    const productos = await Producto.find({ activo: true })
    if (productos.length === 0) {
      console.log('⚠️  No hay productos en la base de datos. Ejecuta primero: npm run seed:productos')
      process.exit(1)
    }

    console.log(`📦 Productos disponibles: ${productos.length}`)

    // Limpiar clientes y ventas existentes (opcional)
    // await Cliente.deleteMany({})
    // await Venta.deleteMany({})
    // console.log('🗑️  Clientes y ventas existentes eliminados')

    const clientesCreados = []
    const ventasCreadas = []

    // Crear clientes y sus ventas
    for (const clienteData of clientesData) {
      // Crear cliente
      const cliente = new Cliente(clienteData)
      await cliente.save()
      clientesCreados.push(cliente)
      console.log(`\n✅ Cliente creado: ${cliente.nombre}`)
      console.log(`   Cédula: ${cliente.cedula}`)
      console.log(`   Email: ${cliente.email}`)
      console.log(`   Teléfono: ${cliente.telefono}`)

      // Crear 2-4 ventas por cliente
      const numVentas = Math.floor(Math.random() * 3) + 2 // 2 a 4 ventas
      
      for (let i = 0; i < numVentas; i++) {
        // Seleccionar 1-3 productos aleatorios
        const numProductos = Math.floor(Math.random() * 3) + 1
        const productosSeleccionados = []
        const productosUsados = new Set()
        
        for (let j = 0; j < numProductos; j++) {
          let producto
          do {
            producto = productos[Math.floor(Math.random() * productos.length)]
          } while (productosUsados.has(producto._id.toString()))
          
          productosUsados.add(producto._id.toString())
          
          const cantidad = Math.floor(Math.random() * 2) + 1 // 1 o 2 unidades
          productosSeleccionados.push({
            producto: producto._id,
            cantidad: cantidad,
            precioUnitario: producto.precio
          })
        }

        // Calcular monto total
        const montoTotal = productosSeleccionados.reduce((sum, item) => {
          return sum + (item.precioUnitario * item.cantidad)
        }, 0)

        // Métodos de pago aleatorios
        const metodosPago = ['efectivo', 'transferencia', 'tarjeta']
        const metodoPago = metodosPago[Math.floor(Math.random() * metodosPago.length)]

        // Crear venta
        const venta = new Venta({
          cliente: cliente._id,
          productos: productosSeleccionados,
          montoTotal: montoTotal,
          estado: 'completada',
          metodoPago: metodoPago,
          notas: `Venta realizada por ${cliente.nombre}`
        })

        await venta.save()
        ventasCreadas.push(venta)

        // Actualizar stock de productos
        for (const item of productosSeleccionados) {
          await Producto.findByIdAndUpdate(item.producto, {
            $inc: { stock: -item.cantidad }
          })
        }

        const productosNombres = productosSeleccionados.map(item => {
          const prod = productos.find(p => p._id.toString() === item.producto.toString())
          return `${prod.nombre} (x${item.cantidad})`
        }).join(', ')

        console.log(`   💰 Venta ${i + 1}: $${montoTotal.toLocaleString()} - ${productosNombres}`)
      }
    }

    // Actualizar estadísticas de clientes (las ventas ya lo hacen automáticamente, pero refrescamos)
    for (const cliente of clientesCreados) {
      await cliente.populate('totalCompras')
      const ventasCliente = await Venta.find({ cliente: cliente._id, estado: 'completada' })
      const totalGastado = ventasCliente.reduce((sum, v) => sum + v.montoTotal, 0)
      
      await Cliente.findByIdAndUpdate(cliente._id, {
        totalCompras: ventasCliente.length,
        totalGastado: totalGastado
      })
    }

    console.log(`\n✅ Resumen:`)
    console.log(`   Clientes creados: ${clientesCreados.length}`)
    console.log(`   Ventas creadas: ${ventasCreadas.length}`)
    console.log(`   Total en ventas: $${ventasCreadas.reduce((sum, v) => sum + v.montoTotal, 0).toLocaleString()}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error al crear clientes y ventas:', error)
    process.exit(1)
  }
}

seedClientes()

