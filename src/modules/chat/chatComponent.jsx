import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import api from "../../config/auth/api";
import useGetUser from "../../hooks/services/useGetUser";
import useGetOneQuery from "../../hooks/api/useGetOneQuery";
import KEYS from "../../export/keys";
import URLS from "../../export/urls";
import { get, isNull } from "lodash";

export default function ChatPage() {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Typing va Online Status uchun qo'shilgan state'lar
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const messagesEndRef = useRef(null);
  const urlParams = new URLSearchParams(window.location.search);
  const CURRENT_USER = useGetUser();
  const currentUserIdRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const { data, isLoading: productLoading } = useGetOneQuery({
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
  }, [currentUserIdRef, isReady, CURRENT_USER]);

  const getUrlParams = () => {
    return {
      userId: urlParams.get("userId"),
      productId: urlParams.get("productId"),
    };
  };

  // http://localhost:3030
  // https://api.kelishamiz.uz
  useEffect(() => {
    const socketInstance = io("https://api.kelishamiz.uz", {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      setConnectionStatus("connected");
      fetchChatRooms();

      // Online status o'rnatish
      if (currentUserIdRef.current) {
        socketInstance.emit("setOnlineStatus", currentUserIdRef.current);
      }

      const { userId, productId } = getUrlParams();
      if (userId && productId) {
        console.log("URL dan parametrlar topildi:", { userId, productId });
        setTimeout(() => {
          createOrGetChatRoom(productId, userId);
        }, 500);
      }
    });

    socketInstance.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socketInstance.on("connect_error", () => {
      setConnectionStatus("error");
    });

    socketInstance.on("newMessage", (socketMessage) => {
      const message = {
        id: socketMessage.id,
        content: socketMessage.content,
        createdAt: socketMessage.createdAt,
        senderId: socketMessage.senderId,
        senderUsername: socketMessage.senderUsername,
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
    });

    socketInstance.on("messageSent", (response) => {
      if (response.status === "success") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.status === "sending" && msg.id === response.messageId
              ? { ...msg, status: "sent" }
              : msg
          )
        );
      } else if (response.status === "error") {
        setMessages((prev) => prev.filter((msg) => msg.status !== "sending"));
      }
    });

    // Typing Indicator listener
    socketInstance.on("typingIndicator", (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => {
          const exists = prev.find((user) => user.userId === data.userId);
          if (!exists) {
            return [...prev, { userId: data.userId, username: data.username }];
          }
          return prev;
        });
      } else {
        setTypingUsers((prev) =>
          prev.filter((user) => user.userId !== data.userId)
        );
      }
    });

    // User Status Change listener
    socketInstance.on("userStatusChange", (data) => {
      if (data.isOnline) {
        setOnlineUsers((prev) => [
          ...prev.filter((id) => id !== data.userId),
          data.userId,
        ]);
      } else {
        setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
      }
    });

    // Online Users List listener
    socketInstance.on("onlineUsersList", (userIds) => {
      setOnlineUsers(userIds);
    });

    // Room Online Users listener
    socketInstance.on("roomOnlineUsers", (users) => {
      const userIds = users.map((user) => user.userId);
      setOnlineUsers(userIds);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Typing start function
  const startTyping = () => {
    if (socket && selectedChatRoom && !isTyping) {
      socket.emit("typingStarted", {
        chatRoomId: selectedChatRoom.id,
        userId: currentUserIdRef.current,
        username: CURRENT_USER.username || "Foydalanuvchi",
      });
      setIsTyping(true);
    }
  };

  // Typing stop function
  const stopTyping = () => {
    if (socket && selectedChatRoom && isTyping) {
      socket.emit("typingStopped", {
        chatRoomId: selectedChatRoom.id,
        userId: currentUserIdRef.current,
      });
      setIsTyping(false);
    }
  };

  // Message input change handler with typing indicator
  const handleMessageInputChange = (e) => {
    const value = e.target.value;
    setMessageInput(value);

    if (value.length > 0 && !isTyping) {
      startTyping();

      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      const timeout = setTimeout(() => {
        stopTyping();
      }, 2000);

      setTypingTimeout(timeout);
    } else if (value.length === 0 && isTyping) {
      stopTyping();
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    }
  };

  const createOrGetChatRoom = async (productId, otherUserId) => {
    try {
      const response = await api.post(
        "/chat/create-or-get",
        JSON.stringify({
          productId: parseInt(productId),
          participantIds: [
            parseInt(otherUserId),
            parseInt(currentUserIdRef.current),
          ],
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data) {
        throw new Error("Chat xonasi yaratishda xatolik");
      }

      const chatRoom = await response.data?.content;
      console.log("Chat xonasi yaratildi yoki topildi:", chatRoom);

      await fetchChatRooms();
      setTimeout(() => {
        setChatRooms((prevChatRooms) => {
          const foundRoom = prevChatRooms.find(
            (room) => room.id === chatRoom.id
          );
          if (foundRoom && !selectedChatRoom) {
            selectChatRoom(foundRoom);
          }
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
      setChatRooms(data);
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
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const selectChatRoom = (chatRoom) => {
    if (selectedChatRoom && selectedChatRoom.id !== chatRoom.id) {
      socket?.emit("leaveRoom", selectedChatRoom.id);
    }

    setSelectedChatRoom(chatRoom);
    socket?.emit("joinRoom", chatRoom.id);
    setMessages([]);
    fetchMessages(chatRoom.id);

    // Typing state ni reset qilish
    setTypingUsers([]);
    setIsTyping(false);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  };

  const sendMessage = async () => {
    const content = messageInput.trim();
    if (!content || !selectedChatRoom || !socket) return;

    // Typing ni to'xtatish
    if (isTyping) {
      stopTyping();
    }

    const optimisticMessage = {
      id: Date.now(),
      content: content,
      senderId: parseInt(currentUserIdRef.current),
      senderUsername: CURRENT_USER.username,
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setMessageInput("");

    socket.emit("sendMessage", {
      chatRoomId: selectedChatRoom.id,
      senderId: parseInt(currentUserIdRef.current),
      message: content,
    });
  };

  const filteredChatRooms = chatRooms.filter(
    (room) =>
      room.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.otherParticipant?.username
        .toLowerCase()
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
  }, [messages]);

  const formatChatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 24) {
      return date.toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays < 7) {
      return diffDays < 2 ? "Kecha" : `${Math.floor(diffDays)} kun oldin`;
    } else {
      return date.toLocaleDateString("uz-UZ");
    }
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

  const connectionDisplay = getConnectionStatus();

  return (
    <div className="flex h-[80vh] bg-gray-50">
      {/* Chat Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Habarlar</h1>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div
                  className={`w-2 h-2 rounded-full ${connectionDisplay.color} ${connectionDisplay.animate}`}
                ></div>
                <span className="text-xs text-white/80">
                  {connectionDisplay.text}
                </span>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30"
            />
          </div>
        </div>

        {/* Chat Rooms List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChatRooms.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery
                ? "Hech narsa topilmadi"
                : "Hali hech qanday chat yo'q"}
            </div>
          ) : (
            filteredChatRooms.map((room) => {
              const isSelected = selectedChatRoom?.id === room.id;
              const lastMessageTime =
                room.lastMessage?.createdAt || room.updatedAt;
              const isUserOnline = onlineUsers.includes(
                room.otherParticipant?.id
              );

              if (!isReady) return null;

              return (
                <div
                  key={room.id}
                  onClick={() => selectChatRoom(room)}
                  className={`p-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                    isSelected ? "bg-teal-50 border-teal-200" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {room.otherParticipant?.username
                          ?.charAt(0)
                          .toUpperCase() || "?"}
                      </div>
                      {/* Online indicator */}
                      {isUserOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {room.otherParticipant?.username ||
                            "Noma'lum foydalanuvchi"}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatChatTime(lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {room.productName}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {room.lastMessage?.content || "Hali xabar yo'q"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChatRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedChatRoom.otherParticipant?.username
                      ?.charAt(0)
                      .toUpperCase() || "?"}
                  </div>
                  {/* Online indicator in header */}
                  {onlineUsers.includes(
                    selectedChatRoom.otherParticipant?.id
                  ) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedChatRoom.otherParticipant?.username ||
                      "Noma'lum foydalanuvchi"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedChatRoom.productName}
                  </p>
                  {/* Online status text */}
                  <p className="text-xs text-gray-500">
                    {onlineUsers.includes(selectedChatRoom.otherParticipant?.id)
                      ? "Onlayn"
                      : "Offlayn"}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwn =
                  message.senderId === parseInt(currentUserIdRef.current);
                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`bg-gradient-to-r   rounded-2xl  px-4 py-2 max-w-sm shadow-md ${
                        isOwn
                          ? "from-teal-500 to-teal-600 text-white rounded-tr-md"
                          : "bg-gray-200 text-gray-900 rounded-tl-md"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {formatTime(message.createdAt)}
                        </span>
                        {isOwn && (
                          <span className="text-xs opacity-70">
                            {message.status === "sending"
                              ? "Yuborilmoqda..."
                              : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-600">
                        {typingUsers.map((user) => user.username).join(", ")}{" "}
                        yozmoqda
                      </span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
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
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Xabar yozing..."
                  value={messageInput}
                  onChange={handleMessageInputChange}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Yuborish
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-500"
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
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chat tanlang
              </h3>
              <p className="text-gray-600">
                Xabar yuborish uchun chap tomondagi chatlardan birini tanlang
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
