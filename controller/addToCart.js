import Cart from "../models/cart.js";

const updateCartItem = async (existingCartItem, parsedQuantity, parsedTotalPrice) => {
    existingCartItem.quantity += parsedQuantity;
    existingCartItem.totalPrice += parsedTotalPrice;
    await existingCartItem.save();
};

const createCartItem = async (itemId, totalPrice, itemQuantity) => {
    const newCartItem = new Cart({
        inventoryItem: itemId,
        totalPrice: totalPrice,
        quantity: itemQuantity,
        created_at: new Date(),
        updated_at: new Date()
    });
    await newCartItem.save();
};

const addToCart = async (req, res) => {
    try {
        const { itemId, itemQuantity, totalPrice } = req.body;

        const parsedQuantity = parseInt(itemQuantity);
        const parsedTotalPrice = parseFloat(totalPrice);
        
        const existingCartItem = await Cart.findOne({ inventoryItem: itemId });

        if (existingCartItem) {
            await updateCartItem(existingCartItem, parsedQuantity, parsedTotalPrice);
        } else {
            await createCartItem(itemId, totalPrice, itemQuantity);
        }

        return res.json({ message: 'Item added to cart successfully' });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export default addToCart