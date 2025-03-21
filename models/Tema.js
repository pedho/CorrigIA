const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Tema = new Schema({
    nome:{
        type: String,
        require: true
    },
    slug:{
        type: String,
        require: true
    },
    date:{
        type: Date,
        default: Date.now
    }
})

mongoose.model("temas", Tema)