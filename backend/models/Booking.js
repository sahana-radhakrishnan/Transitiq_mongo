const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 booking_reference:{type:String,required:true,unique:true},
 user_id:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 schedule_id:{type:mongoose.Schema.Types.ObjectId,ref:"Schedule",required:true},
 seat_ids:[{type:Number,required:true}],
 cancelled_seat_ids:[{type:Number}],
 total_amount:{type:Number,required:true},
 booking_status:{type:String,enum:["CONFIRMED","PARTIALLY_CANCELLED","CANCELLED"],default:"CONFIRMED"},
 payment_status:{type:String,default:"NOT_REQUIRED"},
 cancellation_history:[{seat_ids:[Number],reason:String,cancellation_date:{type:Date,default:Date.now},refund_amount:{type:Number,default:0}}]
},{timestamps:true});
module.exports=mongoose.model("Booking",schema);
