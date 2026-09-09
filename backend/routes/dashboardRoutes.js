const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const { getStats } = require("../controllers/dashboardController");

router.get("/stats", auth, requireRole("moderator", "admin"), getStats);

module.exports = router;
