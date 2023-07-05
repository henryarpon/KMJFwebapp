import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
    
    uploaded_image: String,
    image_path: String,
    title: String,
    content: String,
    created_by: String,
    created_at: Date,
    updated_at: Date
});

const Content = mongoose.model('Content', contentSchema);

export default Content;