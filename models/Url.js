const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({

originalUrl: String,

shortCode: String,

userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User"
},

clicks: {
type: Number,
default: 0
},

earnings: {
type: Number,
default: 0
},

cpm: {
type: Number,
default: 0
},

todayViews: {
type: Number,
default: 0
},

todayEarnings: {
type: Number,
default: 0
}

},{
timestamps:true
});

module.exports =
mongoose.model("Url",urlSchema);