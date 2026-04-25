const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({

    title : {
        type : String,
        required : true,
    },
    description : {
        type : String ,
        required : true
    },
    date : {
        type : Date,
        required : true
    },
    destination : {
        type : String,
        required:true
    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    phase : {
        type: String,
        enum: ['pre', 'live', 'done'],
        default: 'pre'
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    images: [
        {
            url: String,
            public_id: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
})

module.exports = mongoose.model("Trip" , tripSchema);