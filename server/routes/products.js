import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const productsFilePath = path.join(__dirname, '../data/products.json');

function getProducts() {
  const data = fs.readFileSync(productsFilePath, 'utf-8');
  return JSON.parse(data);
}

// GET all products with filtering, search, and sorting
router.get('/', (req, res) => {
  try {
    let products = getProducts();
    const { category, search, sort, featured } = req.query;

    if (category && category !== 'all') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const term = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.tagline.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.origin.toLowerCase().includes(term)
      );
    }

    if (featured === 'true') {
      products = products.filter(p => p.rating >= 4.8);
    }

    if (sort === 'price_asc') {
      products.sort((a, b) => a.options[0].price - b.options[0].price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.options[0].price - a.options[0].price);
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    }

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
});

// GET single product by ID
router.get('/:id', (req, res) => {
  try {
    const products = getProducts();
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching product', error: error.message });
  }
});

// GET categories overview
router.get('/meta/categories', (req, res) => {
  try {
    const products = getProducts();
    const categories = [
      {
        id: 'mangoes',
        name: 'Juicy Mangoes',
        icon: '🥭',
        tagline: 'Farm-Fresh Naturally Ripened',
        description: 'Banganapalli, Alphonso, Gir Kesar & more straight from verified orchards.',
        itemCount: products.filter(p => p.category === 'mangoes').length,
        image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'pickles',
        name: 'Traditional Pickles',
        icon: '🌶️',
        tagline: 'Grandma’s Sun-Cured Heritage',
        description: 'Andhra Avakaya, Gongura, Garlic Tomato, and aged Sun-dried Lemons.',
        itemCount: products.filter(p => p.category === 'pickles').length,
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'cooking-oil',
        name: 'Pure Cooking Oils',
        icon: '🛢️',
        tagline: 'Traditional Wood-Pressed (Chekku)',
        description: 'Cold pressed groundnut, sesame, mustard, and virgin coconut oils.',
        itemCount: products.filter(p => p.category === 'cooking-oil').length,
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80'
      }
    ];

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

export default router;
