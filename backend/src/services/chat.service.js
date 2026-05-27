const mongoose = require("mongoose");
const ChatMessage = require("../models/chatMessage.model");
const ChatRoom = require("../models/chatRoom.model");
const EmployerCompany = require("../models/employerCompany.model");
const EmployerWorker = require("../models/employerWorker.model");
const Job = require("../models/job.model");
const JobApplication = require("../models/jobApplication.model");
const User = require("../models/user.model");
const WorkerProfile = require("../models/workerProfile.model");

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function ensureObjectId(value, fieldName = "id") {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createHttpError(`Invalid ${fieldName}`, 400);
  }
}

function normalizePair(currentUser, payload = {}) {
  let workerId = payload.workerId;
  let employerId = payload.employerId;

  if (currentUser.userType === "worker") {
    workerId = currentUser._id;
  }

  if (currentUser.userType === "employer") {
    employerId = currentUser._id;
  }

  if (!workerId || !employerId) {
    throw createHttpError("workerId and employerId are required", 400);
  }

  ensureObjectId(workerId, "worker id");
  ensureObjectId(employerId, "employer id");

  return {
    workerId,
    employerId
  };
}

async function getApplicationForRoom({ applicationId, workerId, employerId, jobId }) {
  const filter = {};

  if (applicationId) {
    ensureObjectId(applicationId, "application id");
    filter._id = applicationId;
  }

  if (workerId) {
    filter.workerId = workerId;
  }

  if (jobId) {
    ensureObjectId(jobId, "job id");
    filter.jobId = jobId;
  }

  const applications = await JobApplication.find(filter)
    .populate("jobId")
    .sort({ appliedAt: -1, applicationDate: -1 });

  const application = applications.find((item) => {
    const job = item.jobId;

    if (!job) {
      return false;
    }

    if (!employerId) {
      return true;
    }

    return String(job.createdBy) === String(employerId) || String(job.employer) === String(employerId);
  });

  if (!application) {
    throw createHttpError("Job application not found for this chat", 404);
  }

  return application;
}

async function validateUsers(workerId, employerId) {
  const [worker, employer] = await Promise.all([
    User.findOne({ _id: workerId, userType: "worker" }).select("_id"),
    User.findOne({ _id: employerId, userType: "employer" }).select("_id")
  ]);

  if (!worker) {
    throw createHttpError("Worker user not found", 404);
  }

  if (!employer) {
    throw createHttpError("Employer user not found", 404);
  }
}

async function hasApplicationOrHiring(workerId, employerId) {
  const [appliedJob, hiring] = await Promise.all([
    Job.findOne({
      $or: [{ createdBy: employerId }, { employer: employerId }],
      _id: { $in: await JobApplication.distinct("jobId", { workerId }) }
    }).select("_id"),
    EmployerWorker.findOne({ worker: workerId, employer: employerId }).select("_id")
  ]);

  return Boolean(appliedJob || hiring);
}

async function ensureChatAllowed(workerId, employerId) {
  await validateUsers(workerId, employerId);

  const allowed = await hasApplicationOrHiring(workerId, employerId);

  if (!allowed) {
    throw createHttpError("Chat is available only after job application or hiring", 403);
  }
}

function ensureParticipant(room, userId) {
  const isParticipant = room.participants.some((participant) => String(participant) === String(userId));

  if (!isParticipant) {
    throw createHttpError("You are not a participant in this chat room", 403);
  }
}

async function getOrCreateRoom(currentUser, payload) {
  if (payload.applicationId || payload.jobId) {
    const application = await getApplicationForRoom({
      applicationId: payload.applicationId,
      workerId: currentUser.userType === "worker" ? currentUser._id : payload.workerId,
      employerId: currentUser.userType === "employer" ? currentUser._id : payload.employerId,
      jobId: payload.jobId
    });

    const job = application.jobId;
    const employerId = job.createdBy || job.employer;

    if (currentUser.userType === "worker" && String(application.workerId) !== String(currentUser._id)) {
      throw createHttpError("You can only open chats for your applications", 403);
    }

    if (currentUser.userType === "employer" && String(employerId) !== String(currentUser._id)) {
      throw createHttpError("You can only open chats for your job applicants", 403);
    }

    return getOrCreateRoomForApplication(application);
  }

  const { workerId, employerId } = normalizePair(currentUser, payload);
  const application = await getApplicationForRoom({
    applicationId: payload.applicationId,
    workerId,
    employerId,
    jobId: payload.jobId
  });

  await ensureChatAllowed(workerId, employerId);

  return getOrCreateRoomForApplication(application);
}

async function getOrCreateRoomForApplication(applicationOrId) {
  const application =
    typeof applicationOrId === "object" && applicationOrId.jobId?.createdBy
      ? applicationOrId
      : await JobApplication.findById(applicationOrId._id || applicationOrId).populate("jobId");

  if (!application || !application.jobId) {
    throw createHttpError("Job application not found for this chat", 404);
  }

  const job = application.jobId;
  const workerId = application.workerId;
  const employerId = job.createdBy || job.employer;
  const companyId = job.company;

  if (!employerId) {
    throw createHttpError("Employer details are missing for this job", 400);
  }

  await validateUsers(workerId, employerId);

  return populateRoom(
    await ChatRoom.findOneAndUpdate(
      { worker: workerId, employer: employerId, job: job._id },
      {
        $setOnInsert: {
          worker: workerId,
          employer: employerId,
          job: job._id,
          application: application._id,
          company: companyId,
          participants: [workerId, employerId]
        }
      },
      { new: true, upsert: true, runValidators: true }
    )
  );
}

