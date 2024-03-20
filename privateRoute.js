import User from "./models/users.js";
import Content from "./models/content.js";
import Inventory from "./models/inventory.js";
import Sales from "./models/sales.js";
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
                    "_id product_name quantity_received quantity_inStock cost_price selling_price send_email sku document_number updated_at"
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

privateRouter.get("/getInventoryByDoc/:docNum", requireLogin, async (req, res) => {

        const docNum = req.params.docNum;
        const upperCaseDoc = docNum.toUpperCase();

        const inventoryItem = await Inventory.find({
            document_number: upperCaseDoc,
        });

        console.log(inventoryItem);

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
            .populate("inventoryItem", "product_name sku")
            .exec();

        // Map the retrieved cart items to the desired format
        const formattedCartItems = cartItems.map((cartItem) => {

            const productName = cartItem.inventoryItem ? cartItem.inventoryItem.product_name : "Unknown Product";
            const inventoryId = cartItem.inventoryItem ? cartItem.inventoryItem._id: "Unknown Product";
            const sku = cartItem.inventoryItem ? cartItem.inventoryItem.sku : "Unknown SKU";

            return {
                itemId: cartItem._id,
                inventoryId: inventoryId,
                productName: productName,
                quantity: cartItem.quantity,
                totalPrice: cartItem.totalPrice,
                sku: sku,
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

privateRouter.get("/getSalesData", async (req, res) => {
    try {
        // Extract filter parameters from the request query
        const { year, quarter, date, startDate, endDate } = req.query;

        // Construct a base query object that will be extended based on the provided filters
        const baseQuery = {};

        if (year) {
            baseQuery.created_at = {
                $gte: new Date(`${year}-01-01T00:00:00Z`),
                $lte: new Date(`${year}-12-31T23:59:59Z`),
            };
        }
        if (quarter) {
            baseQuery.created_at = {
                $gte: new Date(`${quarter}-01-01T00:00:00Z`),
                $lte: new Date(`${quarter}-12-31T23:59:59Z`),
            };
        }
        if (date) {
            baseQuery.created_at = {
                $gte: new Date(`${date}T00:00:00Z`),
                $lte: new Date(`${date}T23:59:59Z`),
            };
        }
        if (startDate && endDate) {
            baseQuery.created_at = {
                $gte: new Date(`${startDate}T00:00:00Z`),
                $lte: new Date(`${endDate}T23:59:59Z`),
            };
        }

        // Use the base query to filter sales data
        const salesData = await Sales.find(baseQuery);

        // Return the filtered sales data as JSON
        res.json({ salesData });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "An error occurred while fetching sales data.",
        });
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

// Page routes
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
