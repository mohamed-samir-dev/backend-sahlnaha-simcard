const Product = require("../models/Product");

function normalizeArabic(str) {
  return str
    .replace(/[أإآا]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي");
}

exports.getProducts = async (req, res) => {
  try {
    const { q, brand, category, limit } = req.query;
    const query = {};
    if (brand) query.brand = { $regex: new RegExp(`^${brand}$`, "i") };
    if (category) query.category = category;

    if (!q) {
      let cursor = Product.find(query).sort({ createdAt: -1 });
      if (limit) cursor = cursor.limit(parseInt(limit));
      return res.json(await cursor);
    }

    const normalized = normalizeArabic(q);
    const products = await Product.find(query).sort({ createdAt: -1 });
    const filtered = products.filter((p) =>
      normalizeArabic(p.name).includes(normalized)
    );
    res.json(filtered);
  } catch (err) {
    console.error("getProducts error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  const [stc, mobily] = await Promise.all([
    Product.find({ inStock: true, brand: { $regex: /^stc/i } }).sort({ originalPrice: -1 }).limit(2),
    Product.find({ inStock: true, brand: { $regex: /موبايلي/ } }).sort({ originalPrice: -1 }).limit(2),
  ]);
  res.json([...stc, ...mobily]);
};


exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

exports.createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
};

exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted" });
};
