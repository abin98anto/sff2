import { useEffect, useRef, useState } from "react";
import "./ChatBubble.scss";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { IUser } from "../../../entities/IUser";
import ICourse from "../../../entities/ICourse";
import Loading from "../Loading/Loading";
import IMessage from "../../../entities/IMessage";
import axiosInstance from "../../../shared/config/axiosConfig";
import API from "../../../shared/constants/API";
import comments from "../../../shared/constants/comments";
import { socket } from "../../../shared/config/socketConfig";
import Swal from "sweetalert2";

interface IChat {
  _id: string;
  tutorId: IUser;
  studentId: IUser;
  courseId: ICourse;
  messages: string[];
  lastMessage?: IMessage | null;
  unreadMessageCount?: number;
}

interface messageReadData {
  messageIds: string[];
  chatId: string;
  receiverId: string;
  senderId: string;
}

interface videCallData {
  roomID: string;
  userId: string;
  studentId: string;
}

const ChatBubble2 = () => {
  const { userInfo } = useAppSelector((state) => state.user);
  const userId = userInfo?._id;
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [allChats, setAllChats] = useState<IChat[]>([]);
  const [activeChat, setActiveChat] = useState<IChat | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);

  const placeholderRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleBubbleClick = () => {
    setIsLoading(true);
    if (!userId || allChats.length === 0) {
      setShowPlaceholder(true);
    }
    const newExpandedState = !isExpanded;
    if (newExpandedState) {
      fetchChats();
    } else {
      setActiveChat(null);
    }
    setIsExpanded(!isExpanded);
    setIsLoading(false);
  };

  // closing chat bubble.
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutside =
        (chatRef.current &&
          !chatRef.current.contains(event.target as Node) &&
          !document
            .querySelector(".chat-bubble-minimized")
            ?.contains(event.target as Node)) ||
        (placeholderRef.current &&
          !placeholderRef.current.contains(event.target as Node));

      if (clickedOutside) {
        setIsExpanded(false);
        setActiveChat(null);
        setShowPlaceholder(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const fetchChats = async () => {
    try {
      if (!userId) return;
      const response = await axiosInstance.get(API.CHAT_LIST + userId);
      setAllChats(response.data.data);
      const totalCount = allChats.reduce((total, chat) => {
        if (
          chat.unreadMessageCount &&
          chat.lastMessage &&
          chat.lastMessage.receiverId === userId
        ) {
          return total + chat.unreadMessageCount;
        }
        return total;
      }, 0);

      setTotalUnreadCount(totalCount);
    } catch (error) {
      console.error(`Failed to fetch unread count for chat`, error);
    }
  };

  const fetchMessages = async (chatId: string): Promise<IMessage[]> => {
    try {
      setIsLoading(true);
      if (!userId) return [];

      const response = await axiosInstance.get(API.CHAT_MESSAGES + chatId);
      setMessages((prevMessages) => {
        console.log("simply log in fetch messages", prevMessages[0]?.senderId);
        return response.data.data;
      });
      return response.data.data;
    } catch (error) {
      console.log(comments.MSG_FETCH_FAIL, error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatClick = async (chat: IChat) => {
    setActiveChat(chat);
  };
  useEffect(() => {
    const fetchChatData = async () => {
      if (activeChat) {
        const fetchedMessages = await fetchMessages(activeChat._id);

        if (fetchedMessages) {
          const unReadMessageIds = fetchedMessages
            .filter(
              (msg: IMessage) =>
                msg.receiverId === userId &&
                msg.senderId !== userId &&
                !msg.isRead
            )
            .map((msg: IMessage) => msg._id as string);

          if (unReadMessageIds.length > 0) {
            setTotalUnreadCount((prev) => prev - unReadMessageIds.length);
            markMessagesAsRead(unReadMessageIds);
            clearUnreadMessageCount(activeChat._id);
          }

          scrollToBottom();
        }
      }
    };

    fetchChatData();
  }, [activeChat]);

  const formatDate = (timestamp: Date) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.log("error formatting date", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      if (newMessage.trim() && userId && activeChat) {
        let receiverId =
          activeChat.tutorId._id === userId
            ? activeChat.studentId._id
            : activeChat.tutorId._id;
        receiverId !== undefined ? receiverId : (receiverId = "");

        const messageToSent: IMessage = {
          chatId: activeChat._id,
          senderId: userId,
          receiverId,
          content: newMessage,
          contentType: "text",
          isRead: false,
          createdAt: new Date(),
        };

        socket.emit("send-message", messageToSent);
        await axiosInstance.post(API.MSG_SENT, messageToSent);
        setNewMessage("");
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.log("error sending message", error);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const markMessagesAsRead = async (messageIds: string[]) => {
    try {
      if (messageIds.length === 0) return;

      await axiosInstance.put("/chat/mark-as-read", {
        messageIds,
      });

      setMessages((prevMessage) =>
        prevMessage.map((msg) =>
          messageIds.includes(msg._id as string)
            ? { ...msg, isRead: true }
            : msg
        )
      );

      let senderId =
        activeChat?.tutorId._id === userId
          ? activeChat?.studentId._id
          : activeChat?.tutorId._id;
      senderId !== undefined ? senderId : (senderId = "");

      socket.emit("msg-read", {
        messageIds,
        chatId: activeChat?._id,
        receiverId: userId,
        senderId,
      });

      clearUnreadMessageCount(activeChat?._id as string);
    } catch (error) {
      console.log("error marking message as read", error);
    }
  };

  const getLastMessage = (chat: IChat) => {
    try {
      if (!chat || !chat.lastMessage) {
        return "";
      } else {
        const msgPrefix = chat.lastMessage.senderId === userId ? "You: " : "";
        return msgPrefix + chat.lastMessage.content.substring(0, 10);
      }
    } catch (error) {
      console.log("error fetching last message", error);
      return "";
    }
  };

  const handleNewMessage = async (message: IMessage) => {
    try {
      const shouldIncrementCount = message.receiverId === userId;
      const shouldShowNotification =
        !isExpanded && message.receiverId === userId;

      setAllChats((prevChats) => {
        const chatToUpdate = prevChats.find(
          (chat) => chat._id === message.chatId
        );

        if (chatToUpdate) {
          const otherChats = prevChats.filter(
            (chat) => chat._id !== message.chatId
          );

          const updatedChat = { ...chatToUpdate };

          if (shouldIncrementCount) {
            updatedChat.unreadMessageCount =
              (updatedChat.unreadMessageCount || 0) + 1;
          }

          updatedChat.lastMessage = message;

          return [...otherChats, updatedChat].sort(
            (a, b) =>
              new Date(b.lastMessage?.createdAt || 0).getTime() -
              new Date(a.lastMessage?.createdAt || 0).getTime()
          );
        }
        return prevChats;
      });

      if (shouldIncrementCount) {
        setTotalUnreadCount((prev) => prev + 1);
      }

      if (shouldShowNotification) {
        let senderName = "New message";
        const chat = allChats.find((chat) => chat._id === message.chatId);
        if (chat) {
          senderName =
            message.senderId === chat.tutorId._id
              ? chat.tutorId.name
              : chat.studentId.name;
        }

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: senderName,
          text: message.content,
          showConfirmButton: false,
          timer: 6000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", () => Swal.stopTimer());
            toast.addEventListener("mouseleave", () => Swal.resumeTimer());
            toast.addEventListener("click", () => {
              Swal.close();
              setIsExpanded(true);
              const relevantChat = allChats.find(
                (chat) => chat._id === message.chatId
              );
              if (relevantChat) {
                handleChatClick(relevantChat);
              }
            });
          },
        });
      }

      if (activeChat?._id === message.chatId) {
        setMessages((prev) => [...prev, message]);

        if (message.senderId !== userId) {
          markMessagesAsRead([message._id as string]);
        }

        if (shouldIncrementCount) {
          markMessagesAsRead([message._id as string]);
          setTotalUnreadCount((prev) => prev - 1);
        }
      }
    } catch (error) {
      console.log("error handling new message", error);
    }
  };
  useEffect(() => {
    if (!isExpanded) {
      fetchInitialUnreadCount();
    }
  }, [isExpanded]);

  const clearUnreadMessageCount = async (chatId: string) => {
    try {
      setAllChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat._id === chatId) {
            const unreadReceived =
              chat.lastMessage && chat.lastMessage.receiverId === userId
                ? chat.unreadMessageCount || 0
                : 0;
            setTotalUnreadCount((prev) => prev - unreadReceived);

            return {
              ...chat,
              unreadMessageCount: 0,
            };
          }
          return chat;
        })
      );

      await axiosInstance.post("/chat/clear-unread-count", {
        chatId,
      });
    } catch (error) {
      console.log("error clearing unread message count", error);
    }
  };

  const renderMessageContent = (message: IMessage) => {
    if (message.contentType === "video-call") {
      return (
        <div className="video-call-message">
          <span className="phone-icon">📞</span>
          <span>{message.content}</span>
          <span className="timestamp">{formatDate(message.createdAt!)}</span>
        </div>
      );
    }
    return (
      <div className="message-content-wrapper">
        <p>{message.content}</p>
        <span className="timestamp">{formatDate(message.createdAt!)}</span>
        {message.senderId === userId && (
          <span
            className={`message-status ${message.isRead ? "read" : "unread"}`}
          >
            ✓
          </span>
        )}
      </div>
    );
  };

  const messageRead = (data: messageReadData) => {
    try {
      if (data.chatId === activeChat?._id) {
        setAllChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat._id === data.chatId) {
              const oldUnreadCount = chat.unreadMessageCount || 0;
              setTotalUnreadCount((prev) => prev - oldUnreadCount);
              return { ...chat, unreadMessageCount: 0 };
            }
            return chat;
          })
        );

        setMessages((prevMessages) =>
          prevMessages.map((message) => ({
            ...message,
            isRead: true,
          }))
        );
      }
    } catch (error) {
      console.log("error marking message as read", error);
    }
  };

  const shouldShowUnreadCount = (chat: IChat) => {
    if (!chat.lastMessage || !chat.unreadMessageCount) return false;
    return chat.lastMessage.receiverId === userId;
  };

  const initiateVideoCall = async () => {
    try {
      if (activeChat && userId) {
        const receiverId = activeChat.studentId._id;
        const roomID = `room_${userId}_${receiverId}`;
        const videoCallUrl = `/video-call?userId=${userInfo.name}&studentId=${receiverId}&roomID=${roomID}`;

        const videoCallMessage: IMessage = {
          chatId: activeChat._id,
          senderId: userId,
          receiverId: receiverId as string,
          content: "Video call",
          contentType: "video-call",
          isRead: false,
        };

        await axiosInstance.post(API.MSG_SENT, videoCallMessage);
        window.open(videoCallUrl, "_blank");
      }
    } catch (error) {
      console.log("error sending video call invitation", error);
    }
  };

  const handleVideoCallInvite = async (data: videCallData) => {
    try {
      if (data.studentId === userId) {
        Swal.fire({
          title: "Incoming Video Call",
          html: `
            <p>You have an incoming video call.</p>
          `,
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Join Call",
          cancelButtonText: "Decline",
          timer: 30000,
          timerProgressBar: true,
          didOpen: () => {
            const countdownEl = document.getElementById("countdown");
            let remainingTime = 30;

            const countdownInterval = setInterval(() => {
              remainingTime--;
              if (countdownEl) {
                countdownEl.textContent = remainingTime.toString();
              }

              if (remainingTime <= 0) {
                clearInterval(countdownInterval);
              }
            }, 1000);
          },
          willClose: () => {},
        }).then((result) => {
          if (result.isConfirmed) {
            const videoCallUrl = API.VIDEO_CALL + data.roomID;
            window.open(videoCallUrl, "_blank");
          } else if (result.dismiss === Swal.DismissReason.timer) {
            console.log(comments.CALL_AUTO_END);
          }
        });
      }
    } catch (error) {
      console.log("error handling video call invite", error);
    }
  };

  const fetchInitialUnreadCount = async () => {
    try {
      if (!userId) return;
      const response = await axiosInstance.get(API.CHAT_LIST + userId);
      const chats = response.data.data;

      const initialUnreadCount = chats.reduce((total: number, chat: IChat) => {
        if (
          chat.unreadMessageCount &&
          chat.lastMessage &&
          chat.lastMessage.receiverId === userId
        ) {
          return total + chat.unreadMessageCount;
        }
        return total;
      }, 0);

      setTotalUnreadCount(initialUnreadCount);
    } catch (error) {
      console.error(`Failed to fetch initial unread count`, error);
    }
  };
  useEffect(() => {
    fetchInitialUnreadCount();
  }, [userId]);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.emit("joinRoom", userId);

    socket.on(comments.IO_RECIEVE_MSG, handleNewMessage);

    socket.on("msg-read", messageRead);

    socket.on(comments.IO_CALL_INVITE, handleVideoCallInvite);

    scrollToBottom();
    return () => {
      socket.off(comments.IO_RECIEVE_MSG, handleNewMessage);
    };
  }, [userId, activeChat]);

  return (
    <>
      <div className="chat-bubble-minimized" onClick={handleBubbleClick}>
        <div className="chat-icon">💬</div>
        {totalUnreadCount > 0 && (
          <span className="unread-count">{totalUnreadCount}</span>
        )}
      </div>

      {showPlaceholder && (!userId || allChats.length === 0) && (
        <>
          <div className="chat-overlay" ref={overlayRef}></div>
          <div className="chat-placeholder" ref={placeholderRef}>
            <span>There are no chats to see</span>
          </div>
        </>
      )}

      {isExpanded && userId && allChats.length > 0 && (
        <>
          <div className="chat-overlay" ref={overlayRef}></div>
          <div className="chat-container" ref={chatRef}>
            <div className="chat-sidebar">
              <h3>Chats</h3>
              <ul className="chat-list">
                {allChats.map((chat) => (
                  <li
                    key={chat._id}
                    className={`chat-item ${
                      activeChat?._id === chat._id ? "active" : ""
                    }`}
                    onClick={() => handleChatClick(chat)}
                  >
                    <div className="chat-item-content">
                      <div className="chat-info">
                        <span className="chat-name">
                          {chat.tutorId._id === userId
                            ? chat.studentId.name
                            : chat.tutorId._id === userId
                            ? chat.studentId.name
                            : chat.tutorId.name}
                        </span>
                        <span className="chat-course">
                          ({chat.courseId.title})
                        </span>
                        <span>
                          {chat?.lastMessage && (
                            <div className="chat-last-message">
                              <div className="msg">{`${getLastMessage(
                                chat
                              )}..`}</div>
                              <div className="time">
                                {formatDate(chat.lastMessage.createdAt!)}
                              </div>
                            </div>
                          )}
                        </span>
                      </div>
                      {chat.unreadMessageCount! > 0 &&
                        shouldShowUnreadCount(chat) && (
                          <div className="chat-unread-count">
                            {chat.unreadMessageCount}
                          </div>
                        )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="chat-main">
              <div className="chat-header">
                <h4>
                  {activeChat
                    ? (activeChat.tutorId._id === userId
                        ? activeChat.studentId.name
                        : activeChat.tutorId.name) ||
                      (activeChat?.tutorId._id === userId
                        ? activeChat.studentId.name
                        : activeChat.tutorId.name)
                    : "Select a chat"}
                </h4>
              </div>
              {activeChat && (
                <>
                  <div className="chat-messages" ref={messagesContainerRef}>
                    {messages.map((msg: IMessage, index) => (
                      <div
                        key={`${msg._id || "message"}-${index}`}
                        className={`message ${
                          msg.senderId === userId ? "sent" : "received"
                        } ${
                          msg.contentType === "video-call" ? "video-call" : ""
                        }`}
                      >
                        {renderMessageContent(msg)}
                      </div>
                    ))}
                  </div>
                  <form className="chat-input" onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewMessage(e.target.value)
                      }
                    />
                    <button type="submit">Send</button>
                    {userInfo.role === "tutor" && activeChat && (
                      <button
                        type="button"
                        className="video-call-btn"
                        onClick={initiateVideoCall}
                      >
                        Video Call
                      </button>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {isLoading && <Loading />}
    </>
  );
};

export default ChatBubble2;
