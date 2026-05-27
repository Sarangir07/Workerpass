export function getUserId(user) {
  return user?._id || user?.id || "";
}

export function getOtherParticipant(room, currentUser) {
  const currentUserId = getUserId(currentUser);

  if (currentUser?.userType === "worker") {
    return room.employer || {};
  }

  if (currentUser?.userType === "employer") {
    return room.worker || {};
  }

  return [room.worker, room.employer].find((participant) => getUserId(participant) !== currentUserId) || {};
}

export function getConversationDisplay(room, currentUser) {
  const display = room?.display || {};
  const participant = getOtherParticipant(room, currentUser);
  const isWorker = currentUser?.userType === "worker";

  return {
    title: isWorker ? display.companyName || room?.company?.companyName || room?.job?.companyName || "Company" : display.workerName || room?.workerProfile?.fullName || participant.name || "Worker",
    subtitle: display.jobTitle || room?.job?.title || "Applied job",
    meta: isWorker ? display.employerName || participant.name || "Employer" : participant.email || "Applicant",
    image: isWorker ? display.companyLogo?.url || room?.company?.companyLogo?.url : display.workerPhoto?.url || room?.workerProfile?.profilePhoto?.url,
    fallbackName: isWorker ? display.companyName || room?.job?.companyName : display.workerName || participant.name
  };
}

export function getConversationSearchText(room, currentUser) {
  const display = getConversationDisplay(room, currentUser);
  return `${display.title} ${display.subtitle} ${display.meta}`.toLowerCase();
}

export function getInitials(value) {
  return String(value || "WC")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatChatTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(date);
  }

  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

export function formatMessageTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function formatDateDivider(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export function groupMessagesByDate(messages) {
  return messages.reduce((groups, message) => {
    const key = new Date(message.createdAt || Date.now()).toDateString();

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(message);
    return groups;
  }, {});
}

export function getRoomLastMessage(room) {
  return room.lastMessage?.message || "No messages yet";
}

export function sortRooms(rooms) {
  return [...rooms].sort((a, b) => new Date(b.lastMessageAt || b.updatedAt || 0) - new Date(a.lastMessageAt || a.updatedAt || 0));
}
