import Cart from "../models/cart.js";

const removeFromCart = async (req, res) => {
    try {
        const { items } = req.body;

        // Remove cart items with the provided item IDs
        await Cart.deleteMany({ _id : { $in: items } });

        return res.json({ message: 'Items removed from cart successfully' });
    } 
    catch (error) {
        console.error('Error removing items from cart:', error);
        return res.json({ error: 'Internal server error' });
    }
};

export default removeFromCart;