import Content from "../models/content.js";

const deleteContent = async (req, res) => {
    try {
        const contentId = req.body.contentId;

        // Find and delete the content document by ID
        await Content.findByIdAndDelete(contentId);

        // Respond with a success message
        res.json({ success: true, message: 'Content Deleted' });
    } 
    catch (err) {
        console.error(err);
        res.json({ success: false, message: 'Error deleting content' });
    }
};

export default deleteContent;
