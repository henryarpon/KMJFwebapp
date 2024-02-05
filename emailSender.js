import Inventory from "./models/inventory.js";
// import { sgMail, emailBody, htmlEmailBody } from "./email.js";

import sgMail from "@sendgrid/mail";
import dotenv from 'dotenv';
dotenv.config();
const api_key = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(api_key);

async function emailSender(id, productName, quantityInStock, reorderPoint, reorderQuantity, sendEmail, supplier, supplierEmail) {

    const emailBody = `
        Dear ${supplier},

        I hope this email finds you well. We are writing to request a purchase of ${productName} as our inventory has reached a critically low level.

        Item Details:

        Item Name: ${productName}
        Desired Quantity: ${reorderQuantity}
        Delivery Deadline: Ship within 3 to 5 business days

        Please let us know if you can fulfill this order and provide us with a quote for the requested quantity. If possible, we would appreciate a prompt response to ensure we can maintain our inventory levels.

        Thank you for your continued support, and we look forward to doing business with you again.

        Best regards,

        Jv Fortunado
        Business Owner
        KMJF Polynets
    `;

    const htmlEmailBody = `
        <p>Dear ${supplier},</p>

        <p>I hope this email finds you well. We are writing to request a purchase of ${productName} as our inventory has reached a critically low level.</p>

        <p>Item Details:</p>

        <ul>
            <li>Item Name: ${productName}</li>
            <li>Desired Quantity: ${reorderQuantity}</li>
            <li>Delivery Deadline: Ship within 3 to 5 business days</li>
        </ul>

        <p>Please let us know if you can fulfill this order and provide us with a quote for the requested quantity. If possible, we would appreciate a prompt response to ensure we can maintain our inventory levels.</p>

        <p>Thank you for your continued support, and we look forward to doing business with you again.</p>

        <p>Best regards,</p>
        <p>Jv Fortunado</p>
        <p>Business Owner, KMJF Polynets</p>
        <p>jrfortunado26@gmail.com</p>
    `;

    if (sendEmail) {
        if (quantityInStock <= reorderPoint) {
            try {

                // Find the inventory item by _id and update the send_email property to false
                const updatedInventory = await Inventory.findOneAndUpdate({ _id: id }, { send_email: false });

                const message = {
                    to: supplierEmail,
                    from: 'kmjfpolynets@gmail.com',
                    subject: `Purchase Request: ${productName} - Urgent Restock of ${reorderQuantity}pc/s Needed`,
                    text: emailBody,
                    html: htmlEmailBody
                };

                try {
                    const response = await sgMail.send(message);
                    console.log("Email sent");
                } 
                catch (error) {
                    console.error(error);
                }
    
            } catch (error) {
                console.error("Error updating send_email property:", error);
            }
        }
    }
}

export default emailSender;

