import Content from '../models/content.js'; // Update import path

const submitContentHandler = async (req, res) => {
    try {
        const { title, content } = req.body;
        const username = req.session.username;

        console.log('Type:', typeof content);

        const newContent = new Content({
            // Update the properties according to your Content model
            title,
            content,
            created_by: username,
            created_at: new Date(),
            updated_at: new Date(),
        });

        await newContent.save();

        req.flash('success', 'Content posted successfully');
        res.json({ success: true, message: 'Content posted successfully' });
    } catch (error) {
        console.error('Error adding content:', error);
        req.flash('error', 'Error adding content');
        res.json({ success: false, message: 'Error adding content' });
    }
};

export default submitContentHandler;
