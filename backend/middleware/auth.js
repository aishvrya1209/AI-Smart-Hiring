const jwt = require("jsonwebtoken"); 
const JWT_SECRET = process.env.JWT_SECRET; 
 
const auth = (req,res,next) => { 
    const token = req.header("Authorization"); 
    
    if(!token) 
        return res.status(401).send("Access Denied"); 
 
    try { 
        const decoded = jwt.verify(token,JWT_SECRET); 
        req.user = decoded; 
    } 
    catch(err) { 
        return res.status(401).send("Invalid token") 
    } 
    
    next(); 
}; 
 
module.exports = auth;