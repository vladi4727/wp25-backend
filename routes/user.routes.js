const router = require("express").Router();
const controller = require("../controllers/user.controller");
const authenticateJWT = require("../middlewares/auth");
const { upload } = require("../middlewares/upload");

router.get("/", controller.getAll);
router.post("/", controller.create);
router.post("/login", controller.login);
router.post(
  "/profile",
  authenticateJWT,
  upload.array("pictures", 6),
  controller.createProfile
);
router.put("/profile", authenticateJWT, controller.updateProfile);
router.get("/profile", authenticateJWT, controller.getProfile);

router.get("/candidates", authenticateJWT, controller.findCandidates);
router.post("/swipes", authenticateJWT, controller.swipe);
router.get("/matches", authenticateJWT, controller.getMatches);

module.exports = router;
