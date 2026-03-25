const jwt = require("jsonwebtoken");

const authMiddleware = (req , res , next)=>{
    const token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer')) {
        return res.status(401).send({ message: "unAuthorized" });
    }

    const tokenValue = token.split(" ")[1];

    try{
        const decoded = jwt.verify(tokenValue , process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(e){
        res.status(401).send({message : "Invalid Token"});
    }
}

module.exports = authMiddleware;
