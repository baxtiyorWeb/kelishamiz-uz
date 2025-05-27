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
      }, 100); // Har 100ms da tekshiradi
    });
  }

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getCurrentUserId();
      currentUserIdRef.current = id;
      setIsReady(true); // messages renderingga tayyor
    };

    fetchUserId();
  }, [currentUserIdRef, isReady, CURRENT_USER]);

  // URL parametrlarini olish
  const getUrlParams = () => {
    return {
      userId: urlParams.get("userId"),
      productId: urlParams.get("productId"),
    };
  };

  // Socket connection
  useEffect(() => {
    const socketInstance = io("https://kelishamiz-backend.onrender.com", {
      transports: ["websocket", "polling"],
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      setConnectionStatus("connected");
      fetchChatRooms();

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

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Chat xonasi yaratish yoki topish
  const createOrGetChatRoom = async (productId, otherUserId) => {
    try {
      const response = await api.post(
        "/chat/create-or-get",
        JSON.stringify({
          productId: parseInt(productId),
          participantIds: [
            parseInt(otherUserId),
            parseInt(await getCurrentUserId()),
          ],
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // /
      if (!response.ok) {
        throw new Error("Chat xonasi yaratishda xatolik");
      }

      const chatRoom = await response.data?.content;
      console.log("Chat xonasi yaratildi yoki topildi:", chatRoom);

      // Chat rooms ro'yxatini yangilash va yaratilgan chat xonasini tanlash
      await fetchChatRooms();
      // Chat rooms yangilangandan keyin yaratilgan chat xonasini topish va tanlash
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
      //
      return chatRoom;
    } catch (error) {
      console.error("Chat xonasi yaratishda xatolik:", error);
      return null;
    }
  };

  // Fetch chat rooms
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

  // Fetch messages for selected chat room
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
  };

  const sendMessage = async () => {
    const content = messageInput.trim();
    if (!content || !selectedChatRoom || !socket) return;

    const optimisticMessage = {
      id: Date.now(),
      content: content,
      senderId: parseInt(await getCurrentUserId()),
      senderUsername: CURRENT_USER.username,
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setMessageInput("");

    socket.emit("sendMessage", {
      chatRoomId: selectedChatRoom.id,
      senderId: parseInt(await getCurrentUserId()),
      message: content,
    });
  };

  // Auto-scroll to bottom
  //   useEffect(() => {
  //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }, [messages]);

  // Filter chat rooms
  const filteredChatRooms = chatRooms.filter(
    (room) =>
      room.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.otherParticipant?.username
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date for chat list
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

  // Connection status
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

              console.log(room, "room");

              if (!isReady) return null; // Yoki loading indicator chiqaring

              return (
                <div
                  key={room.id}
                  onClick={() => selectChatRoom(room)}
                  className={`p-3 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-l-4 border-teal-500 bg-gradient-to-r from-teal-50 to-teal-100"
                      : "hover:bg-gray-50 border-b border-gray-100"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                        <span>
                          {room.otherParticipant?.username[0]?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {room.otherParticipant?.username || "Unknown User"}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatChatTime(lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {room.productName}
                      </p>
                      {room.lastMessage && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {room.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col bg-white">
        {!selectedChatRoom ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-teal-500"
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chat tanlang
              </h3>
              <p className="text-gray-500">
                Xabar almashishni boshlash uchun chap tarafdan chat tanlang
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-medium">
                      <span>
                        {selectedChatRoom.otherParticipant?.username[0]?.toUpperCase() ||
                          "U"}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      {selectedChatRoom.otherParticipant?.username ||
                        "Unknown User"}
                    </h2>
                    <p className="text-sm text-white/80">Onlayn</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </button>
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
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
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
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <p>Hali hech qanday xabar yo'q</p>
                    <p className="text-sm">Birinchi xabaringizni yuboring!</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const isCurrentUser =
                      message.senderId === currentUserIdRef.current;

                    const previousMessage = messages[index - 1];
                    const showAvatar =
                      !previousMessage ||
                      previousMessage.senderId !== message.senderId;

                    if (isCurrentUser) {
                      return (
                        <div
                          key={message.id}
                          className="flex justify-end w-full border-b border-gray-200 pb-2"
                        >
                          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl rounded-tr-md px-4 py-2 max-w-sm shadow-md">
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-end space-x-1 mt-1">
                              <span className="text-xs text-white/70">
                                {formatTime(message.createdAt)}
                              </span>
                              <span className="text-white/70">
                                {message.status === "sending" ? (
                                  <svg
                                    className="w-3 h-3 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-3 h-3"
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
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={message.id}
                        className="flex items-start space-x-2 max-w-xs"
                      >
                        {showAvatar && (
                          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                            <span>
                              {message.senderUsername[0]?.toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                        <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-2 max-w-sm shadow-sm">
                          <p className="text-gray-900 text-sm">
                            {message.content}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-3">
                <button className="p-2 text-gray-400 hover:text-teal-500 transition-colors">
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
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </button>
                <div className="flex-1 relative">
                  <textarea
                    placeholder="Xabar yozing..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    rows={1}
                    className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    style={{ maxHeight: "120px" }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className="p-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                >
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Product Sidebar */}
      {selectedChatRoom && (
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
          <div className="space-y-6">
            {/* Product Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Mahsulot haqida
                </h3>

                {selectedChatRoom.product?.images?.[imageIndex].url && (
                  <img
                    src={selectedChatRoom.product?.images?.[imageIndex].url}
                    alt={selectedChatRoom?.product?.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}

                <h4 className="font-medium text-gray-900 mb-2">
                  {selectedChatRoom?.product?.title}
                </h4>
                <p className="text-2xl font-bold text-teal-600 mb-2">
                  {selectedChatRoom?.product?.price}
                </p>

                {selectedChatRoom?.product?.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {selectedChatRoom?.product?.description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Holati:</span>
                    <span className="text-gray-900">
                      {selectedChatRoom?.product?.condition}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Joylashuv:</span>
                    <span className="text-gray-900">
                      {selectedChatRoom?.product?.location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">E'lon sanasi:</span>
                    <span className="text-gray-900">
                      {formatChatTime(selectedChatRoom?.product?.createdAt)}
                    </span>
                  </div>
                </div>

                <button className="w-full mt-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-2 px-4 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 flex items-center justify-center space-x-2">
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  <span>E'lonni ko'rish</span>
                </button>
              </div>
            </div>

            {/* Seller Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Sotuvchi</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                    <span>
                      {selectedChatRoom?.otherParticipant?.username[0]?.toUpperCase() ||
                        "U"}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {selectedChatRoom.otherParticipant?.username ||
                        "Unknown User"}
                    </h4>
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-gray-500">
                        5.0 (24 baho)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ro'yxatdan o'tgan:</span>
                    <span className="text-gray-900">2022-yil</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sotilgan:</span>
                    <span className="text-gray-900">12 ta mahsulot</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Javob berish:</span>
                    <span className="text-gray-900">~ 2 soat</span>
                  </div>
                </div>

                <button className="w-full mt-4 border border-teal-500 text-teal-600 py-2 px-4 rounded-lg hover:bg-teal-50 transition-colors">
                  Profilni ko'rish
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Tezkor amallar
                </h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center space-x-2 text-gray-700 hover:bg-gray-50 py-2 px-3 rounded-lg transition-colors">
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
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    <span>Saqlab qo'yish</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 text-gray-700 hover:bg-gray-50 py-2 px-3 rounded-lg transition-colors">
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
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    <span>Ulashish</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 text-red-600 hover:bg-red-50 py-2 px-3 rounded-lg transition-colors">
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
                        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6v1a2 2 0 01-2 2H3.5l-.5-.5z"
                      />
                    </svg>
                    <span>Shikoyat qilish</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
