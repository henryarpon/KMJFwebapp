// email.js

import sgMail from "@sendgrid/mail";
import dotenv from 'dotenv';
dotenv.config();

// Set your SendGrid API key here
const api_key = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(api_key);

const emailBody = `
    Dear [Supplier's Name],

    I hope this email finds you well. We are writing to request a purchase of [Item Name] as our inventory has reached a critically low level.

    Item Details:

    Item Name: [Item Name]
    Desired Quantity: [Desired Quantity]
    Delivery Deadline: [Delivery Deadline, if applicable]

    Please let us know if you can fulfill this order and provide us with a quote for the requested quantity. If possible, we would appreciate a prompt response to ensure we can maintain our inventory levels.

    Thank you for your continued support, and we look forward to doing business with you again.

    Best regards,

    Jv Fortunado
    Business Owner
    KMJF Polynets
`;

const htmlEmailBody = `
    <p>Dear [Supplier's Name],</p>
    <p>I hope this email finds you well. We are writing to request a purchase of [Item Name] as our inventory has reached a critically low level.</p>

    <p>Item Details:</p>
    <ul>
        <li>Item Name: [Item Name]</li>
        <li>Desired Quantity: [Desired Quantity]</li>
        <li>Delivery Deadline: [Delivery Deadline, if applicable]</li>
    </ul>

    <p>Please let us know if you can fulfill this order and provide us with a quote for the requested quantity. If possible, we would appreciate a prompt response to ensure we can maintain our inventory levels.</p>

    <p>Thank you for your continued support, and we look forward to doing business with you again.</p>

    <p>Best regards,</p>
    <p>[Your Name]</p>
    <p>[Your Title]</p>
    <p>[Your Company Name]</p>
    <p>[Your Contact Information]</p>
`;

export { sgMail, emailBody, htmlEmailBody };
