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

//pages routes
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

app.get("/getSalesData", async (req, res) => {
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

//********************************************************************************
//Server Logging port
//********************************************************************************
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
