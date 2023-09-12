import Inventory from "../models/inventory.js";

const editInventoryItem = async (req, res) => {

    const {
        sku,
        productName,
        receivedQuantity,
        quantityInStock,
        costPrice,
        sellingPrice,
        supplier,
        reorderPoint,
        documentNumber,
        itemId
    } = req.body; 

    try {

        const existingItem = await Inventory.findById(itemId);

        if (!existingItem) {
        return res.json({ success: false, message: 'Inventory item not found' });
        }

        const capitalizedSKU = sku.toUpperCase();

        const capitalizeFirstLetter = (str) => {
            return str.charAt(0).toUpperCase() + str.slice(1);
        };

        // Update the inventory item fields with the new data
        existingItem.product_name = capitalizeFirstLetter(productName);
        existingItem.quantity_received = receivedQuantity;
        existingItem.quantity_inStock = quantityInStock;
        existingItem.cost_price = costPrice;
        existingItem.selling_price = sellingPrice;
        existingItem.supplier = capitalizeFirstLetter(supplier);
        existingItem.sku = capitalizedSKU;
        existingItem.reorderPoint = reorderPoint;
        existingItem.documentNumber = documentNumber;
        
        // Save the updated inventory item back to the database
        await existingItem.save();

        return res.json({ success: true, message: 'Inventory item updated successfully' });
    } 
    catch (error) {
        console.log('Error', error);
        return res.json({ success: false, message: 'An error occurred while updating the inventory item' });
    }
};

export default editInventoryItem; 