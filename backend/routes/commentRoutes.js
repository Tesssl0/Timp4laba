const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");

const { getByArticle, create, report } = require("../controllers/commentController");

router.get("/article/:articleId", optionalAuth, getByArticle);
router.post("/article/:articleId", auth, create);
router.post("/:id/report", auth, report);

module.exports = router;
