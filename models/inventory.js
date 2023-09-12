import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    product_name: String,
    quantity_received: Number,
    quantity_inStock: Number,
    cost_price: Number,
    selling_price: Number,
    supplier: String,
    sku: String,
    reorderPoint: Number,
    documentNumber: String,
    created_at: Date,
    updated_at: Date
});

inventorySchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;