const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title:{
        type:String,
        require: true,
        trim: true,
        unique: true
    },
    slug:{
        type:String,
        required: true,
        unique: true,
        lowercase: true,
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    category: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true 
    },
    brand:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        required: true 
    },
    quantity: {
        type: Number,
        required: true,
        select: false
    },
    sold:{
        type: Number,
        default: 0,
    },
    images: [],
    color: {
        type: String,
        required: true,
    },
    ratings: [
        {
          star: Number,
          comment: String,
          postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
      ],
      totalrating: {
        type: String,
        default: 0,
      },
}, {
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Product', productSchema);