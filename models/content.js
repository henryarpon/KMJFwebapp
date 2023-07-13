import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
    
    title: String,
    content: mongoose.Schema.Types.Mixed,
    created_by: String,
    created_at: Date,
    updated_at: Date
});

const Content = mongoose.model('Content', contentSchema);

export default Content;