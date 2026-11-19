const Booking=require("../models/Booking"),Schedule=require("../models/Schedule"),Route=require("../models/Route"),Bus=require("../models/Bus");
exports.getDashboardAnalytics=async(req,res)=>{
 try{
  const bookings=await Booking.find().populate({path:"schedule_id",populate:[{path:"route_id"},{path:"bus_id"}]});
  const totalBookings=bookings.length,bookedSeats=bookings.reduce((n,b)=>n+b.seat_ids.filter(id=>!b.cancelled_seat_ids.includes(id)).length,0);
  const cancelledSeats=bookings.reduce((n,b)=>n+b.cancelled_seat_ids.length,0);
  const revenue=bookings.reduce((n,b)=>n+b.seat_ids.filter(id=>!b.cancelled_seat_ids.includes(id)).length*(b.schedule_id?.fare||0),0);
  const routeMap={},dayMap={},statusMap={},occupancy=[];
  bookings.forEach(b=>{const r=b.schedule_id?.route_id;if(r){const k=r.source_city+"|"+r.destination_city;routeMap[k]??={source_city:r.source_city,destination_city:r.destination_city,total_bookings:0};routeMap[k].total_bookings++;}const d=new Date(b.createdAt).toISOString().slice(0,10);dayMap[d]=(dayMap[d]||0)+1;statusMap[b.booking_status]=(statusMap[b.booking_status]||0)+1;});
  for(const s of await Schedule.find().populate("bus_id").populate("route_id")){if(!s.bus_id)continue;const related=bookings.filter(b=>String(b.schedule_id?._id)===String(s._id));const count=related.reduce((n,b)=>n+b.seat_ids.filter(id=>!b.cancelled_seat_ids.includes(id)).length,0);occupancy.push({bus_name:s.bus_id.bus_name,bus_number:s.bus_id.bus_number,schedule_id:s._id,total_seats:s.bus_id.total_seats,booked_seats:count,occupancy_percentage:Number((count/s.bus_id.total_seats*100).toFixed(2))});}
  res.json({status:"success",summary:{total_bookings:totalBookings,total_revenue:revenue,booked_seats:bookedSeats,cancellation_rate:bookings.reduce((n,b)=>n+b.cancelled_seat_ids.length,0)===0?0:Number((cancelledSeats/Math.max(1,bookings.reduce((n,b)=>n+b.seat_ids.length,0))*100).toFixed(2))},routes:Object.values(routeMap).sort((a,b)=>b.total_bookings-a.total_bookings),daily_bookings:Object.entries(dayMap).sort().map(([booking_day,total_bookings])=>({booking_day,total_bookings})),booking_status:Object.entries(statusMap).map(([booking_status,total])=>({booking_status,total})),bus_occupancy:occupancy.sort((a,b)=>b.occupancy_percentage-a.occupancy_percentage)});
 }catch(e){console.error("Analytics error",e);res.status(500).json({status:"error",message:"Unable to load analytics data"});}
};
