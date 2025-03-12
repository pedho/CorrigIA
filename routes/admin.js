const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Tema")
const Tema = mongoose.model("temas")
require("../models/Redacao")
const Redacao = mongoose.model("redacoes")
require("../models/Referencia")
const Referencia = mongoose.model("referencias")
const {eAdmin} = require("../helpers/eAdmin")

router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/temas', eAdmin, (req, res) => {
    Tema.find().sort({date: 'desc'}).lean().then((temas) => {
        res.render("admin/temas", {temas: temas})
    }).catch((err) =>{
        req.flash("error_msg", "Erro ao listar temas")
        res.redirect("/admin")
    })
    
})

router.get('/temas/add', eAdmin, (req, res) => {
    res.render("admin/addtemas")
})

router.post('/temas/novo', eAdmin, (req, res) => {

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome invalido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug invalido"})
    }

    if(req.body.nome.length < 6){
        erros.push({texto: "Nome do tema pequeno"})
    }

    if(erros.length > 0){
        res.render("admin/temas", {erros: erros})
    }else{
        const novoTema= {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Tema(novoTema).save().then(() =>{
            req.flash("success_msg", "Tema criado com sucesso")
            res.redirect("/admin/temas")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao criar tema")
            res.redirect("/admin")
        })

    }
    
})

router.get("/temas/edit/:id", eAdmin, (req, res) => {
    Tema.findOne({_id: req.params.id}).then((tema) => {
        res.render("admin/edittemas", {tema: tema})
    }).catch((err) => {
        req.flash("error_msg", "Temaa nao existente")
        res.redirect("/admin/temas")
    })  
})

router.post("/temas/edit", eAdmin, (req, res) => {
    
        Tema.findOne({_id: req.body.id}).then((tema) => {
        
            tema.nome = req.body.nome
            tema.slug = req.body.slug
    
            tema.save().then(() => {
                req.flash("success_msg", "Tema editado com sucesso")
                res.redirect("/admin/temas")
            }).catch((err) => {
                req.flash("error_msg", "Tema não editado")
                res.redirect("/admin/temas")
            })
            
    
        }).catch((err) => {
            req.flash("error_msg", "Tema não alterado")
            res.redirect("/admin/temas")
        })
    
})

router.post("/temas/deletar", eAdmin, (req, res) => {
    Tema.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Tema deletado com sucesso")
        res.redirect("/admin/temas")
    }).catch((err) => {
        req.flash("error_msg", "Tema não deletado")
        res.redirect("/admin/temas")
    })
})
router.get('/referencias', eAdmin, (req, res) => {
    Referencia.find().populate("tema").sort({date: 'desc'}).lean().then((referencias) => {
        res.render("admin/referencias", {referencias: referencias})
    }).catch((err) =>{
        req.flash("error_msg", "Erro ao listar referencias")
        res.redirect("/admin")
    })
    
})
router.get('/referencias/add', eAdmin, (req, res) => {
    Tema.find().then((temas) => {
        res.render("admin/addreferencias", {temas: temas})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar")
        res.redirect("/admin/referencias")
    })
    
})

router.post('/referencias/nova', eAdmin, (req, res) => {

    var erros = []
    if(req.body.tema == 0){
        erros.push({texto: "Registre um tema"})
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteudo invalido"})
    }

    if(!req.body.tema || typeof req.body.tema == undefined || req.body.tema == null){
        erros.push({texto: "Tema invalido"})
    }

    if(req.body.conteudo.length < 6){
        erros.push({texto: "Conteudo pequeno"})
    }

    if(erros.length > 0){
        res.render("admin/referencias", {erros: erros})
    }else{
        const novaReferencia= {
            conteudo: req.body.conteudo,
            tema: req.body.tema
        }
    
        new Referencia(novaReferencia).save().then(() =>{
            req.flash("success_msg", "Referencia adicionada com sucesso")
            res.redirect("/admin/referencias")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao adicionar referencia")
            res.redirect("/admin/referencias")
        })

    }
    
})

router.post("/referencias/deletar", eAdmin, (req, res) => {
    Referencia.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Referencia deletada com sucesso")
        res.redirect("/admin/referencias")
    }).catch((err) => {
        req.flash("error_msg", "Referencia não deletada")
        res.redirect("/admin/referencias")
    })
})

module.exports = router