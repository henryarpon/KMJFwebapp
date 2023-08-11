import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
    totalPrice: Number,
    quantity: Number,
    created_at: Date,
    updated_at: Date
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
