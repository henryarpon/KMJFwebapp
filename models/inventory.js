import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    sku: String,
    product_name: String,
    quantity_received: Number,
    quantity_inStock: Number,
    cost_price: Number,
    selling_price: Number,
    supplier: String,
    send_email: Boolean,
    supplier_email: String,
    reorder_point: Number,
    reorder_quantity: Number,
    document_number: String,
    created_at: Date,
    updated_at: Date
});

inventorySchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;