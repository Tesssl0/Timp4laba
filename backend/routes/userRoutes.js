const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const { getAll, updateRole } = require("../controllers/userController");

router.get("/", auth, requireRole("admin"), getAll);
router.patch("/:id/role", auth, requireRole("admin"), updateRole);

module.exports = router;
