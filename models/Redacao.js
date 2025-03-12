const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Redacao = new Schema({
    conteudo:{
        type: String,
        required: true
    },
    usuario:{
        type: Schema.Types.ObjectId,
        ref: "usuarios",
        required: true
    },
    tema:{
        type: Schema.Types.ObjectId,
        ref: "temas",
        required: true
    },
    nota:{
        type: Number,
        default: 0
    },
    comentarios:{
        type: String,
        default: ""
    },
    data:{
        type: Date,
        default: Date.now()
    }

})

mongoose.model("redacoes", Redacao)