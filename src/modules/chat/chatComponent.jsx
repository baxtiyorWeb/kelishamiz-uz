"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import api from "../../config/auth/api";
import useGetUser from "../../hooks/services/useGetUser";
import useGetOneQuery from "../../hooks/api/useGetOneQuery";
import KEYS from "../../export/keys";
import URLS from "../../export/urls";
import { get, isNull } from "lodash";

// TypingUser class equivalent
const TypingUser = {
  create: (userId, username) => ({ userId, username }),
};

// Icon component for reusability
const ChatIcon = () => (
  <svg
    className="w-8 h-8 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

export default function ChatPage() {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef({});
  const messagesEndRef = useRef(null);
  const urlParams = new URLSearchParams(window.location.search);
  const CURRENT_USER = useGetUser();
  const currentUserIdRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const { data } = useGetOneQuery({
    key: `${KEYS.product_detail}/${urlParams.get("productId")}`,
    url: `${URLS.product_detail}/${urlParams.get("productId")}`,
    enabled: !!urlParams.get("productId"),
  });

  const item = !isNull(get(data, "data.content"))
    ? get(data, "data.content", {})
    : {};

  async function getCurrentUserId() {
    return new Promise((resolve) => {
      if (CURRENT_USER?.sub !== undefined) {
        return resolve(CURRENT_USER.sub);
      }
      const interval = setInterval(() => {
        if (CURRENT_USER?.sub !== undefined) {
          clearInterval(interval);
          resolve(CURRENT_USER.sub);
        }
      }, 100);
    });
  }

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getCurrentUserId();
      currentUserIdRef.current = id;
      setIsReady(true);
    };
    fetchUserId();
  }, [CURRENT_USER]);

  const getUrlParams = () => ({
    userId: urlParams.get("userId"),
    productId: urlParams.get("productId"),
  });

  useEffect(() => {
    if (!isReady || !currentUserIdRef.current) {
      console.log("Waiting for user ID to be ready...", {
        isReady,
        currentUserId: currentUserIdRef.current,
      });
      return;
    }

    const socketInstance = io("https://api.kelishamiz.uz/chat", {
      transports: ["websocket", "polling"],
      withCredentials: true,
      query: { userId: currentUserIdRef.current },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      setConnectionStatus("connected");
      console.log("Connected to server with ID:", currentUserIdRef.current);
      socketInstance.emit("setOnlineStatus", currentUserIdRef.current);
      fetchChatRooms();
      const { userId, productId } = getUrlParams();
      if (userId && productId) {
        createOrGetChatRoom(productId, userId).then((chatRoom) => {
          if (chatRoom) console.log("Joined room:", chatRoom.id);
        });
      }
    });

    socketInstance.on("disconnect", (reason) => {
      setConnectionStatus("disconnected");
      console.error("Socket disconnected:", reason);
      if (reason !== "io client disconnect") {
        socketInstance.connect();
      }
    });

    socketInstance.on("connect_error", (error) => {
      setConnectionStatus("error");
      console.error("Socket connection error:", error.message);
    });

    socketInstance.on("newMessage", (socketMessage) => {
      console.log("Received new message:", socketMessage);
      const message = {
        id: socketMessage.id || Date.now(),
        content: socketMessage.message || socketMessage.content,
        createdAt: socketMessage.createdAt || new Date().toISOString(),
        senderId: socketMessage.senderId,
        senderUsername: socketMessage.senderUsername || "Unknown",
        status: "sent",
      };
      setMessages((prev) => {
        const filtered = prev.filter(
          (m) =>
            !(
              m.status === "sending" &&
              m.content === message.content &&
              m.senderId === message.senderId
            )
        );
        return [message, ...filtered];
      });
      if (Notification.permission === "granted") {
        new Notification(`New message from ${socketMessage.senderUsername}`, {
          body: socketMessage.message || socketMessage.content,
        });
      }
    });

    socketInstance.on("messageSent", (response) => {
      console.log("Message acknowledgment:", response);
      if (response.status === "success") {
        setMessages((prev) => {
          const newMessages = [...prev];
          for (let i = newMessages.length - 1; i >= 0; i--) {
            if (newMessages[i].status === "sending") {
              newMessages[i] = {
                ...newMessages[i],
                status: "sent",
                id: response.messageId || newMessages[i].id,
              };
              break;
            }
          }
          return newMessages;
        });
      } else if (response.status === "error") {
        setMessages((prev) => {
          const newMessages = [...prev];
          for (let i = newMessages.length - 1; i >= 0; i--) {
            if (newMessages[i].status === "sending") {
              newMessages.splice(i, 1);
              break;
            }
          }
          return newMessages;
        });
      }
    });

    socketInstance.on("userStatusChange", (data) => {
      const userId = data.userId;
      const isOnline = data.isOnline;
      setOnlineUsers((prev) => {
        if (isOnline) {
          return { ...prev, [userId]: true };
        } else {
          const newUsers = { ...prev };
          delete newUsers[userId];
          return newUsers;
        }
      });
      console.log(`User ${userId} is now ${isOnline ? "online" : "offline"}`);
    });

    socketInstance.on("onlineUsersList", (userIds) => {
      const newOnlineUsers = {};
      userIds.forEach((id) => {
        newOnlineUsers[id] = true;
      });
      setOnlineUsers(newOnlineUsers);
      console.log("Full online list updated:", newOnlineUsers);
    });

    socketInstance.on("roomOnlineUsers", (users) => {
      const newOnlineUsers = {};
      users.forEach((user) => {
        newOnlineUsers[user.userId] = user.isOnline ?? true;
      });
      setOnlineUsers(newOnlineUsers);
      console.log("Room online users updated:", newOnlineUsers);
    });

    socketInstance.on("typingIndicator", (data) => {
      const typingUserId = data.userId;
      const isTyping = data.isTyping ?? false;
      const username = data.username ?? "";

      if (typingUserId !== currentUserIdRef.current) {
        if (isTyping) {
          setTypingUsers((prev) => {
            if (prev.every((u) => u.userId !== typingUserId)) {
              return [...prev, TypingUser.create(typingUserId, username)];
            }
            return prev;
          });
          if (typingTimeoutRef.current[typingUserId]) {
            clearTimeout(typingTimeoutRef.current[typingUserId]);
          }
          typingTimeoutRef.current[typingUserId] = setTimeout(() => {
            setTypingUsers((prev) =>
              prev.filter((u) => u.userId !== typingUserId)
            );
            delete typingTimeoutRef.current[typingUserId];
          }, 3000);
        } else {
          setTypingUsers((prev) =>
            prev.filter((u) => u.userId !== typingUserId)
          );
          if (typingTimeoutRef.current[typingUserId]) {
            clearTimeout(typingTimeoutRef.current[typingUserId]);
            delete typingTimeoutRef.current[typingUserId];
          }
        }
      }
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
      socketInstance.off("newMessage");
      socketInstance.off("messageSent");
      socketInstance.off("userStatusChange");
      socketInstance.off("onlineUsersList");
      socketInstance.off("roomOnlineUsers");
      socketInstance.off("typingIndicator");
    };
  }, [isReady]);

  const startTyping = () => {
    if (socket && selectedChatRoom && !isTyping) {
      socket.emit("typingStarted", {
        chatRoomId: selectedChatRoom.id,
        userId: currentUserIdRef.current,
        username: CURRENT_USER?.username || "Foydalanuvchi",
      });
      setIsTyping(true);
    }
  };

  const stopTyping = () => {
    if (socket && selectedChatRoom && isTyping) {
      socket.emit("typingStopped", {
        chatRoomId: selectedChatRoom.id,
        userId: currentUserIdRef.current,
      });
      setIsTyping(false);
    }
  };

  const handleMessageInputChange = (e) => {
    const value = e.target.value;
    setMessageInput(value);
    if (value.length > 0 && !isTyping) {
      startTyping();
      if (typingTimeoutRef.current.currentUser) {
        clearTimeout(typingTimeoutRef.current.currentUser);
      }
      typingTimeoutRef.current.currentUser = setTimeout(() => {
        stopTyping();
        delete typingTimeoutRef.current.currentUser;
      }, 5000);
    } else if (value.length === 0 && isTyping) {
      stopTyping();
      if (typingTimeoutRef.current.currentUser) {
        clearTimeout(typingTimeoutRef.current.currentUser);
        delete typingTimeoutRef.current.currentUser;
      }
    }
  };

  const createOrGetChatRoom = async (productId, otherUserId) => {
    try {
      if (!currentUserIdRef.current) {
        console.error("Current user ID not found");
        return null;
      }
      const response = await api.post(
        "/chat/create-or-get",
        JSON.stringify({
          productId: parseInt(productId),
          participantIds: [
            parseInt(otherUserId),
            parseInt(currentUserIdRef.current),
          ],
        }),
        { headers: { "Content-Type": "application/json" } }
      );
      if (!response.data) throw new Error("Chat xonasi yaratishda xatolik");
      const chatRoom = await response.data?.content;
      await fetchChatRooms();
      setTimeout(() => {
        setChatRooms((prevChatRooms) => {
          const foundRoom = prevChatRooms.find(
            (room) => room.id === chatRoom.id
          );
          if (foundRoom && !selectedChatRoom) selectChatRoom(foundRoom);
          return prevChatRooms;
        });
      }, 500);
      return chatRoom;
    } catch (error) {
      console.error("Chat xonasi yaratishda xatolik:", error);
      return null;
    }
  };

  const fetchChatRooms = async () => {
    try {
      const response = await api.get("/chat/my-chats");
      const data = await response.data?.content;
      setChatRooms(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      setIsLoading(false);
    }
  };

  const fetchMessages = async (chatRoomId) => {
    try {
      const response = await api.get(`/chat/${chatRoomId}/messages`);
      const data = await response.data?.content;
      setMessages((prev) => {
        const existingIds = new Set(prev.map((msg) => msg.id));
        const newMessages = (data || []).filter(
          (msg) => !existingIds.has(msg.id)
        );
        return [...newMessages, ...prev];
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const selectChatRoom = (chatRoom) => {
    if (!chatRoom) return;
    if (selectedChatRoom && selectedChatRoom.id !== chatRoom.id) {
      socket?.emit("leaveRoom", selectedChatRoom.id);
    }
    setSelectedChatRoom(chatRoom);
    console.log("Joining room:", chatRoom.id);
    socket?.emit("joinRoom", chatRoom.id);
    setMessages([]);
    fetchMessages(chatRoom.id);
    setTypingUsers([]);
    setIsTyping(false);
    if (typingTimeoutRef.current.currentUser) {
      clearTimeout(typingTimeoutRef.current.currentUser);
      delete typingTimeoutRef.current.currentUser;
    }
  };

  const sendMessage = () => {
    const content = messageInput.trim();
    if (!content || !selectedChatRoom || !socket) return;
    if (isTyping) stopTyping();
    const optimisticMessage = {
      id: Date.now(),
      content,
      senderId: parseInt(currentUserIdRef.current),
      senderUsername: CURRENT_USER?.username || "Men",
      createdAt: new Date().toISOString(),
      status: "sending",
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setMessageInput("");
    socket.emit(
      "sendMessage",
      {
        chatRoomId: selectedChatRoom.id,
        senderId: parseInt(currentUserIdRef.current),
        message: content,
      },
      (response) => {
        console.log("Server response:", response);
      }
    );
  };

  const isUserOnline = (userId) => {
    return onlineUsers[userId] ?? false;
  };

  const filteredChatRooms = chatRooms.filter(
    (room) =>
      room.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.otherParticipant?.username
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, messages.length]);

  const formatChatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 24)
      return date.toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit",
      });
    else if (diffDays < 7)
      return diffDays < 2 ? "Kecha" : `${Math.floor(diffDays)} kun oldin`;
    else return date.toLocaleDateString("uz-UZ");
  };

  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case "connected":
        return {
          text: "Ulangan",
          color: "bg-green-500",
          animate: "animate-pulse",
        };
      case "connecting":
        return {
          text: "Ulanmoqda...",
          color: "bg-yellow-500",
          animate: "animate-pulse",
        };
      case "disconnected":
        return { text: "Ulanmagan", color: "bg-red-500", animate: "" };
      case "error":
        return { text: "Xatolik", color: "bg-red-500", animate: "" };
      default:
        return { text: "Noma'lum", color: "bg-gray-500", animate: "" };
    }
  };

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const connectionDisplay = getConnectionStatus();

  return (
    <div className="flex h-[80vh] bg-gray-100 font-sans p-6 space-x-4">
      <div className="flex-1 flex space-x-4">
        <div className="w-full md:w-80 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
          <div className="flex flex-col flex-1 overflow-y-auto">
            <div className="flex items-center text-sm font-medium border-b border-gray-200">
              <button className="flex-1 text-center py-3 border-b-2 border-teal-500 text-teal-600">
                All
              </button>
              <button className="flex-1 text-center py-3 text-gray-500 hover:text-gray-800">
                incoming
              </button>
              <button className="flex-1 text-center py-3 text-gray-500 hover:text-gray-800">
                upcoming
              </button>
            </div>
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 p-3 animate-pulse"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChatRooms.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                {searchQuery ? "Hech narsa topilmadi" : "Hali suhbat yo'q"}
              </div>
            ) : (
              filteredChatRooms.map((room) => {
                const isSelected = selectedChatRoom?.id === room.id;
                const lastMessageTime =
                  room.lastMessage?.createdAt || room.updatedAt;
                const isUserOnlineStatus = isUserOnline(
                  room.otherParticipant?.id
                );

                if (!isReady) return null;

                return (
                  <div
                    key={room.id}
                    onClick={() => selectChatRoom(room)}
                    className={`p-4 border-b border-gray-200 cursor-pointer transition-colors duration-200 ${
                      isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img
                            src={
                              room?.imageUrl
                                ? room?.imageUrl
                                : `https://ui-avatars.com/api/?name=${
                                    room.otherParticipant?.username || "U"
                                  }&background=random&color=fff&size=256`
                            }
                            alt={room.otherParticipant?.username || "User"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {isUserOnlineStatus && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {room.otherParticipant?.username || "Noma'lum"}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {formatChatTime(lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {room.lastMessage?.content || "Xabar yo'q"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area (Middle Panel) */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
          {selectedChatRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img
                        src={`https://ui-avatars.com/api/?name=${
                          selectedChatRoom.otherParticipant?.imageUrl || "U"
                        }&background=random&color=fff&size=256`}
                        alt={
                          selectedChatRoom.otherParticipant?.username || "User"
                        }
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {isUserOnline(selectedChatRoom.otherParticipant?.id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedChatRoom.otherParticipant?.username ||
                        "Noma'lum"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {isUserOnline(selectedChatRoom.otherParticipant?.id)
                        ? "Onlayn"
                        : "Offlayn"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => {
                  const isOwn =
                    message.senderId === parseInt(currentUserIdRef.current);
                  return (
                    <div
                      key={message.id || index}
                      className={`flex ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`rounded-xl px-4 py-2 max-w-sm shadow-sm ${
                          isOwn
                            ? "bg-teal-500 text-white rounded-tr-none"
                            : "bg-gray-200 text-gray-900 rounded-tl-none"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div
                          className={`mt-1 text-xs opacity-80 ${
                            isOwn
                              ? "text-teal-100 text-right"
                              : "text-gray-500 text-left"
                          }`}
                        >
                          <span>{formatTime(message.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <div className="flex justify-start">
                    <div className="max-w-xs px-4 py-2 rounded-xl bg-gray-200 shadow-sm rounded-tl-none">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {typingUsers.map((user) => user.username).join(", ")}{" "}
                          yozmoqda
                        </span>
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Xabar yozing..."
                    value={messageInput}
                    onChange={handleMessageInputChange}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") sendMessage();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                    className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Yuborish
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center shadow-md">
                  <ChatIcon />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Suhbatni tanlang
                </h3>
                <p className="text-gray-600 max-w-sm">
                  Xabar yuborish uchun chap tomondagi suhbatlardan birini
                  tanlang
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
