import express from 'express'
import cors from 'cors'
import {MongoClient} from 'mongodb'
import joi from 'joi'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid';

const token = uuid();

//CRIAÇÃO DO APP

const app = express()

//CONFIGURAÇÕES
app.use(cors())
app.use(express.json())
dotenv.config()

//CONEXAO COM O BANDO DE DADOS
const mongoClient = new MongoClient(process.env.DATABASE_URL)

try{
    await mongoClient.connect()
}catch(err){
    console.log(err.message)
}
const db = mongoClient.db('Mywallet')


//ROTAS
const schemaCadastro = joi.object({
    nome: joi.string().required(),
    email: joi.string().email().required(),
    senha: joi.string().min(3).required()
})
app.post('/cadastro', async (req, res) =>{
    const {nome, senha, email} = req.body
    const passwordCrypt = bcrypt.hashSync(senha,2)

    const validation = schemaCadastro.validate(req.body)
    
    if(validation.error) return res.status(422).send('Dados inválidos')
    
    try{
        const usuario = await db.collection('users').findOne({email})
        if(usuario) return res.status(409).send('Usuário já cadastrado')
        await db.collection('users').insertOne({nome, email, senha:passwordCrypt})
        return res.sendStatus(201)
    }catch(error){
        return res.status(500).send(error.message)
    }

})
const schemaLogin = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().min(3).required()
})
app.post('/', async (req, res) =>{
    const {email, senha} = req.body
    const validation =schemaLogin.validate(req.body)
    if(validation.error) return res.status(422).send('Erro na validação dos dados')
    
    try{
        const usuario = await db.collection('users').findOne({email})
        if(!usuario) return res.status(404).send('Usuario não cadastrado, faça cadastro')
        const validateSenha = bcrypt.compareSync( senha, usuario.senha)
        if(!validateSenha) return res.status(401).send('As senhas não coincidem')

        const token = uuid()
        await db.collection('sessions').insertOne({userId:usuario._id, token})
        
        delete usuario.senha

        res.status(200).send({...usuario, token})

    }catch(error){
        return res.status(500).send(error.message)
    }
    

})


app.post('/transacao', async (req,res) =>{
    const {valor, descricao, fluxo} = req.body
    console.log({valor, descricao, fluxo})
    res.status(200).send("Transacao ok")
})
const port = process.env.PORT || 5000
app.listen(port, ()=>console.log(`Servidor rodando na porta ${port}`))