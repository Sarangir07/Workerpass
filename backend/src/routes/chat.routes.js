const express = require("express");
const chatController = require("../controllers/chat.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);
router.use(authorize("worker", "employer"));

router
  .route("/rooms")
  .get(chatController.getMyRooms)
  .post(chatController.createRoom);

router
  .route("/rooms/:roomId/messages")
  .get(chatController.getRoomMessages)
  .post(chatController.sendMessage);

module.exports = router;
