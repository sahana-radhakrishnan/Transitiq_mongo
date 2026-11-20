const r = require("express").Router();

const auth = require("../middleware/authMiddleware");
const c = require("../controllers/bookingController");
const x = require("../controllers/cancellationController");

r.get("/", auth, c.getMyBookings);
r.post("/", auth, c.createBooking);
r.post("/:booking_id/cancel", auth, x.cancelBooking);

module.exports = r;