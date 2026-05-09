const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { sku, name, category, price, cost, stock, description, imageUrl } = req.body;

    // Validation
    if (!sku || !name || !category || price == null || cost == null) {
      return res.status(400).json({ error: 'Los campos SKU, nombre, categoría, precio y costo son obligatorios.' });
    }
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'El precio debe ser un número positivo.' });
    }
    if (typeof cost !== 'number' || cost < 0) {
      return res.status(400).json({ error: 'El costo debe ser un número positivo.' });
    }
    if (stock != null && (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock))) {
      return res.status(400).json({ error: 'El stock debe ser un número entero positivo.' });
    }

    // Check unique SKU
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return res.status(409).json({ error: `Ya existe un producto con el SKU "${sku}".` });
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        category,
        price,
        cost,
        stock: stock ?? 0,
        description: description || null,
        imageUrl: imageUrl || null
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, category, price, cost, stock, description, imageUrl } = req.body;

    // Validation
    if (!sku || !name || !category || price == null || cost == null) {
      return res.status(400).json({ error: 'Los campos SKU, nombre, categoría, precio y costo son obligatorios.' });
    }
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'El precio debe ser un número positivo.' });
    }
    if (typeof cost !== 'number' || cost < 0) {
      return res.status(400).json({ error: 'El costo debe ser un número positivo.' });
    }

    // Check unique SKU (excluding current product)
    const existing = await prisma.product.findFirst({
      where: { sku, id: { not: Number(id) } }
    });
    if (existing) {
      return res.status(409).json({ error: `Ya existe otro producto con el SKU "${sku}".` });
    }

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        sku,
        name,
        category,
        price,
        cost,
        stock: stock ?? 0,
        description: description || null,
        imageUrl: imageUrl || null
      },
    });
    res.json(product);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product has associated sales
    const salesCount = await prisma.saleItem.count({
      where: { productId: Number(id) }
    });
    if (salesCount > 0) {
      return res.status(409).json({ 
        error: `No se puede eliminar este producto porque tiene ${salesCount} venta(s) asociada(s). Considere poner el stock en 0 en su lugar.` 
      });
    }

    await prisma.product.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
