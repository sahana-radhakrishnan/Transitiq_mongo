const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 bus_id:{type:mongoose.Schema.Types.ObjectId,ref:"Bus",required:true},
 route_id:{type:mongoose.Schema.Types.ObjectId,ref:"Route",required:true},
 departure_datetime:{type:Date,required:true},
 arrival_datetime:{type:Date,required:true},
 fare:{type:Number,required:true,min:0},
 status:{type:String,enum:["SCHEDULED","CANCELLED","COMPLETED"],default:"SCHEDULED"}
},{timestamps:true});
module.exports=mongoose.model("Schedule",schema);
