const Schedule = require("../models/Schedule");
const Bus = require("../models/Bus");
const Booking = require("../models/Booking");

exports.getSeatAvailability = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.schedule_id);

        if (!schedule) {
            return res.status(404).json({ status: "error", message: "Schedule not found." });
        }

        const bus = await Bus.findById(schedule.bus_id);

        if (!bus) {
            return res.status(404).json({ status: "error", message: "Bus not found." });
        }

        const bookings = await Booking.find({
            schedule_id: schedule._id,
            booking_status: { $ne: "CANCELLED" }
        });

        const occupied = new Set();

        bookings.forEach(booking => {
            const cancelledSeats = booking.cancelled_seat_ids || [];

            booking.seat_ids
                .filter(id => !cancelledSeats.includes(id))
                .forEach(id => occupied.add(id));
        });

        const seats = bus.seats.map(seat => ({
            seat_id: seat.seat_id,
            seat_number: seat.seat_number,
            seat_type: seat.seat_type,
            seat_status: occupied.has(seat.seat_id) ? "BOOKED" : "AVAILABLE"
        }));

        res.json({
            status: "success",
            schedule_id: schedule._id,
            total_seats: seats.length,
            available_seats: seats.filter(s => s.seat_status === "AVAILABLE").length,
            booked_seats: occupied.size,
            seats
        });

    } catch (e) {
        console.error("Seat availability error:", e);
        res.status(500).json({
            status: "error",
            message: "Unable to retrieve seat availability."
        });
    }
};
