const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    console.log("Fetching all products...");
    const [rows] = await pool.execute("SELECT * FROM Products");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch products");
  }
});

// This must come after the "/" route
router.get('/:id', async (req, res) => {
  const productId = req.params.id;
  console.log(typeof productId); // Debug log
  console.log('Fetching product with ID:', productId); // Debug log
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM Products WHERE product_id = ?',
      [productId]
    );
    console.log('Query result:', rows); // Debug log

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;
