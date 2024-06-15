
const exp=require('express');
const govapp=exp.Router();  
const bcryptjs=require('bcryptjs')
const expressAsyncHandler=require("express-async-handler")
const jwt=require('jsonwebtoken')
const verifyToken=require('../Middlewares/VerifyToken')
require('dotenv').config()

let govcollection;
let orgcollection;

govapp.use((req,res,next)=>{
    govcollection=req.app.get('govcollection')
    orgcollection=req.app.get('orgcollection')
    next()
})


govapp.post('/register',expressAsyncHandler(async(req,res)=>{
     
    const newofficer=req.body;
    console.log(newofficer)
    
    const dbofficer=await govcollection.findOne({username:newofficer.username})
    
    if(dbofficer!= null){
        res.send({message:"officer existed"})
    }else{
       
        const hashedPassword=await bcryptjs.hash(newofficer.password,6)
        
        newofficer.password=hashedPassword;
        
        await govcollection.insertOne(newofficer)
       
        res.send({message:"officers created"})
    }
 }))

 govapp.post('/login',expressAsyncHandler(async(req,res)=>{
   
    const officercred=req.body;
    
    const dbofficer= await govcollection.findOne({username:officercred.username})
    if(dbofficer===null){
        res.send({message:"Invalid username"})
    }else{
        
       const status= await bcryptjs.compare(officercred.password,dbofficer.password)
       if(status===false){
        res.send({message:"Invalid password"})
       }else{
    
        const signedToken=jwt.sign({username:dbofficer.authorname},process.env.SECRET_KEY,{expiresIn:'1d'})
    
        res.send({message:"login success",token:signedToken,user:dbofficer})
       }
    }
 }))






 module.exports=govapp;
 