import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/database.js'
import productoRoutes from './routes/productoRoutes.js'
import clienteRoutes from './routes/clienteRoutes.js'
import ventaRoutes from './routes/ventaRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import webhookRoutes from './routes/webhookRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Conectar a MongoDB
connectDB()

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

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Algo salió mal!', 
    message: err.message 
  })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})

