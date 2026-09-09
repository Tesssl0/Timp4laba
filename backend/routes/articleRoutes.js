const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");

const {
  getAll,
  getOne,
  create,
  update,
  remove
} = require("../controllers/articleController");

router.get("/", optionalAuth, getAll);
router.get("/:id", optionalAuth, getOne);

router.post("/", auth, create);
router.put("/:id", auth, update);
router.delete("/:id", auth, remove);

module.exports = router;
