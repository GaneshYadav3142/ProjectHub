const express=require("express")
const userRouter=express.Router()
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const db=require("../db")
const nodemailer= require("nodemailer")
const authMiddleware = require("../Midddleware/AuthenticationMiddelware")
const dotenv=require("dotenv")

dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
})

userRouter.post("/register",async(req,res)=>{
    const {name,email,password,role}=req.body
   
    console.log(req.body)
    try {
        if(!name || !email || !password || !role){

            res.status(400).send("Please fill all details")
           }
      db.query("SELECT * FROM users WHERE email = ?",email,async (err,result)=>{
        console.log(result)
        if (err) {
            return res.status(500).send("Internal Server Error");
        }
        if(result.length){
            res.status(400).send({msg:"User Already Exist, Please login!"})
        }
        else{
            const newPassword=await bcrypt.hash(password,10)
            db.query("INSERT INTO users SET ?",{name,email,password:newPassword,role},(err,result)=>{
                if(err){
                    res.status(400).send({err:"error creating user"})
                }else{
                    res.status(200).send({msg:"The new User has been added"})
                
                }
            })
        }
      })
    } catch (error) { 
        res.status(400).send({err:"error"})
    }
})
const otpStorage={}
function sendOTP(userIdentifier) {
   
   const otp =Math.floor(100000 + Math.random()*900000)
   otpStorage[userIdentifier]={otp:otp, timestamp:Date.now()}
   return otp
}


function verifyOTP(userIdentifier, otpEntered, otpExpiryDuration = 300000) { // Default expiry duration: 5 minutes
    if (otpStorage[userIdentifier]) {

        const storedOTPData = otpStorage[userIdentifier];
        console.log("sotred",storedOTPData)
        if (Date.now() - storedOTPData.timestamp <= otpExpiryDuration && storedOTPData.otp == otpEntered) {
            delete otpStorage[userIdentifier]; // Remove OTP from storage after successful verification
            return true;
        }
    }
    return false;
}

async function sendEmail(email) {
    const otp = sendOTP(email); // Assuming sendOTP(email) generates the OTP
    const info = await transporter.sendMail({
        from: {
            name: "ProjectHub",
            address: process.env.EMAIL
        },
        to: email,
        subject: "OTP Verification",
        text: `Your OTP for verification is: ${otp}`,
        html: `<b>Your OTP for verification is: ${otp}</b>`
    });
    console.log("Message sent: %s", info.messageId);
}


userRouter.post('/login', async(req, res) => {
    const { email, password } = req.body;
  
   try {
    db.query('SELECT * FROM users WHERE email = ?', email, async(err, results) => {
        if (err) {
        
          res.status(500).send({ success: false, message: 'User Not found' });
        }
        if (results.length===0) {
           res.status(401).send({ success: false, message: 'Invalid email or password.' });
        }
        
        const verify= await bcrypt.compare(password,results[0].password)
        console.log(verify)
        if(!verify){
            res.status(400).send("Incorrect Password")
           }
           else{
            // const token=jwt.sign({userID:results[0].id,role:results[0].role},"ProjectHub",{expiresIn:"1d"})
             const sendMail= await sendEmail(email)
            //console.log(sendOTP(email))
            res.status(200).send({success: true, message: 'OTP send successfully to your email, valif for 5 minutes' })
           }
      
      });
   } catch (error) {
    res.status(400).send({error:"error"})
   }
  });

  userRouter.post("/email",async(req,res)=>{

    const {email,otp} = req.body
   
    //const {email}= req.params
    try { 
        console.log("route hitted",email,otp)
         const isVerified = verifyOTP(email,+otp)
         console.log("verfication",isVerified)
         console.log(email,otp)
         if (isVerified) {
            res.status(200).send({ success: true, message: "OTP verified successfully." })
         }
         else {
                res.status(400).send({ success: false, message: "Invalid OTP." });
            
         }
    } catch (error) {
        res.status(500).send({ success: false, message: "Internal server error." });
    
    }
  })


  userRouter.get('/', authMiddleware,async(req, res) => {
    const managerID=req.body.userID;
    const role=req.body.role

    try {
        if(role!=="Team member"){
        const fetchTeamMembersQuery = 'SELECT id, name, email FROM users WHERE role = "Team member"';

    db.query(fetchTeamMembersQuery, (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json(results);
        }
    });
    }
    
} catch (error) {
       res.status(400).send("Internal Server Error") 
    }
    
});





module.exports=userRouter