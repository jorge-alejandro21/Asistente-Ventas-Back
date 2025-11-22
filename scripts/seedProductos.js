import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Producto from '../models/Producto.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../.env') })

const productos = [
  {
    nombre: 'Frenos de Disco Carbono Cerámico Brembo',
    precio: 1250000,
    stock: 8,
    activo: true,
    descripcion: 'Sistema de frenos de disco carbono cerámico de alta gama Brembo para motos deportivas. Máxima potencia de frenado y resistencia al desgaste.'
  },
  {
    nombre: 'Suspensión Öhlins TTX36 Pro',
    precio: 2800000,
    stock: 5,
    activo: true,
    descripcion: 'Amortiguador trasero Öhlins TTX36 de nivel profesional. Ajuste completo de compresión, rebote y precarga. Para uso en pista y calle.'
  },
  {
    nombre: 'Escape Akrapovič Titanio Full System',
    precio: 3200000,
    stock: 6,
    activo: true,
    descripcion: 'Sistema de escape completo en titanio Akrapovič. Reducción de peso, aumento de potencia y sonido deportivo característico.'
  },
  {
    nombre: 'Ruedas Forgiato Forged Carbon',
    precio: 4500000,
    stock: 4,
    activo: true,
    descripcion: 'Juego de ruedas forjadas en fibra de carbono Forgiato. Diseño exclusivo, peso ultra ligero y máxima resistencia.'
  },
  {
    nombre: 'Asiento de Cuero Italiano Personalizado',
    precio: 850000,
    stock: 12,
    activo: true,
    descripcion: 'Asiento tapizado en cuero italiano de primera calidad con costuras personalizadas. Máximo confort y elegancia.'
  },
  {
    nombre: 'Manubrio Clip-On de Fibra de Carbono',
    precio: 650000,
    stock: 15,
    activo: true,
    descripcion: 'Manubrio clip-on en fibra de carbono de alta resistencia. Posición deportiva y peso mínimo.'
  },
  {
    nombre: 'Kit de Transmisión Racing STM',
    precio: 1800000,
    stock: 7,
    activo: true,
    descripcion: 'Kit completo de transmisión racing STM con embrague slipper. Para motos de alta cilindrada y uso intensivo.'
  },
  {
    nombre: 'Tanque de Combustible de Fibra de Carbono',
    precio: 2200000,
    stock: 3,
    activo: true,
    descripcion: 'Tanque de combustible en fibra de carbono autoclave. Reducción de peso significativa y diseño exclusivo.'
  },
  {
    nombre: 'Sistema de Inyección Power Commander V',
    precio: 950000,
    stock: 10,
    activo: true,
    descripcion: 'Sistema de gestión de motor Power Commander V con mapeo personalizado. Optimización de rendimiento y consumo.'
  },
  {
    nombre: 'Kit de Carrocería Full Carbon Racing',
    precio: 3500000,
    stock: 5,
    activo: true,
    descripcion: 'Kit completo de carrocería en fibra de carbono para pista. Carenado, colín y guardabarros. Diseño aerodinámico profesional.'
  }
]

const seedProductos = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Conectado a MongoDB')

    // Limpiar productos existentes (opcional - comentar si no quieres eliminar)
    // await Producto.deleteMany({})
    // console.log('🗑️  Productos existentes eliminados')

    // Insertar productos
    const productosCreados = await Producto.insertMany(productos)
    console.log(`✅ ${productosCreados.length} productos creados exitosamente:`)
    
    productosCreados.forEach((producto, index) => {
      console.log(`   ${index + 1}. ${producto.nombre} - $${producto.precio.toLocaleString()}`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Error al crear productos:', error)
    process.exit(1)
  }
}

seedProductos()

