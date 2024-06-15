
const exp=require('express');
const orgapp=exp.Router();  
const bcryptjs=require('bcryptjs')
const expressAsyncHandler=require("express-async-handler")
const jwt=require('jsonwebtoken')
const verifyToken=require('../Middlewares/VerifyToken')
require('dotenv').config()

let govcollection;
let orgcollection;

orgapp.use((req,res,next)=>{
    govcollection=req.app.get('govcollection')
    orgcollection=req.app.get('orgcollection')
})


orgapp.post('/register',expressAsyncHandler(async(req,res)=>{
   
    const neworg=req.body;
    
    const dborg=await orgcollection.findOne({username:neworg.username})
    
    if(dborg!= null){
        res.send({message:"organiser existed"})
    }else{
       
        const hashedPassword=await bcryptjs.hash(neworg.password,6)
        
        neworg.password=hashedPassword;
        
        await orgcollection.insertOne(neworg)
       
        res.send({message:"organiser created"})
    }
 }))

 orgapp.post('/login',expressAsyncHandler(async(req,res)=>{
   
    const officercred=req.body;
    
    const dbofficer= await orgcollection.findOne({username:officercred.username})
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






 module.exports=orgapp;
 