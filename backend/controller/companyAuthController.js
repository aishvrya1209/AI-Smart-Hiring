const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const Company=require("../models/company");

const registerCompany= async(req,res)=>{
    try{
        const{companyName,email,password,phone}=req.body;

        if(!companyName||!email||!password){
            return res.status(400).json({
                message:"Company name, email and password are required"
            });
        }


        
        const existingCompany= await Company.findOne({email});
        if(existingCompany){
            return res.status(409).json({
                message:"Company already registered with this email"
            });
        }

        const hashedPassword= await bcrypt.hash(password,10);
        
        const company=await Company.create({
            companyName,
            email,
            password:hashedPassword,
            phone
        });

        res.status(201).json({
            message:"company registered successfully",
            company:{
                id: company._id,
                companyName: company.companyName,
                email: company.email,
                phone: company.phone
            }
        });

    }
    catch(error){
        console.error("Company registration error:", error.message);

        res.status(500).json({
            message: "Server error during registration"
        });
    }
}

// LOGIN
const loginCompany = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find company
        const company = await Company.findOne({ email });

        if (!company) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            company.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: company._id,
                role: "company"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "30d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            company: {
                id: company._id,
                companyName: company.companyName,
                email: company.email,
                phone: company.phone
            }
        });

    } catch (error) {
        console.error("Company login error:", error.message);

        res.status(500).json({
            message: "Server error during login"
        });
    }
};


module.exports = {
    registerCompany,
    loginCompany
};