const Schedule=require("../models/Schedule"),Route=require("../models/Route"),SeatReservation=require("../models/SeatReservation");
exports.searchBuses=async(req,res)=>{
 try{
  const {source,destination,date}=req.query;
  if(!source||!destination||!date)return res.status(400).json({status:"error",message:"Source, destination and date are required."});
  const start=new Date(date+"T00:00:00"),end=new Date(date+"T23:59:59.999");
  const routes=await Route.find({source_city:source,destination_city:destination});
  const schedules=await Schedule.find({route_id:{$in:routes.map(r=>r._id)},status:"SCHEDULED",departure_datetime:{$gte:start,$lte:end}}).populate("bus_id").populate("route_id").sort({departure_datetime:1});
  const buses=[];
  for(const s of schedules){if(!s.bus_id||!s.bus_id.is_active)continue;
   const bookedCount=await SeatReservation.countDocuments({schedule_id:s._id});
   buses.push({schedule_id:s._id,bus_id:s.bus_id._id,bus_name:s.bus_id.bus_name,bus_number:s.bus_id.bus_number,bus_type:s.bus_id.bus_type,source_city:s.route_id.source_city,destination_city:s.route_id.destination_city,departure_datetime:s.departure_datetime,arrival_datetime:s.arrival_datetime,fare:s.fare,total_seats:s.bus_id.total_seats,booked_seats:bookedCount,available_seats:s.bus_id.total_seats-bookedCount});
  }
  res.json({status:"success",count:buses.length,buses});
 }catch(e){console.error(e);res.status(500).json({status:"error",message:"Unable to search buses."});}
};
