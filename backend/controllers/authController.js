const User=require("../models/User"), OTP=require("../models/PasswordResetOTP");
const bcrypt=require("bcryptjs"), jwt=require("jsonwebtoken"), crypto=require("crypto");
exports.registerPassenger=async(req,res)=>{
 try{
  const {name,email,phone,password}=req.body;
  if(!name||!email||!password) return res.status(400).json({status:"error",message:"Name, email and password are required."});
  if(password.length<8) return res.status(400).json({status:"error",message:"Password must contain at least 8 characters."});
  if(await User.findOne({email:email.toLowerCase().trim()})) return res.status(409).json({status:"error",message:"Email is already registered."});
  const user=await User.create({name,email,phone,password_hash:await bcrypt.hash(password,10),role:"PASSENGER"});
  res.status(201).json({status:"success",message:"Registration successful!",user:{user_id:user._id,name:user.name,email:user.email,role:user.role}});
 }catch(e){res.status(500).json({status:"error",message:e.code===11000?"Email is already registered.":"Registration failed."});}
};
exports.loginPassenger=async(req,res)=>{
 try{
  const {email,password}=req.body;if(!email||!password)return res.status(400).json({status:"error",message:"Email and password are required."});
  const user=await User.findOne({email:email.toLowerCase().trim()});
  if(!user||!(await bcrypt.compare(password,user.password_hash)))return res.status(401).json({status:"error",message:"Invalid email or password."});
  const token=jwt.sign({user_id:user._id.toString(),role:user.role},process.env.JWT_SECRET,{expiresIn:"1d"});
  res.json({status:"success",message:"Login successful!",token,user:{user_id:user._id,name:user.name,email:user.email,phone:user.phone,role:user.role}});
  } catch(e) {
  console.error("LOGIN ERROR:", e);
  res.status(500).json({
   status: "error",
   message: "Login failed."
  });
 }
};
exports.forgotPassword=async(req,res)=>{
 try{
  const {email}=req.body;if(!email)return res.status(400).json({status:"error",message:"Email is required."});
  const user=await User.findOne({email:email.toLowerCase().trim()});
  const message="If the email is registered, an OTP has been generated. Check the backend terminal for this local demo.";
  if(!user)return res.json({status:"success",message});
  const otp=crypto.randomInt(100000,1000000).toString();
  await OTP.updateMany({user_id:user._id,used_at:null},{used_at:new Date()});
  await OTP.create({user_id:user._id,otp_hash:await bcrypt.hash(otp,10),expires_at:new Date(Date.now()+10*60*1000)});
  console.log("TRANSITIQ PASSWORD RESET OTP",email,otp,"(valid 10 minutes)");
  res.json({status:"success",message});
 }catch(e){res.status(500).json({status:"error",message:"Unable to generate OTP."});}
};
exports.resetPassword=async(req,res)=>{
 try{
  const {email,otp,new_password}=req.body;
  if(!email||!otp||!new_password)return res.status(400).json({status:"error",message:"Email, OTP and new password are required."});
  if(!/^\\d{6}$/.test(otp))return res.status(400).json({status:"error",message:"Enter a valid 6-digit OTP."});
  if(new_password.length<8)return res.status(400).json({status:"error",message:"New password must contain at least 8 characters."});
  const user=await User.findOne({email:email.toLowerCase().trim()});if(!user)return res.status(400).json({status:"error",message:"Invalid email or OTP."});
  const record=await OTP.findOne({user_id:user._id,used_at:null,expires_at:{$gt:new Date()}}).sort({createdAt:-1});
  if(!record)return res.status(400).json({status:"error",message:"OTP is invalid or expired. Generate a new OTP."});
  if(!(await bcrypt.compare(otp,record.otp_hash)))return res.status(400).json({status:"error",message:"Incorrect OTP."});
  user.password_hash=await bcrypt.hash(new_password,10);await user.save();record.used_at=new Date();await record.save();
  res.json({status:"success",message:"Password reset successfully! You can now log in."});
 }catch(e){res.status(500).json({status:"error",message:"Password reset failed."});}
};
