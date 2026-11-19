const mongoose=require("mongoose");
const schema=new mongoose.Schema({schedule_id:{type:mongoose.Schema.Types.ObjectId,ref:"Schedule",required:true},seat_id:{type:Number,required:true},booking_id:{type:mongoose.Schema.Types.ObjectId,ref:"Booking",required:true}},{timestamps:true});
schema.index({schedule_id:1,seat_id:1},{unique:true});
module.exports=mongoose.model("SeatReservation",schema);
