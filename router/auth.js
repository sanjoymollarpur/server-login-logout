const express = require('express');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate')
const router = express.Router();
require('../db/conn');
const User = require('../models/userShcema');
router.get('/', (req, res)=>{
    
    res.send("Hello router world from the server");
});
//using promise
// router.post('/register',(req, res)=>{
//     const {name, email, phone, work, password, cpassword} = req.body;
//     if(!name || !email || !phone || !work || !password || !cpassword)
//     {
//         return res.status(422).json({error:"Plz fill all the data"});
//     } 
//     User.findOne({email:email})
//     .then((userexist)=>{
//         if(userexist){
//             return res.status(422).json({error:"Email Exist"});
//         }
//         const user = new User({name, email, phone, work, password, cpassword});

//         user.save().then(()=>{
//             res.status(201).json({message:"User register successful"});
//         }).catch((err)=>res.status(500).json({error:"Failed register"}));
//     }).catch(err=>{console.log(err)});
//     // console.log(req.body);
//     //  res.send("Router page");
// })
//using async await
router.post('/register', async(req, res)=>{
    const {name, email, phone, work, password, cpassword} = req.body;
    if(!name || !email || !phone || !work || !password || !cpassword)
    {
        return res.status(422).json({error:"Plz fill all the data"});
    } 

    try{
           const userexist = await User.findOne({email:email});
           if(userexist){
            return res.status(422).json({error:"Email alredy Exist"});
            }else if(password!==cpassword)
            {
                return res.status(422).json({error:"password not match"});
            }
            const user = new User({name, email, phone, work, password, cpassword});
            
            
            const userregister = await user.save();
            if(userregister){
                res.status(201).json({message:"User register successful"});
            }

    }catch(err){
        console.log(err);
    }
    
    
    // console.log(req.body);
    //  res.send("Router page");
});


router.post('/signin', async(req, res)=>{
    //console.log(req.body);
    //res.send(req.body);
    try {
        const {email, password} = req.body;
        
        if(!email || !password){
           return res.status(422).json({error:"Plz fill all the data"});
        }
        const usersignin = await User.findOne({email:email});
        if(!usersignin){
            return res.status(400).json({message:"Invalid"});
        }
        const ismatch = await bcrypt.compare(password, usersignin.password);
        const token = await usersignin.generateAuthToken();
        res.cookie("jwtoken", token, {
            expires: new Date(Date.now()+ 258920000000),
            httpOnly:true
        });
        if(!usersignin || !ismatch){
            return res.status(400).json({message:"Invalid"});
        }
        res.json({message:"user signin successful"});
    } catch (error) {
        console.log(error);
    }
})

router.get('/about', authenticate, (req, res)=>{
   // console.log(req.rootUser)
    res.send(req.rootUser);
});

module.exports = router;