const express = require("express")
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const app = express()
const admin = require("./routes/admin")
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Redacao")
const Redacao = mongoose.model("redacoes")
require("./models/Tema")
const Tema = mongoose.model("temas")
const usuarios = require("./routes/usuario")
const passport = require("passport")
require("./config/auth")(passport)
const {GoogleGenerativeAI} = require("@google/generative-ai")
const {eUser} = require("./helpers/eUser")

    app.use(session({
        secret: "corrigiaenemcorrigia",
        resave: true,
        saveUninitialized: true
    }))


    app.use(passport.initialize())
    app.use(passport.session())


    app.use(flash())

    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null;
        res.locals.eAdmin = req.user?.eAdmin === 1;
        next()
    })

    app.engine('handlebars', handlebars.engine({defaultLayout: 'main', runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }}))
    app.set('view engine', 'handlebars')

    app.use(bodyParser.urlencoded({extended: false}))
    app.use(bodyParser.json())

    mongoose.Promise = global.Promise
    mongoose.connect("mongodb://localhost/corrigia").then(() => {
        console.log("mongo conectado")
    }).catch((err) => {
        console.log("mongo nao conectado")
    })

    app.use(express.static(path.join(__dirname,"public")))

    const genAI = new GoogleGenerativeAI("AIzaSyCk-3kVlUaloeuc-r0dI_2O5Fycr0ZfbvE");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    app.get("/", (req, res) => {
    Tema.find().sort({data: "desc"}).limit(3).lean().then((temas) => {
        res.render("index", {temas: temas})
    }).catch((err) => {
        req.flash("error_msg", "Erro interno")
        res.redirect("/404")
    })
    
})

app.post("/redacoes/nova/:slug", eUser, async (req, res) => {
    var erros = []
    
    if(req.body.conteudo == 0){
        erros.push({texto: "Registre uma redação"})
    }

    if(erros.length > 0){
        res.render("temas/index", {erros: erros})
    }else{
        const consulta_nota = await model.generateContent("Considerando que o tema da redação é " + req.body.tema_nome + ", e qualquer desvio completo do tema deve zerar a redação, dê uma nota de 0 a 1000 a seguinte redação baseado nos critérios do ENEM: " + req.body.conteudo + "Mande em sua resposta APENAS a nota total média da redação, de 0 a 1000 (lembrando que o número das dezenas é sempre par devido a pontuação por competência, ENVIE APENAS A NOTA FINAL. E lembre-se de CONSIDERAR a relação e adequação ao tema. Citações de filmes, séries e culturais não devem retirar pontuação. Seja um pouco menos exigente");
        const nota = consulta_nota.response.text();

        const consulta_comentarios = await model.generateContent("Considerando que o tema da redação é " + req.body.tema_nome + ", e qualquer desvio completo do tema deve desconsiderar completamente a redação, aponte os defeitos da seguinte redação baseado nos critérios do ENEM: " +  req.body.conteudo + "Mande em sua resposta APENAS comentários e lembre-se de CONSIDERAR a relação e adequação ao tema. Citações de filmes, séries e culturais não devem retirar pontuação. Seja um pouco menos exigente");
        const comentarios = consulta_comentarios.response.text();

        const novaRedacao = {
            conteudo: req.body.conteudo,
            tema: req.body.tema,
            usuario: req.user._id,
            nota: nota,
            comentarios: comentarios
        }

        await new Redacao(novaRedacao).save().then(() => {
            req.flash("success_msg", "Redação enviada com sucesso")
            res.redirect("/redacoes")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar redacao" + err)
            res.redirect("/temas")
        })

    }
})

app.get("/redacoes", eUser, (req, res) => {

    Redacao.find({usuario: req.user._id}).lean().populate("tema").sort({data: "desc"}).then((redacoes) => {
        res.render(("redacao/minhasredacoes"), {redacoes: redacoes})
        
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar redacoes" + err)
        res.redirect("/")
    })
})

app.post("/redacoes/deletar", eUser, (req, res) =>{
    Redacao.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Redação deletada com sucesso")
        res.redirect("/redacoes")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar")
        res.redirect("/redacoes")
        })
})

app.get("/redacoes/minhasredacoes/:id", eUser, (req, res) => {
    Redacao.findOne({_id: req.params.id}).populate("tema").then((redacao) => {
        res.render("redacao/index", {redacao: redacao})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao chegar nessa redacão")
        res.redirect("/redacao/minhasredacoes")
    })
})

app.get("/temas", eUser, (req, res) => {
    Tema.find().sort({data: -1}).then((temas) => {
        res.render("temas/index", {temas: temas})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar temas")
        res.redirect("/")
    })
})

app.get("/temas/:slug", eUser, (req, res) => {
    Tema.findOne({slug: req.params.slug}).then((tema) => {
        res.render("temas/redacoes", {tema: tema})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao chegar nesse tema")
        res.redirect("/temas")
    })
})

app.get("404", (req, res) => {
    res.send("Error 404")
    
})

app.use('/admin', admin)
app.use('/usuarios', usuarios)
const PORT = 8080

app.listen(PORT, () => {
    console.log("Servidor rodando")
})