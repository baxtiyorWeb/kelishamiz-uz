"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import api from "../../config/auth/api";
import useGetUser from "../../hooks/services/useGetUser";
import useGetOneQuery from "../../hooks/api/useGetOneQuery";
import KEYS from "../../export/keys";
import URLS from "../../export/urls";
import { get, isNull } from "lodash";

const TypingUser = {
  create: (userId, username) => ({ userId, username }),
};

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const getUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      userId: urlParams.get("userId"), // ?userId=123
      productId: urlParams.get("productId"), // ?productId=456
    };
  };

  async function getCurrentUserId() {
    return new Promise((resolve, reject) => {
      if (CURRENT_USER?.sub !== undefined) {
        return resolve(CURRENT_USER.sub);
      }
      const interval = setInterval(() => {
        if (CURRENT_USER?.sub !== undefined) {
          clearInterval(interval);
          resolve(CURRENT_USER.sub);
        }
      }, 0);
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error("User ID timeout"));
      }, 0);
    });
  }

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await getCurrentUserId();
        if (!id) return; // foydalanuvchi topilmasa ulanmaymiz
        currentUserIdRef.current = id;
        setIsReady(true);
      } catch (error) {
        console.error("Failed to fetch user ID:", error);
      }
    };
    fetchUserId();
  }, [CURRENT_USER?.sub]);

  useEffect(() => {
    if (!isReady || !currentUserIdRef.current || socket) return;

    const initSocket = async () => {
      const socketInstance = io("https://api.kelishamiz.uz/chat", {
        transports: ["websocket", "polling"],
        withCredentials: true,
        query: { userId: String(currentUserIdRef.current) },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      setSocket(socketInstance);

      // --- Socket eventlar ---
      socketInstance.on("connect", () => {
        setConnectionStatus("connected");
        console.log("Connected to server with ID:", currentUserIdRef.current);
        socketInstance.emit("setOnlineStatus", currentUserIdRef.current);
        fetchChatRooms();
        const { userId, productId } = getUrlParams();
        if (userId && productId) {
          createOrGetChatRoom(productId, userId).then((chatRoom) => {
            if (chatRoom) {
              console.log("Joined room:", chatRoom.id);
              selectChatRoom(chatRoom);
            }
          });
        }
      });

      socketInstance.on("disconnect", (reason) => {
        setConnectionStatus("disconnected");
        console.error("Socket disconnected:", reason);
        if (reason !== "io client disconnect") socketInstance.connect();
      });

      socketInstance.on("connect_error", (error) => {
        setConnectionStatus("error");
        console.error("Socket connection error:", error.message);
      });

      socketInstance.on("newMessage", (socketMessage) => {
        console.log("Received new message:", socketMessage);
        const message = {
          id: socketMessage.id,
          content: socketMessage.content,
          createdAt: socketMessage.createdAt || new Date().toISOString(),
          senderId: socketMessage.senderId,
          senderUsername: socketMessage.senderUsername || "Unknown",
          read: socketMessage.read,
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
          return [...filtered, message];
        });
        if (
          Notification.permission === "granted" &&
          message.senderId !== currentUserIdRef.current
        ) {
          new Notification(`New message from ${socketMessage.senderUsername}`, {
            body: socketMessage.content,
          });
        }
      });

      socketInstance.on("messageSent", (response) => {
        if (response.status === "success") {
          setMessages((prev) =>
            prev.map((m, i) =>
              i === prev.length - 1 && m.status === "sending"
                ? { ...m, status: "sent", id: response.messageId || m.id }
                : m
            )
          );
        } else if (response.status === "error") {
          setMessages((prev) => prev.slice(0, -1));
        }
      });

      socketInstance.on("userStatusChange", (data) => {
        setOnlineUsers((prev) => ({ ...prev, [data.userId]: data.isOnline }));
      });

      socketInstance.on("onlineUsersList", (userIds) => {
        const newOnlineUsers = {};
        userIds.forEach((id) => (newOnlineUsers[id] = true));
        setOnlineUsers(newOnlineUsers);
      });

      socketInstance.on("roomOnlineUsers", (users) => {
        const newOnlineUsers = {};
        users.forEach(
          (user) => (newOnlineUsers[user.userId] = user.isOnline ?? true)
        );
        setOnlineUsers((prev) => ({ ...prev, ...newOnlineUsers }));
      });

      socketInstance.on("typingIndicator", (data) => {
        const { userId: typingUserId, isTyping, username } = data;
        if (typingUserId !== currentUserIdRef.current) {
          if (isTyping) {
            setTypingUsers((prev) => {
              if (!prev.some((u) => u.userId === typingUserId)) {
                return [...prev, { userId: typingUserId, username }];
              }
              return prev;
            });
            clearTimeout(typingTimeoutRef.current[typingUserId]);
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
            clearTimeout(typingTimeoutRef.current[typingUserId]);
            delete typingTimeoutRef.current[typingUserId];
          }
        }
      });

      socketInstance.on("messageRead", (data) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === data.messageId ? { ...m, read: true } : m))
        );
      });

      socketInstance.on("messageDeleted", (data) => {
        setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
      });

      socketInstance.on("chatRoomDeleted", (data) => {
        setChatRooms((prev) =>
          prev.filter((room) => room.id !== data.chatRoomId)
        );
        if (selectedChatRoom?.id === data.chatRoomId) {
          setSelectedChatRoom(null);
          setMessages([]);
        }
      });

      // --- Cleanup ---
      return () => {
        socketInstance.disconnect();
        socketInstance.off();
      };
    };

    initSocket();
  }, [CURRENT_USER?.sub, socket, isReady]);

  const startTyping = () => {
    if (socket && selectedChatRoom && !isTyping) {
      socket.emit("typingStarted", {
        chatRoomId: selectedChatRoom.id.toString(),
        userId: currentUserIdRef.current,
        username: CURRENT_USER?.username || "Foydalanuvchi",
      });
      setIsTyping(true);
    }
  };

  const stopTyping = () => {
    if (socket && selectedChatRoom && isTyping) {
      socket.emit("typingStopped", {
        chatRoomId: selectedChatRoom.id.toString(),
        userId: currentUserIdRef.current,
      });
      setIsTyping(false);
    }
  };

  const handleMessageInputChange = (e) => {
    const value = e.target.value;
    setMessageInput(value);
    if (value.trim().length > 0 && !isTyping) {
      startTyping();
      clearTimeout(typingTimeoutRef.current.currentUser);
      typingTimeoutRef.current.currentUser = setTimeout(() => {
        stopTyping();
        delete typingTimeoutRef.current.currentUser;
      }, 5000);
    } else if (value.trim().length === 0 && isTyping) {
      stopTyping();
      clearTimeout(typingTimeoutRef.current.currentUser);
      delete typingTimeoutRef.current.currentUser;
    }
  };

  const createOrGetChatRoom = async (productId, otherUserId) => {
    try {
      if (!currentUserIdRef.current) return null;
      const response = await api.post(
        "/chat/create-or-get",
        {
          productId: parseInt(productId),
          participantIds: [
            parseInt(otherUserId),
            parseInt(currentUserIdRef.current),
          ],
        },
        { headers: { "Content-Type": "application/json" } }
      );
      const chatRoom = response.data?.content;
      if (chatRoom) {
        await fetchChatRooms();
        return chatRoom;
      }
    } catch (error) {
      console.error("Error creating/getting chat room:", error);
      return null;
    }
  };

  const fetchChatRooms = async () => {
    try {
      const response = await api.get("/chat/my-chats");
      setChatRooms(response.data?.content || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      setIsLoading(false);
    }
  };

  const fetchMessages = async (chatRoomId) => {
    try {
      const response = await api.get(`/chat/${chatRoomId}/messages`);
      setMessages(response.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const selectChatRoom = (chatRoom) => {
    if (!chatRoom) return;
    if (selectedChatRoom && selectedChatRoom.id !== chatRoom.id) {
      socket?.emit("leaveRoom", selectedChatRoom.id.toString());
    }
    setSelectedChatRoom(chatRoom);
    socket?.emit("joinRoom", chatRoom.id.toString());
    setMessages([]);
    fetchMessages(chatRoom.id);
    setTypingUsers([]);
    setIsTyping(false);
    clearTimeout(typingTimeoutRef.current.currentUser);
    delete typingTimeoutRef.current.currentUser;
    setIsSidebarOpen(false);
  };

  const sendMessage = () => {
    const content = messageInput.trim();
    if (!content || !selectedChatRoom || !socket) return;
    if (isTyping) stopTyping();
    const optimisticMessage = {
      id: Date.now().toString(),
      content,
      senderId: currentUserIdRef.current,
      senderUsername: CURRENT_USER?.username || "Men",
      createdAt: new Date().toISOString(),
      read: false,
      status: "sending",
    };
    setMessages((prevMessages) => {
      const safePrev = Array.isArray(prevMessages) ? prevMessages : [];
      return [...safePrev, optimisticMessage];
    });

    setMessageInput("");
    socket.emit("sendMessage", {
      chatRoomId: selectedChatRoom.id,
      senderId: currentUserIdRef.current,
      message: content,
    });
  };

  const deleteMessage = (messageId) => {
    if (socket) {
      socket.emit("deleteMessage", {
        messageId,
        userId: currentUserIdRef.current,
      });
    }
  };

  const deleteChatRoom = (chatRoomId) => {
    if (socket) {
      socket.emit("deleteChatRoom", {
        chatRoomId,
        userId: currentUserIdRef.current,
      });
    }
  };

  const isUserOnline = (userId) => !!onlineUsers[userId];

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

  const formatChatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 24) return formatTime(dateString);
    if (diffDays < 7)
      return diffDays < 2 ? "Kecha" : `${Math.floor(diffDays)} kun oldin`;
    return date.toLocaleDateString("uz-UZ");
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
    <div className="min-h-screen bg-gray-100 p-0 md:p-6 font-sans">
      <style jsx global>{`
        .bg-primary-400 {
          background-color: #c060f5;
        }
        .text-primary-400 {
          color: #c060f5;
        }
        .focus:ring-primary-400:focus {
          --tw-ring-color: #c060f5;
        }
        .border-primary-400 {
          border-color: #c060f5;
        }
        .bg-primary-300 {
          background-color: #d080ff;
        }
        .text-primary-300 {
          color: #d080ff;
        }
        .hover\\:bg-primary-500:hover {
          background-color: #a040e0;
        } /* Bir oz to'qroq rang */
        .bg-primary-50 {
          background-color: #f8f0ff;
        } /* Ochildiroq fon rang */
        .text-primary-100 {
          color: #e8cfff;
        } /* Xabardagi kichik yozuvlar uchun */
      `}</style>

      <div className="flex fixed w-full h-full md:w-[80dvw] md:h-[90vh] md:max-h-[800px] md:relative md:mx-auto flex-col md:flex-row shadow-2xl rounded-xl overflow-hidden">
        {/* Mobile Sidebar Toggle Button (Only visible on mobile) */}
        <button
          className="md:hidden p-4 bg-primary-400 text-white fixed top-0 left-0 z-50 w-full flex items-center shadow-lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <svg
            className="w-6 h-6 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span className="font-semibold">
            {selectedChatRoom?.otherParticipant?.username || "Suhbatlar"}
          </span>
        </button>

        {/* Sidebar (Chat List) */}
        <div
          className={`fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-lg transform md:transform-none md:static md:flex md:flex-col z-40 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:w-80 md:h-full`}
        >
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-gray-50"
            />
          </div>
          <div className="px-4 py-2">
           
          </div>
          <div className="flex border-b border-gray-200">
            <button className="flex-1 py-3 text-sm font-medium text-center text-primary-400 border-b-2 border-primary-400">
              All
            </button>
            <button className="flex-1 py-3 text-sm font-medium text-center text-gray-500 hover:text-gray-800">
              Incoming
            </button>
            <button className="flex-1 py-3 text-sm font-medium text-center text-gray-500 hover:text-gray-800">
              Upcoming
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {/* Simplified Loading Skeleton */}
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

                return (
                  <div
                    key={room.id}
                    onClick={() => selectChatRoom(room)}
                    className={`p-4 border-b border-gray-200 cursor-pointer transition-colors duration-200 ${
                      isSelected
                        ? "bg-primary-50 border-r-4 border-primary-400"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img
                            src={`https://ui-avatars.com/api/?name=${
                              room.otherParticipant?.username || "U"
                            }&background=C060F5&color=fff&size=256`}
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
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatChatTime(lastMessageTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500 truncate">
                            {room.lastMessage?.content || "Xabar yo'q"}
                          </p>
                          {room.unreadCount > 0 && (
                            <span className="bg-primary-400 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ml-2">
                              {room.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden mt-14 md:mt-0">
          {selectedChatRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-4 shadow-sm flex-shrink-0">
                <button
                  className="md:hidden text-gray-600"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={`https://ui-avatars.com/api/?name=${
                        selectedChatRoom.otherParticipant?.username || "U"
                      }&background=C060F5&color=fff&size=256`}
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
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {selectedChatRoom.otherParticipant?.username || "Noma'lum"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {isUserOnline(selectedChatRoom.otherParticipant?.id)
                      ? "Onlayn"
                      : "Offlayn"}
                  </p>
                </div>
                <button
                  onClick={() => deleteChatRoom(selectedChatRoom.id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
                {messages?.content?.map((message) => {
                  const isOwn = message.senderId === currentUserIdRef.current;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`rounded-xl p-3 max-w-[85%] sm:max-w-[70%] shadow-md transition-all duration-200 ${
                          isOwn
                            ? "bg-primary-400 text-white rounded-br-none"
                            : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
                        }`}
                      >
                        <p className="text-sm break-words whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <div
                          className={`mt-1 flex items-center justify-end text-xs ${
                            isOwn
                              ? "text-primary-100" // O'zingizning xabaringiz vaqti
                              : "text-gray-500"
                          }`}
                        >
                          <span>{formatTime(message.createdAt)}</span>
                          {isOwn && (
                            <div className="ml-2 flex items-center space-x-1">
                              {message.status === "sending" ? (
                                <svg
                                  className="w-4 h-4 inline-block animate-spin"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l4 4" // Kutilmoqda (soat)
                                  />
                                </svg>
                              ) : message.read ? (
                                <svg
                                  className="w-4 h-4 inline-block text-primary-300" // O'qilgan (ikki belgi - ochroq binafsha)
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-4 4"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-4 h-4 inline-block" // Yetkazilgan (bitta belgi)
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                              <button
                                onClick={() => deleteMessage(message.id)}
                                className="text-primary-100 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                title="Xabarni o'chirish"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <div className="flex justify-start">
                    <div className="max-w-xs p-3 rounded-xl bg-white shadow-sm border border-gray-200 rounded-bl-none">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {typingUsers.map((user) => user.username).join(", ")}{" "}
                          yozmoqda
                        </span>
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
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
              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Xabar yozing..."
                    value={messageInput}
                    onChange={handleMessageInputChange}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-400 bg-gray-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                    className="p-3 bg-primary-400 text-white rounded-full hover:bg-primary-500 disabled:opacity-50 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Empty Chat State
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-primary-300 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <ChatIcon />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Suhbatni tanlang 💬
                </h3>
                <p className="text-gray-600 max-w-sm">
                  Xabar yuborish uchun chap tomondagi suhbatlardan birini
                  tanlang.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
