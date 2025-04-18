const express = require("express");
const cors = require("cors");
const vendorsRoute = require("./routes/vendors");
const productsRoute = require("./routes/products");
const cartRoute = require("./routes/cart");
const userRoutes = require("./routes/userRoutes");  // Import your userRoutes

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Use the routes
app.use("/api/vendors", vendorsRoute);
app.use("/api/products", productsRoute);
app.use("/api/cart", cartRoute);
app.use("/api/users", userRoutes);  // Add the userRoutes middleware

app.get("/", (req, res) => {
  res.send("✅ LocalConnect API is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
