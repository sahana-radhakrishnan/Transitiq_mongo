const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 source_city:{type:String,required:true,trim:true},
 destination_city:{type:String,required:true,trim:true},
 distance_km:{type:Number,required:true,min:0}
},{timestamps:true});
schema.index({source_city:1,destination_city:1},{unique:true});
module.exports=mongoose.model("Route",schema);
