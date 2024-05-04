const express = require("express");
const {
    allMessages,
    sendMessage,
} = require("../controller/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, allMessages);

module.exports = router;