require("dotenv").config();
const connectDB=require("../config/db"),User=require("../models/User"),bcrypt=require("bcryptjs");
(async()=>{
 try{
  if(!process.env.ADMIN_EMAIL||!process.env.ADMIN_PASSWORD){throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first.");}
  await connectDB();
  const email=process.env.ADMIN_EMAIL.toLowerCase().trim();
  const password_hash=await bcrypt.hash(process.env.ADMIN_PASSWORD,10);
  const user=await User.findOneAndUpdate({email},{name:process.env.ADMIN_NAME||"TRANSITIQ Administrator",email,password_hash,role:"ADMIN"},{upsert:true,new:true,setDefaultsOnInsert:true});
  console.log("Admin account ready:",user.email);
  await require("mongoose").disconnect();
 }catch(e){console.error(e.message);process.exitCode=1;}
})();
