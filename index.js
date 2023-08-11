import { fileURLToPath } from 'url';
import { dirname, format } from 'path';
import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import User from './models/users.js';
import Content from './models/content.js';
import Inventory from './models/inventory.js';
import Cart from './models/cart.js';
import Sales from './models/sales.js';
import bcrypt from 'bcrypt';
import publicRouter from './publicRoute.js';
import privateRouter from './privateRoute.js';
import mongoose from 'mongoose';
import login from './controller/login.js';
import addUser from './controller/addUser.js';
import editUser from './controller/editUser.js';
import deleteUser from './controller/deleteUser.js';
import submitContent from './controller/submitContent.js';
import deleteContent from './controller/deleteContent.js';
import editContent from './controller/editContent.js';
import addInventory from './controller/addInventory.js';
import editInventoryItem from './controller/editInventory.js';
import deleteInventoryItem from './controller/deleteInventory.js';
import requireAdmin from "./authorizationMiddleware.js";
import axios from 'axios';

//********************************************************************************
//Middlewares for express, flash and ejs view engines 
//********************************************************************************
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = 3000;

app.use(flash());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


//********************************************************************************
//SESSION Middleware
//********************************************************************************
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
});


//********************************************************************************
//MongoDB initialization 
//********************************************************************************
mongoose.connect('mongodb://localhost:27017/KMJFDBase', {useNewUrlParser: true});
  
//pages routes
app.use('/', publicRouter);
app.use('/', privateRouter);


//********************************************************************************
//POST routes --located in controller directory
//********************************************************************************

//********************************************************************************
//Account Management Modules
//********************************************************************************
app.post('/login', login);
app.post('/addUser', addUser);
app.post('/editUser', editUser);
app.post('/deleteUser', deleteUser);


//********************************************************************************
//Content Management Modules
//********************************************************************************
app.post('/submitContent', submitContent);
app.post('/deleteContent', deleteContent);
app.post('/editContent', editContent);


//********************************************************************************
//Inventory Management Modules
//********************************************************************************
app.post('/addInventory', addInventory);
app.post('/editInventoryItem', editInventoryItem);
app.post('/deleteInventoryItem/:itemId', deleteInventoryItem);

app.post('/addToCart', async (req, res) => {
    try {
        const { itemId, itemQuantity, totalPrice } = req.body;

        const parsedQuantity = parseInt(itemQuantity);
        const parsedTotalPrice = parseFloat(totalPrice);
        
        // Check if a cart item with the same itemId already exists
        const existingCartItem = await Cart.findOne({ inventoryItem: itemId });

        console.log(existingCartItem);

        if (existingCartItem) {
            // Update the existing cart item's quantity and totalPrice
            existingCartItem.quantity += parsedQuantity;
            existingCartItem.totalPrice += parsedTotalPrice;

            await existingCartItem.save();
        } else {
            // Create a new cart item if it doesn't exist
            const newCartItem = new Cart({
                inventoryItem: itemId,
                totalPrice: totalPrice,
                quantity: itemQuantity,
                created_at: new Date(),
                updated_at: new Date()
            });

            await newCartItem.save();
        }

        return res.json({ message: 'Item added to cart successfully' });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/getCartItems', async (req, res) => {
    try {
        // Find all cart items and populate the inventoryItem field with product details
        const cartItems = await Cart.find({})
            .populate('inventoryItem', 'product_name')
            .exec();

        // Map the retrieved cart items to the desired format
        const formattedCartItems = cartItems.map(cartItem => {
        const productName = cartItem.inventoryItem ? cartItem.inventoryItem.product_name : 'Unknown Product';
        const inventoryId = cartItem.inventoryItem ? cartItem.inventoryItem._id : 'Unknown Product';

            return {
                itemId: cartItem._id,
                inventoryId: inventoryId,
                productName: productName,
                quantity: cartItem.quantity,
                totalPrice: cartItem.totalPrice
            };
        });

        res.json(formattedCartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/removeFromCart', async (req, res) => {
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
});

// app.post('/checkout', async (req, res) => {
//     try {
//         const salesData = req.body;

//         // Create a new sales document using the Sales model
//         const newSales = new Sales({
//             items: salesData.items,
//             totalPrice: salesData.totalPrice,
//             created_at: salesData.created_at,
//             updated_at: salesData.updated_at
//         });

//         // Save the new sales document to the database
//         await newSales.save();

//         // Return a success response
//         res.status(201).json({ message: 'Sales data saved successfully' });
//     } catch (error) {
//         console.error('Error proceeding to checkout:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// });

app.post('/checkout', async (req, res) => {
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

        // Deduct sold quantities from inventory
        for (const item of salesData.items) {
            console.log(item);
            const inventoryItem = await Inventory.findOne({ product_name: item.productName });

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
});

//********************************************************************************
//Server Logging port
//********************************************************************************
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
