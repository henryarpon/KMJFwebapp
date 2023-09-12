import Inventory from "../models/inventory.js";

const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const addInventory = async (req, res) => {
    try {
        const { 
            product_name, 
            received_quantity, 
            cost_price, 
            selling_price, 
            supplier, 
            sku, 
            reorderPoint, 
            documentNumber 
        } = req.body;

        //  Server Validations
        if (
                !product_name || 
                !received_quantity || 
                !cost_price || 
                !selling_price || 
                !supplier || 
                !sku || 
                !reorderPoint || 
                !documentNumber
            ) {
            return res.json({ error: 'All fields are required.' });
        }

        if (received_quantity < 0 || cost_price < 0 || selling_price < 0) {
            return res.json({ error: 'Received quantity, cost price, and selling price must be greater than or equal to 0.' });
        }

        const newInventory = await Inventory.create({
            product_name: capitalizeFirstLetter(product_name),
            quantity_received: received_quantity,
            quantity_inStock: received_quantity,
            cost_price: cost_price,
            selling_price: selling_price,
            supplier: capitalizeFirstLetter(supplier),
            sku: sku.toUpperCase(),
            reorderPoint: reorderPoint,
            documentNumber: documentNumber.toUpperCase(),
            created_at: new Date(),
            updated_at: new Date()
        });

        return res.json({ inventory: newInventory });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
};

export default addInventory;
