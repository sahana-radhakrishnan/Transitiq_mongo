const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxlength:100},
  email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  phone:{type:String,default:""},
  password_hash:{type:String,required:true},
  role:{type:String,enum:["PASSENGER","ADMIN"],default:"PASSENGER"}
},{timestamps:true});
module.exports=mongoose.model("User",userSchema);
