const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 user_id:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 otp_hash:{type:String,required:true},
 expires_at:{type:Date,required:true},
 used_at:{type:Date,default:null}
},{timestamps:true});
module.exports=mongoose.model("PasswordResetOTP",schema);
