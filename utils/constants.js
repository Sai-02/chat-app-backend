const ROUTE_PATHS = {
  AUTH: "/auth",
  LOGIN: "/login",
  SIGNUP: "/signup",
  CHAT: "/chat",
  CREATE: "/create",
  DELETE: "/delete",
  LIST: "/list",
  ALL: "/all",
  MESSAGE: "/message",
  SEND: "/send",
  MARK_AS_READ: "/mark_as_read",
};

const SOCKET_EVENTS = {
  CONNECTION: "connection",
  SEND_MESSAGE: "send_message",
  RECIEVE_MESSAGE: "recieve_message",
  MARK_AS_READ: "/mark_as_read",
  GET_CHAT_LIST: "/get_chat_list",
};

module.exports = {
  ROUTE_PATHS,
  SOCKET_EVENTS,
};
