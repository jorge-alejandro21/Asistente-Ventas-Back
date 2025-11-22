import express from 'express'
import Producto from '../models/Producto.js'

const router = express.Router()

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find().sort({ createdAt: -1 })
    res.json(productos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id)
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    res.json(producto)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Crear un nuevo producto
router.post('/', async (req, res) => {
  try {
    const producto = new Producto(req.body)
    const productoGuardado = await producto.save()
    res.status(201).json(productoGuardado)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Actualizar un producto
router.put('/:id', async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    res.json(producto)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Eliminar un producto
router.delete('/:id', async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id)
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    res.json({ message: 'Producto eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

