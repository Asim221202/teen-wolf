const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    items: { type: [String], default: [] } // Ürün isimleri burada tutulur
});

module.exports = mongoose.model('Inventory', inventorySchema);
