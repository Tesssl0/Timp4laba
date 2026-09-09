const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const {
  getQueue,
  approve,
  reject,
  revise,
  archive,
  getLog,
  getComplaints,
  hideComment,
  restoreComment
} = require("../controllers/moderationController");

router.use(auth, requireRole("moderator", "admin"));

router.get("/queue", getQueue);
router.post("/:id/approve", approve);
router.post("/:id/reject", reject);
router.post("/:id/revise", revise);
router.post("/:id/archive", archive);
router.get("/:id/log", getLog);

router.get("/complaints", getComplaints);
router.post("/comments/:id/hide", hideComment);
router.post("/comments/:id/restore", restoreComment);

module.exports = router;
