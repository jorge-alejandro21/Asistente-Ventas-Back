import express from 'express'
import Cliente from '../models/Cliente.js'

const router = express.Router()

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ createdAt: -1 })
    res.json(clientes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener un cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id)
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }
    res.json(cliente)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Crear un nuevo cliente
router.post('/', async (req, res) => {
  try {
    const cliente = new Cliente(req.body)
    const clienteGuardado = await cliente.save()
    res.status(201).json(clienteGuardado)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Actualizar un cliente
router.put('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }
    res.json(cliente)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Eliminar un cliente
router.delete('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id)
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }
    res.json({ message: 'Cliente eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

