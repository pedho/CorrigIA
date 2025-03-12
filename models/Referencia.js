const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Referencia = new Schema({
    conteudo:{
        type: String,
        required: true
    },
    tema:{
        type: Schema.Types.ObjectId,
        ref: "temas",
        required: true
    },
    data:{
        type: Date,
        default: Date.now()
    }
})

mongoose.model("referencias", Referencia)