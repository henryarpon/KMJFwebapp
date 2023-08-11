import Inventory from "../models/inventory.js";
import Cart from "../models/cart.js";

const deleteInventoryItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        // Find the inventory item and delete it
        const deletedInventoryItem = await Inventory.findByIdAndDelete(itemId);

        // If the inventory item was deleted, remove it from the cart
        if (deletedInventoryItem) {
            await Cart.deleteMany({ inventoryItem: deletedInventoryItem._id });
        }

        res.json({ success: true, message: 'Item Deleted' });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: 'Error deleting inventory' });
    }
};

export default deleteInventoryItem;
