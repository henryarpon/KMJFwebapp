import User from "../models/users.js";
import Content from "../models/content.js";

const submitContentHandler = async (req, res) => {

    try {
        // Extract data from form and database
        const { title, content } = req.body;
        const username = req.session.username;


        console.log(content);

        // Create a new Content instance
        const newContent = new Content({
            uploaded_image: req.file ? req.file.filename : null,
            image_path: req.file ? req.file.path : null,
            title,
            content,
            created_by: username,
            created_at: new Date(),
            updated_at: new Date(),
        });

        // Save the content to the database
        await newContent.save();

        req.flash('success', 'Content posted successfully');
        res.json({ success: true, message: 'Content posted successfully' });
    } 
    catch (error) {
        console.error('Error adding content:', error);
        req.flash('error', 'Error adding content');
        res.json({ success: false, message: 'Error adding content' });
    }
};

export default submitContentHandler;
