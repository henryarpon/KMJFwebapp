import mongoose from 'mongoose';

const salesSchema = new mongoose.Schema({
    items: [
      {
        productName: String,
        quantity: Number
      }
    ],
    totalPrice: Number,
    created_at: Date,
    updated_at: Date
  });
  
const Sales = mongoose.model('Sales', salesSchema);;

export default Sales;
