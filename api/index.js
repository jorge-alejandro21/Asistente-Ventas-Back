// Este archivo es para Vercel Serverless Functions
// Exporta la app de Express para que Vercel la maneje

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from '../config/database.js'
import productoRoutes from '../routes/productoRoutes.js'
import clienteRoutes from '../routes/clienteRoutes.js'
import ventaRoutes from '../routes/ventaRoutes.js'
import dashboardRoutes from '../routes/dashboardRoutes.js'
import webhookRoutes from '../routes/webhookRoutes.js'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Conectar a MongoDB solo una vez
let dbConnected = false
const connectOnce = async () => {
  if (!dbConnected) {
    await connectDB()
    dbConnected = true
  }
}

// Middleware para conectar DB en cada request
app.use(async (req, res, next) => {
  await connectOnce()
  next()
})

// Routes
app.use('/api/productos', productoRoutes)
app.use('/api/clientes', clienteRoutes)
app.use('/api/ventas', ventaRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/webhook', webhookRoutes)

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' })
})

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Asistente Ventas Telegram',
    version: '1.0.0',
    endpoints: {
      productos: '/api/productos',
      clientes: '/api/clientes',
      ventas: '/api/ventas',
      dashboard: '/api/dashboard',
      webhooks: '/api/webhook'
    }
  })
})

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Algo salió mal!', 
    message: err.message 
  })
})

// Exportar para Vercel
export default app

