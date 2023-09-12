import Inventory from "../models/inventory.js";
import Sales from "../models/sales.js";
import axios from "axios";

const checkout = async (req, res) => {
    try {
        const salesData = req.body;

        // Create a new sales document using the Sales model
        const newSales = new Sales({
            items: salesData.items,
            totalPrice: salesData.totalPrice,
            created_at: salesData.created_at,
            updated_at: salesData.updated_at
        });

        // Save the new sales document to the database
        await newSales.save();

        // Fetch all inventory items using $in operator
        const productNames = salesData.items.map(item => item.productName);
        const inventoryItems = await Inventory.find({ product_name: { $in: productNames } });

        // Update inventory quantities
        for (const item of salesData.items) {
            const inventoryItem = inventoryItems.find(item => item.product_name === item.product_name);

            if (inventoryItem) {
                inventoryItem.quantity_inStock -= item.quantity;
                await inventoryItem.save();
            }
            
            if (inventoryItem.quantity_inStock <= 0) {
                await axios.post(`http://localhost:3000/deleteInventoryItem/${item.inventoryId}`); 
            }
                
        }

        // Return a success response
        res.status(201).json({ message: 'Sales data saved and inventory updated successfully' });
    } catch (error) {
        console.error('Error proceeding to checkout:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export default checkout;