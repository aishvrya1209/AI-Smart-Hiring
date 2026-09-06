const companyAuth = (req,res,next) =>{
        const role = req.user.role;
        if(role === "company")
            next();
        else
            return res.status(403).send("Not Authorized to access this");

};

module.exports = companyAuth;