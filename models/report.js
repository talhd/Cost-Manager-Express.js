const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ReportSchema = new Schema({
    userId:{
        type:Number
    },
    year:{
        type: Number
    },
    month:{
        type: Number
    },
    sum:{
        type: Number
    },
    dateCreated:{
        type: Date,
        default: Date.now()
    },
    productArray: [{
        type:String
    }]
});

const Report = mongoose.model('report',ReportSchema);
module.exports = Report;