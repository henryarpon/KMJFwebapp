import Content from "../models/content.js";

const editContent = async (req, res) => {

    const { title, contentId, content } = req.body;

    try {
        // Find the existing content document by its ID
        const existingContent = await Content.findById(contentId);

        if (!existingContent) {
            return res.json({ success: false, message: 'Content not found' });
        }

        // Update the content fields with the new data
        existingContent.title = title;
        existingContent.content = JSON.parse(content);

        // Save the updated content document back to the database
        await existingContent.save();

        // Return a success response
        return res.json({ success: true, message: 'Content updated successfully' });
    } 
    catch (error) {
        console.log('Error', error);
        res.json({ success: false, message: 'Content not found' });
        return res.json({ success: false, message: 'An error occured while updating the content' });
    }
};

export default editContent;