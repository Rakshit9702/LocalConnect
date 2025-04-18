const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM Vendors");
    res.json(rows); 
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch vendors");
  }
});

router.get('/:vendorId/products', async (req, res) => {
  const vendorId = req.params.vendorId;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM Products WHERE vendor_id = ?',
      [vendorId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No products found for this vendor' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching vendor products:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post("/", async (req, res) => {
  const { name, contact, location } = req.body;
  try {
    const [result] = await pool.execute(
      "INSERT INTO Vendors (name, contact, location) VALUES (?, ?, ?)",
      [name, contact, location]
    );
    res.status(201).json({ vendor_id: result.insertId, name, contact, location });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to create vendor");
  }
});

module.exports = router;
