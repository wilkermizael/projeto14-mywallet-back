import express from "express"
import cors from "cors"
import {MongoClient} from "mongodb"
//import Joi from "joi"
import dotenv from "dotenv"

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
const db = mongoClient.db()

//ROTAS
app.get()
const port = process.env.PORT || 5000
app.listen(port, ()=>console.log(`Servidor rodando na porta ${port}`))