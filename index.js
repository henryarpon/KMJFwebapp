import { fileURLToPath } from "url";
import { dirname, format } from "path";
import express from "express";
import session from "express-session";
import flash from "connect-flash";
import User from "./models/users.js";
import Content from "./models/content.js";
import Inventory from "./models/inventory.js";
import Cart from "./models/cart.js";
import Sales from "./models/sales.js";
import bcrypt from "bcrypt";
import publicRouter from "./publicRoute.js";
import privateRouter from "./privateRoute.js";
import mongoose from "mongoose";
import login from "./controller/login.js";
import addUser from "./controller/addUser.js";
import editUser from "./controller/editUser.js";
import deleteUser from "./controller/deleteUser.js";
import submitContent from "./controller/submitContent.js";
import deleteContent from "./controller/deleteContent.js";
import editContent from "./controller/editContent.js";
import addInventory from "./controller/addInventory.js";
import editInventoryItem from "./controller/editInventory.js";
import deleteInventoryItem from "./controller/deleteInventory.js";
import addToCart from "./controller/addToCart.js";
import removeFromCart from "./controller/removeFromCart.js";
import checkout from "./controller/checkout.js";
import requireAdmin from "./authorizationMiddleware.js";
import dotenv from "dotenv";
import { sgMail, emailBody, htmlEmailBody } from "./email.js";

//********************************************************************************
//Middlewares for express, flash and ejs view engines
//********************************************************************************

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = 3000;

app.use(flash());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

//********************************************************************************
//SESSION Middleware
//********************************************************************************
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use((req, res, next) => {
    res.locals.successMessage = req.flash("success");
    res.locals.errorMessage = req.flash("error");
    next();
});

//********************************************************************************
//MongoDB initialization
//********************************************************************************
mongoose.connect("mongodb://127.0.0.1/KMJFDBase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// mongoose.connect("mongodb+srv://henryadmin:Welcome%4003045@cluster0.cgdbghy.mongodb.net/KMJFDBase", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

//********************************************************************************
//GET routes --located in privateRoute.js
//********************************************************************************
app.use("/", publicRouter);
app.use("/", privateRouter);

//********************************************************************************
//POST routes --located in controller directory
//********************************************************************************

//********************************************************************************
//Account Management Modules
//********************************************************************************
app.post("/login", login);
app.post("/addUser", addUser);
app.post("/editUser", editUser);
app.post("/deleteUser", deleteUser);

//********************************************************************************
//Content Management Modules
//********************************************************************************
app.post("/submitContent", submitContent);
app.post("/deleteContent", deleteContent);
app.post("/editContent", editContent);

//********************************************************************************
//Inventory Management Modules
//********************************************************************************
app.post("/addInventory", addInventory);
app.post("/editInventoryItem", editInventoryItem);
app.post("/deleteInventoryItem/:itemId", deleteInventoryItem);
app.post("/addToCart", addToCart);
app.post("/removeFromCart", removeFromCart);
app.post("/checkout", checkout);

//********************************************************************************
//Dashboard module
//********************************************************************************

app.post("/updateSendEmail", async (req, res) => {

    try {
        const { id, send_email } = req.body;

        // Find the inventory item by SKU and update the send_email property
        await Inventory.findOneAndUpdate({ _id: id }, { send_email });

        res.json({ message: "Send email property updated successfully." });
    } 
    catch (error) {
        console.error("Error updating send_email property:", error);
        res.json({ error: "Internal server error" });
    }
});

//********************************************************************************
//Server Logging port
//********************************************************************************
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

export default app;

