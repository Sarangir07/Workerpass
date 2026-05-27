const ChatRoom = require("../models/chatRoom.model");

async function ensureChatRoomIndexes() {
  await dropIndexIfExists("worker_1_employer_1");
  await dropIndexIfExists("application_1");

  await ChatRoom.createIndexes();
  console.log("Chat room indexes ready");
}

async function dropIndexIfExists(indexName) {
  try {
    await ChatRoom.collection.dropIndex(indexName);
    console.log(`Removed legacy chat room index: ${indexName}`);
  } catch (error) {
    if (!["IndexNotFound", "NamespaceNotFound"].includes(error.codeName) && error.code !== 27 && error.code !== 26) {
      throw error;
    }
  }
}

module.exports = ensureChatRoomIndexes;