async function populateRoom(roomQuery) {
  const room = await roomQuery;

  await room.populate([
    { path: "worker", select: "name email userType" },
    { path: "employer", select: "name email userType" },
    { path: "job", select: "title companyName location createdBy employer company" },
    { path: "company", select: "companyName companyLogo businessType" },
    {
      path: "lastMessage",
      populate: [
        { path: "sender", select: "name email userType" },
        { path: "receiver", select: "name email userType" }
      ]
    }
  ]);

  return enrichRoom(room);
}

async function enrichRoom(room) {
  if (!room) {
    return room;
  }

  const plainRoom = room.toObject ? room.toObject() : room;
  const [company, workerProfile] = await Promise.all([
    plainRoom.company
      ? Promise.resolve(plainRoom.company)
      : EmployerCompany.findOne({ employer: plainRoom.employer?._id || plainRoom.employer })
          .select("companyName companyLogo businessType")
          .lean(),
    WorkerProfile.findOne({ user: plainRoom.worker?._id || plainRoom.worker })
      .select("fullName profilePhoto customJobTitle jobCategory")
      .lean()
  ]);

  plainRoom.company = company || null;
  plainRoom.workerProfile = workerProfile || null;
  plainRoom.display = {
    companyName: company?.companyName || plainRoom.job?.companyName || "Company",
    jobTitle: plainRoom.job?.title || "Applied job",
    employerName: plainRoom.employer?.name || "Employer",
    workerName: workerProfile?.fullName || plainRoom.worker?.name || "Worker",
    companyLogo: company?.companyLogo || null,
    workerPhoto: workerProfile?.profilePhoto || null
  };

  return plainRoom;
}

async function syncRoomsFromApplications(user) {
  if (!["worker", "employer"].includes(user.userType)) {
    return;
  }

  let applications = [];

  if (user.userType === "worker") {
    applications = await JobApplication.find({ workerId: user._id }).populate("jobId");
  } else {
    const employerJobIds = await Job.distinct("_id", {
      $or: [{ createdBy: user._id }, { employer: user._id }]
    });
    applications = await JobApplication.find({ jobId: { $in: employerJobIds } }).populate("jobId");
  }

  await Promise.all(
    applications
      .filter((application) => application.jobId)
      .map((application) => getOrCreateRoomForApplication(application).catch(() => null))
  );
}

async function getUserRooms(user) {
  await syncRoomsFromApplications(user);

  const rooms = await ChatRoom.find({ participants: user._id })
    .populate("worker", "name email userType")
    .populate("employer", "name email userType")
    .populate("job", "title companyName location createdBy employer company")
    .populate("company", "companyName companyLogo businessType")
    .populate({
      path: "lastMessage",
      populate: [
        { path: "sender", select: "name email userType" },
        { path: "receiver", select: "name email userType" }
      ]
    })
    .sort({ lastMessageAt: -1, updatedAt: -1 });

  return Promise.all(rooms.map(enrichRoom));
}

async function getRoomForUser(roomId, userId) {
  ensureObjectId(roomId, "room id");

  const room = await ChatRoom.findById(roomId).populate("job", "title companyName location");

  if (!room) {
    throw createHttpError("Chat room not found", 404);
  }

  ensureParticipant(room, userId);
  return room;
}

async function getRoomMessages(roomId, userId, query = {}) {
  await getRoomForUser(roomId, userId);

  const limit = Math.min(Number(query.limit) || 50, 100);
  const page = Math.max(Number(query.page) || 1, 1);

  return ChatMessage.find({ room: roomId })
    .populate("sender", "name email userType")
    .populate("receiver", "name email userType")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

async function createMessage(roomId, sender, messageText) {
  const room = await getRoomForUser(roomId, sender._id);
  const message = String(messageText || "").trim();

  if (!message) {
    throw createHttpError("message is required", 400);
  }

  if (message.length > 2000) {
    throw createHttpError("message cannot exceed 2000 characters", 400);
  }

  const receiverId = room.participants.find((participant) => String(participant) !== String(sender._id));

  const chatMessage = await ChatMessage.create({
    room: room._id,
    sender: sender._id,
    receiver: receiverId,
    message
  });

  await ChatRoom.updateOne(
    { _id: room._id },
    {
      lastMessage: chatMessage._id,
      lastMessageAt: chatMessage.createdAt
    }
  );

  return ChatMessage.findById(chatMessage._id)
    .populate("sender", "name email userType")
    .populate("receiver", "name email userType");
}

module.exports = {
  createMessage,
  getOrCreateRoom,
  getOrCreateRoomForApplication,
  getRoomForUser,
  getRoomMessages,
  getUserRooms
};
