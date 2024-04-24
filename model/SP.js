const mongoose = require('mongoose');

let SP_Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true
    },
    img: {
        type: String,
        trim:true
    },
    idd: {
        type: String,
        required: true,
        trim: true,
        unique:true
    },
    password: {
        type: String,
        required: true,
        trim:true
    },
    slots: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Slot'
        }
    ]
})

let SP = mongoose.model('SP', SP_Schema);
module.exports=SP;
