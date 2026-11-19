const mongoose=require("mongoose"),Booking=require("../models/Booking"),SeatReservation=require("../models/SeatReservation"),{runCancellationDFA}=require("../dfa/cancellationDFA");
exports.cancelBooking=async(req,res)=>{
 const {seat_ids,reason}=req.body;
 if(!mongoose.isValidObjectId(req.params.booking_id)||!Array.isArray(seat_ids)||!seat_ids.length||!seat_ids.every(x=>Number.isInteger(Number(x))&&Number(x)>0))return res.status(400).json({status:"error",message:"Valid booking ID and seat IDs are required."});
 const seats=[...new Set(seat_ids.map(Number))];if(seats.length!==seat_ids.length)return res.status(400).json({status:"error",message:"Duplicate seat IDs are not allowed."});
 try{
  const booking=await Booking.findOne({_id:req.params.booking_id,user_id:req.user.user_id});
  if(!booking)return res.status(404).json({status:"error",message:"Booking not found."});
  if(booking.booking_status==="CANCELLED")return res.status(400).json({status:"error",message:"This booking is already cancelled."});
  const active=booking.seat_ids.filter(id=>!booking.cancelled_seat_ids.includes(id));
  if(seats.some(id=>!active.includes(id)))return res.status(400).json({status:"error",message:"One or more seats are invalid or already cancelled."});
  const events=["IDENTIFY_BOOKING","REQUEST_CANCELLATION","VALIDATE_CANCELLATION"];
  booking.cancelled_seat_ids=[...booking.cancelled_seat_ids,...seats];
  booking.cancellation_history.push({seat_ids:seats,reason:typeof reason==="string"&&reason.trim()?reason.trim().slice(0,255):"Passenger requested cancellation",refund_amount:0});
  booking.booking_status=booking.cancelled_seat_ids.length===booking.seat_ids.length?"CANCELLED":"PARTIALLY_CANCELLED";
  await booking.save();
  await SeatReservation.deleteMany({schedule_id:booking.schedule_id,seat_id:{$in:seats},booking_id:booking._id});
  events.push("CONFIRM_CANCELLATION");
  res.json({status:"success",message:"Seat cancellation completed successfully!",cancellation:{booking_id:booking._id,cancelled_seat_ids:seats,cancelled_count:seats.length,booking_status:booking.booking_status,refund_amount:0},dfa:runCancellationDFA(events)});
 }catch(e){console.error(e);res.status(500).json({status:"error",message:"Unable to cancel booking."});}
};
