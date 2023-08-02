import Inventory from "../models/inventory.js";

const deleteInventoryItem = async (req, res) => {

    try {
        const itemId = req.params.itemId;

        await Inventory.findByIdAndDelete(itemId);
        res.json({ success: true, message: 'Item Deleted' });
    } 
    catch (err) {
        console.error(err);
        res.json({ success: false, message: 'Error deleting inventory' });
    }
};

export default deleteInventoryItem;