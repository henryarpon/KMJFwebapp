import Inventory from "../models/inventory.js";
const editInventoryItem = async (req, res) => {
    // startChangeStream();
    const {
        sku,
        product_name,
        received_quantity,
        quantity_inStock,
        cost_price,
        selling_price,
        supplier,
        supplier_email,
        reorder_point,
        reorder_quantity,
        document_number,
        itemId
    } = req.body; 

    try {
        const capitalizedSKU = sku.toUpperCase();

        const capitalizeFirstLetter = (str) => {
            return str.charAt(0).toUpperCase() + str.slice(1);
        };

        // Prepare the updated data
        const updatedData = {
            sku: capitalizedSKU,
            product_name: capitalizeFirstLetter(product_name),
            quantity_received: received_quantity,
            quantity_inStock: quantity_inStock,
            cost_price: cost_price,
            selling_price: selling_price,
            supplier: capitalizeFirstLetter(supplier),
            supplier_email: supplier_email, 
            reorder_point: reorder_point,
            reorder_quantity: reorder_quantity, 
            document_number: document_number
        };

        // Update the inventory item with the new data
        const updatedItem = await Inventory.findByIdAndUpdate(itemId, updatedData, { new: true });

        if (!updatedItem) {
            return res.json({ success: false, message: 'Inventory item not found' });
        }

        return res.json({ success: true, message: 'Inventory item updated successfully' });
    } 
    catch (error) {
        return res.json({ success: false, message: 'An error occurred while updating the inventory item' });
    }
};

export default editInventoryItem;
