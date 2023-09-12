import User from "./models/users.js";
import Content from "./models/content.js";
import Inventory from "./models/inventory.js";
import Cart from "./models/cart.js";
import requireLogin from "./authenticationMiddleware.js";
import requireAdmin from "./authorizationMiddleware.js";
import express from "express";

const privateRouter = express.Router();

//Get routes that fetch data from db
privateRouter.get("/getUsers", requireLogin, async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: "An error occurred" });
    }
});

privateRouter.get("/getContents", requireLogin, async (req, res) => {
    try {
        const contents = await Content.find().sort({ created_at: -1 });
        res.json(contents);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

privateRouter.get("/getContent", requireLogin, async (req, res) => {
    try {
        const contentId = req.query.contentId; // Get the contentId from the query parameter
        const content = await Content.findOne({ _id: contentId }); // Find a single document that matches the contentId
        res.json(content);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

privateRouter.get("/getInventoryData", requireLogin, async (req, res) => {
    try {
        const inventoryData = await Inventory.find()
            .sort({ updated_at: -1 }) // Sort by updated_at in descending order
            .select(
                "_id product_name quantity_received quantity_inStock cost_price selling_price supplier sku documentNumber  updated_at"
            )
            .lean(); // Get plain JavaScript objects instead of Mongoose documents

        const formattedInventoryData = inventoryData.map((item) => ({
            ...item,
            updated_at: new Date(item.updated_at).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            }),
        }));

        res.json(formattedInventoryData);
    } catch (error) {
        console.error("Error fetching inventory data:", error);
        res.status(500).send("Failed to fetch inventory data");
    }
});

privateRouter.get(
    "/getInventoryBySKU/:item",
    requireLogin,
    async (req, res) => {
        const sku = req.params.item;
        const upperCaseSKU = sku.toUpperCase();
        const inventoryItem = await Inventory.find({ sku: upperCaseSKU });

        if (!inventoryItem) {
            return res.json({ error: "Inventory item not found" });
        }

        return res.json(inventoryItem);
    }
);

privateRouter.get(
    "/getInventoryByDoc/:docNum",
    requireLogin,
    async (req, res) => {
        const docNum = req.params.docNum;
        const upperCaseDoc = docNum.toUpperCase();
        const inventoryItem = await Inventory.find({
            documentNumber: upperCaseDoc,
        });

        if (!inventoryItem) {
            return res.json({ error: "Inventory item not found" });
        }

        return res.json(inventoryItem);
    }
);

privateRouter.get(
    "/getInventoryByItemId/:itemId",
    requireLogin,
    async (req, res) => {
        const itemId = req.params.itemId;
        const inventoryItem = await Inventory.findOne({ _id: itemId });

        if (!inventoryItem) {
            return res.json({ error: "Inventory item not found" });
        }

        return res.json(inventoryItem);
    }
);

privateRouter.get("/getCartItems", requireLogin, async (req, res) => {
    try {
        // Find all cart items and populate the inventoryItem field with product details
        const cartItems = await Cart.find({})
            .populate("inventoryItem", "product_name")
            .exec();

        // Map the retrieved cart items to the desired format
        const formattedCartItems = cartItems.map((cartItem) => {
            const productName = cartItem.inventoryItem
                ? cartItem.inventoryItem.product_name
                : "Unknown Product";
            const inventoryId = cartItem.inventoryItem
                ? cartItem.inventoryItem._id
                : "Unknown Product";

            return {
                itemId: cartItem._id,
                inventoryId: inventoryId,
                productName: productName,
                quantity: cartItem.quantity,
                totalPrice: cartItem.totalPrice,
            };
        });

        if (formattedCartItems.length === 0) {
            // Return an empty array when no cart items are found
            res.json([]);
        } else {
            res.json(formattedCartItems);
        }
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//logout route
privateRouter.get("/logout", requireLogin, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
        }
        res.redirect("/login");
    });
});

//Page routes
privateRouter.get("/account", requireLogin, requireAdmin, async (req, res) => {
    const users = await User.find();
    res.render("private_views/account", {
        pageTitle: "Account Manager",
        cssPath: "css/account.css",
        scriptPath: "script/userModal.js",
        pageTab: "account",
        users,
    });
});

privateRouter.get("/dashboard", requireLogin, (req, res) => {
    res.render("private_views/dashboard", {
        pageTitle: "Dashboard",
        cssPath: "css/dashboard.css",
        scriptPath: "script/dashboard.js",
        pageTab: "dashboard",
    });
});

privateRouter.get("/contentManager", requireLogin, async (req, res) => {
    try {
        const contents = await Content.find().sort({ created_at: -1 });

        res.render("private_views/contentManager", {
            pageTitle: "Content Manager",
            cssPath: "css/contentmgr.css",
            scriptPath: "script/contentManager.js",
            pageTab: "content manager",
            contents,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

privateRouter.get("/inventory", requireLogin, (req, res) => {
    try {
        const userType = req.session.userType;

        res.render("private_views/inventory", {
            userType: userType,
            pageTitle: "Inventory Manager",
            cssPath: "css/inventory.css",
            scriptPath: "script/inventoryManager.js",
            pageTab: "inventory manager",
        });
    } catch (error) {}
});

export default privateRouter;
