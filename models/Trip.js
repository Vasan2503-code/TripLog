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
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
})

module.exports = mongoose.model("Trip" , tripSchema);