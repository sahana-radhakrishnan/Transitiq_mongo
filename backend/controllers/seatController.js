const Schedule=require("../models/Schedule"),Bus=require("../models/Bus"),SeatReservation=require("../models/SeatReservation");
exports.getSeatAvailability=async(req,res)=>{
 try{
  const schedule=await Schedule.findById(req.params.schedule_id);if(!schedule)return res.status(404).json({status:"error",message:"Schedule not found."});
  const bus=await Bus.findById(schedule.bus_id);if(!bus)return res.status(404).json({status:"error",message:"Bus not found."});
  const bookings=await Booking.find({schedule_id:schedule._id,booking_status:{$ne:"CANCELLED"}});
  const occupied=new Set();bookings.forEach(b=>b.seat_ids.filter(id=>!b.cancelled_seat_ids.includes(id)).forEach(id=>occupied.add(id)));
  const seats=bus.seats.map(s=>({seat_id:s.seat_id,seat_number:s.seat_number,seat_type:s.seat_type,seat_status:occupied.has(s.seat_id)?"BOOKED":"AVAILABLE"}));
  res.json({status:"success",schedule_id:schedule._id,total_seats:seats.length,available_seats:seats.filter(s=>s.seat_status==="AVAILABLE").length,booked_seats:occupied.size,seats});
 }catch(e){res.status(500).json({status:"error",message:"Unable to retrieve seat availability."});}
};
