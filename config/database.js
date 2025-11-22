import mongoose from 'mongoose'

// Cache de la conexión para Vercel Serverless
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

const connectDB = async () => {
  // Si ya hay una conexión, la reutilizamos (importante para Vercel)
  if (cached.conn) {
    return cached.conn
  }

  // Si no hay una promesa de conexión en curso, creamos una
  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log(`✅ MongoDB conectado exitosamente`)
      console.log(`   Host: ${mongoose.connection.host}`)
      console.log(`   Base de datos: ${mongoose.connection.name}`)
      return mongoose
    }).catch((error) => {
      console.error(`❌ Error al conectar MongoDB: ${error.message}`)
      console.error(`   Verifica que la URI sea correcta y que tu IP esté permitida en MongoDB Atlas`)
      cached.promise = null
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB

