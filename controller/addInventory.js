import Inventory from "../models/inventory.js";

const capitalizeFirstLetter = (str) => {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const addInventory = async (req, res) => {
    try {
        const { 
            sku, 
            product_name, 
            received_quantity, 
            cost_price, 
            selling_price, 
            supplier, 
            supplier_email, 
            reorder_point,
            reorder_quantity,  
            document_number, 
            sendEmail
        } = req.body;

        const requiredFields = [
            "sku",
            "product_name",
            "received_quantity",
            "cost_price",
            "selling_price",
            "supplier",
            "supplier_email",
            "reorder_point",
            "reorder_quantity",
            "document_number"
        ];
          
        if (!requiredFields.every(field => req.body[field])) {
            return res.json({ error: 'All fields are required.' });
        }
          
        if (received_quantity < 0 || cost_price < 0 || selling_price < 0) {
            return res.json(
                    { error: 'Received quantity, cost price, and selling price must be greater than or equal to 0.' }
                );
        };

        const newInventory = await Inventory.create({
            sku: sku.toUpperCase(),
            product_name: capitalizeFirstLetter(product_name),
            quantity_received: received_quantity,
            quantity_inStock: received_quantity,
            cost_price: cost_price,
            selling_price: selling_price,
            supplier: capitalizeFirstLetter(supplier),
            supplier_email: supplier_email,
            reorder_point: reorder_point,
            reorder_quantity: reorder_quantity,
            document_number: document_number.toUpperCase(),
            send_email: sendEmail !== undefined ? sendEmail : true,
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
