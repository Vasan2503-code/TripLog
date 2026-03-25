const User = require('../models/User');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await User.findOne({email});
        if(user){
            return res.status(400).send("User Already exists");
        }
        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(password, salt);
        const newUser = new User({
            name ,
            email,
            password : hashPass
        })

        await newUser.save();
        const token = jwt.sign({id : newUser._id} , process.env.JWT_SECRET , {expiresIn : "2h"});
        res.status(201).send({ message: "Registered successfully" , token});
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Error in server while registering", error: e.message });
    }
}

const loginUser = async(req , res)=>{
    try{
        const {email , password} = req.body;

        const curUser = await User.findOne({email});

        if(!curUser){
            return res.status(400).send({message : "User does'nt exist"});
        }

        const isMatch = await bcrypt.compare(password , curUser.password);

        if(!isMatch){
            return res.status(400).send({message : "Incorrect Password"});
        }

        const token = jwt.sign({id : curUser._id} , process.env.JWT_SECRET , {expiresIn : "2h"});
        res.status(200).send({message : "Login Successfull" , token});
    }catch(e){
        res.status(500).send({message : "Server side error : " , e});
    }
}


module.exports = {registerUser , loginUser};