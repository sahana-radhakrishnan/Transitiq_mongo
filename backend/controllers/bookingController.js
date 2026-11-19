const mongoose=require("mongoose"),crypto=require("crypto");
const Schedule=require("../models/Schedule"),Bus=require("../models/Bus"),Booking=require("../models/Booking");
const {runBookingDFA}=require("../dfa/bookingDFA");
const SeatReservation=require("../models/SeatReservation");
exports.createBooking=async(req,res)=>{
 const {schedule_id,seat_ids}=req.body,user_id=req.user.user_id;
 if(!mongoose.isValidObjectId(schedule_id)||!Array.isArray(seat_ids)||!seat_ids.length||!seat_ids.every(x=>Number.isInteger(Number(x))&&Number(x)>0))return res.status(400).json({status:"error",message:"Valid schedule ID and seat IDs are required."});
 const seats=[...new Set(seat_ids.map(Number))];if(seats.length!==seat_ids.length)return res.status(400).json({status:"error",message:"Duplicate seat IDs are not allowed."});
 const events=[];
 try{
  const schedule=await Schedule.findOne({_id:schedule_id,status:"SCHEDULED"});if(!schedule)return res.status(404).json({status:"error",message:"Schedule not found or unavailable."});
  events.push("SELECT_SCHEDULE");
  const bus=await Bus.findById(schedule.bus_id);if(!bus)return res.status(404).json({status:"error",message:"Bus not found."});
  if(seats.some(id=>!bus.seats.some(s=>s.seat_id===id)))return res.status(400).json({status:"error",message:"One or more selected seats are invalid."});
  events.push("SELECT_SEATS","VALIDATE_DETAILS");
  const existing=await Booking.find({schedule_id,booking_status:{$ne:"CANCELLED"},seat_ids:{$in:seats}});
  const occupied=new Set(existing.flatMap(b=>b.seat_ids.filter(id=>!b.cancelled_seat_ids.includes(id))));
  const conflicts=seats.filter(id=>occupied.has(id));
  if(conflicts.length)return res.status(409).json({status:"error",message:"One or more selected seats are already booked.",booked_seats:conflicts});
  events.push("CHECK_AVAILABILITY");
  const bookingId=new mongoose.Types.ObjectId();
  reservationBookingId=bookingId;
  await SeatReservation.insertMany(seats.map(seat_id=>({schedule_id,seat_id,booking_id:bookingId})),{ordered:true});
  const booking=await Booking.create({_id:bookingId,booking_reference:"TRQ"+Date.now()+crypto.randomBytes(3).toString("hex").toUpperCase(),user_id,schedule_id,seat_ids:seats,cancelled_seat_ids:[],total_amount:Number(schedule.fare)*seats.length,booking_status:"CONFIRMED",payment_status:"NOT_REQUIRED"});
  events.push("CONFIRM_BOOKING");
  res.status(201).json({status:"success",message:"Booking confirmed successfully!",booking:{booking_id:booking._id,booking_reference:booking.booking_reference,schedule_id,seat_ids:seats,number_of_seats:seats.length,fare_per_seat:schedule.fare,total_amount:booking.total_amount,booking_status:booking.booking_status},dfa:runBookingDFA(events)});
 }catch(e){if(reservationBookingId)await SeatReservation.deleteMany({booking_id:reservationBookingId});if(e.code===11000)return res.status(409).json({status:"error",message:"One or more selected seats are already booked."});console.error("Booking error",e);res.status(500).json({status:"error",message:"Unable to complete booking."});}
};
