import express from 'express'
import cors from 'cors'
import {MongoClient} from 'mongodb'
import joi from 'joi'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'

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
    senha: joi.string().required()
})
app.post('/cadastro', async (req, res) =>{
    const {nome, senha, email} = req.body
    const passwordCrypt = bcrypt.hashSync(senha,2)

    const validation = schemaCadastro.validate(req.body)
    
    if(validation.error) return res.status(422).send('Dados invalidos')
    
    try{
        const usuario = await db.collection('users').findOne({email})
        if(usuario) return res.status(422).send('Usuário ja cadastrado')
        await db.collection('users').insertOne({nome, email, senha:passwordCrypt})
        return res.status(201).send('Criado com sucesso')
    }catch(error){
        return res.status(500).send(error.message)
    }

})
const port = process.env.PORT || 5000
app.listen(port, ()=>console.log(`Servidor rodando na porta ${port}`))