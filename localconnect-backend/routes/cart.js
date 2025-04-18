const express = require("express");
const router = express.Router();
const db = require("../db"); // Adjust based on your setup

// Add item to cart
router.post("/add", async (req, res) => {
  const { user_id, product_id } = req.body;

  try {
    // Get current product stock
    const [product] = await db.query("SELECT stock FROM products WHERE product_id = ?", [product_id]);

    if (product.length === 0) return res.status(404).json({ error: "Product not found" });

    const stock = product[0].stock;

    // Check if item already in cart
    const [existing] = await db.query(
      "SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?",
      [user_id, product_id]
    );

    if (existing.length > 0) {
      // Update quantity only if less than stock
      if (existing[0].quantity < stock) {
        await db.query(
          "UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?",
          [user_id, product_id]
        );
        return res.json({ message: "Quantity updated" });
      } else {
        return res.status(400).json({ error: "Reached maximum stock limit" });
      }
    } else {
      await db.query("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1)", [user_id, product_id]);
      return res.json({ message: "Item added to cart" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/increment", async (req, res) => {
  const { user_id, product_id } = req.body;

  try {
    // Get the current quantity in the cart and the stock of the product
    const [cartRows] = await db.query("SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?", [user_id, product_id]);
    const [productRows] = await db.query("SELECT stock FROM products WHERE product_id = ?", [product_id]);

    // If no cart entry or product found, return a 404 error
    if (!cartRows.length || !productRows.length) {
      return res.status(404).json({ error: "Item not found in cart or product does not exist." });
    }

    const currentQuantity = cartRows[0].quantity;
    const stock = productRows[0].stock;

    // Check if incrementing will exceed stock
    if (currentQuantity + 1 > stock) {
      return res.status(400).json({ error: "Cannot exceed stock limit." });
    }

    // If stock allows, increment the quantity
    await db.query("UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?", [user_id, product_id]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: "Failed to increment quantity." });
  }
});

router.post("/decrement", async (req, res) => {
  const { user_id, product_id } = req.body;

  try {
    const [rows] = await db.query("SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?", [user_id, product_id]);
    if (!rows.length) return res.status(404).json({ error: "Item not found." });

    const quantity = rows[0].quantity;

    if (quantity <= 1) {
      await db.query("DELETE FROM cart WHERE user_id = ? AND product_id = ?", [user_id, product_id]);
    } else {
      await db.query("UPDATE cart SET quantity = quantity - 1 WHERE user_id = ? AND product_id = ?", [user_id, product_id]);
    }

    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: "Failed to decrement quantity." });
  }
});

router.post("/remove", async (req, res) => {
  const { user_id, product_id } = req.body;

  try {
    await db.query("DELETE FROM cart WHERE user_id = ? AND product_id = ?", [user_id, product_id]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: "Failed to remove item." });
  }
});

// Get cart for a user
router.get("/:user_id", async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const [cart] = await db.query(
      `SELECT c.*, p.name, p.price FROM cart c 
       JOIN products p ON c.product_id = p.product_id 
       WHERE c.user_id = ?`,
      [user_id]
    );
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;
