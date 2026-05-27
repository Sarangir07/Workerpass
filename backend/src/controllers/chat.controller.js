const chatService = require("../services/chat.service");

async function createRoom(req, res, next) {
  try {
    const room = await chatService.getOrCreateRoom(req.user, req.body);
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
}

async function getMyRooms(req, res, next) {
  try {
    const rooms = await chatService.getUserRooms(req.user);
    res.json(rooms);
  } catch (error) {
    next(error);
  }
}

async function getRoomMessages(req, res, next) {
  try {
    const messages = await chatService.getRoomMessages(req.params.roomId, req.user._id, req.query);
    res.json(messages.reverse());
  } catch (error) {
    next(error);
  }
}

async function sendMessage(req, res, next) {
  try {
    const message = await chatService.createMessage(req.params.roomId, req.user, req.body.message);
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createRoom,
  getMyRooms,
  getRoomMessages,
  sendMessage
};
