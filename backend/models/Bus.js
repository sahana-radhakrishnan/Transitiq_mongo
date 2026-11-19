const mongoose=require("mongoose");
const busSchema=new mongoose.Schema({
  bus_number:{type:String,required:true,unique:true,trim:true},
  bus_name:{type:String,required:true,trim:true},
  bus_type:{type:String,required:true},
  total_seats:{type:Number,required:true,min:1,max:100},
  is_active:{type:Boolean,default:true},
  seats:[{seat_id:Number,seat_number:String,seat_type:String}]
},{timestamps:true});
module.exports=mongoose.model("Bus",busSchema);
