import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";

import "./ChatBubble.scss";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { socket } from "../../../shared/config/socketConfig";
import axiosInstance from "../../../shared/config/axiosConfig";
import Loading from "../Loading/Loading";
import { IUser } from "../../../entities/IUser";
import type IChat from "../../../entities/IChat";
import type IMessage from "../../../entities/IMessage";
import type ICourse from "../../../entities/ICourse";
import API from "../../../shared/constants/API";
import comments from "../../../shared/constants/comments";

const ChatBubble: React.FC = () => {
  const { userInfo } = useAppSelector((state) => state.user);
  const userId = userInfo?._id;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(false);
  const [activeChat, setActiveChat] = useState<IChat | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [chats, setChats] = useState<IChat[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(true);
  const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);
  const [unreadCountByChat, setUnreadCountByChat] = useState<
    Record<string, number>
  >({});

  const chatRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const fetchUnreadMessageCount = async () => {
    try {
      if (!userId) return;
      const response = await axiosInstance.get(`/chat/unread-count/${userId}`);
      if (response.data.success && response.data.data) {
        setTotalUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch unread message count", error);
    }
  };

  const calculateUnreadCountByChat = () => {
    if (!userId) return;

    const unreadCounts: Record<string, number> = {};

    // Initialize all chats with zero unread messages
    chats.forEach((chat) => {
      unreadCounts[chat._id] = 0;
    });

    // Count unread messages for each chat
    messages.forEach((msg) => {
      if (
        msg.receiverId === userId &&
        !msg.isRead &&
        activeChat?._id === msg.chatId
      ) {
        unreadCounts[msg.chatId] = (unreadCounts[msg.chatId] || 0) + 1;
      }
    });

    setUnreadCountByChat(unreadCounts);
  };

  const markMessagesAsRead = async (unreadMessageIds: string[]) => {
    if (unreadMessageIds.length === 0) return;

    try {
      await axiosInstance.put(`/chat/mark-as-read`, {
        messageIds: unreadMessageIds,
      });
      // Update local state to reflect that messages are read
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          unreadMessageIds.includes(msg._id || "")
            ? { ...msg, isRead: true }
            : msg
        )
      );

      // Update unread counts after marking messages as read
      fetchUnreadMessageCount();
      calculateUnreadCountByChat();
    } catch (error) {
      console.error("Failed to mark messages as read", error);
    }
  };

  // To make the chat go to the recent message.
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close chat modal.
  useEffect(() => {
    setShowNotifications(!isExpanded);
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        chatRef.current &&
        !chatRef.current.contains(event.target as Node) &&
        overlayRef.current &&
        overlayRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
        setActiveChat(null); // Reset activeChat when closing the chat
      }
      if (
        showPlaceholder &&
        placeholderRef.current &&
        !placeholderRef.current.contains(event.target as Node)
      ) {
        setShowPlaceholder(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, showPlaceholder]);

  const formatMessageTime = (timestamp: string | Date) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "Just now";
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Just now";
    }
  };

  // Socket listeners.
  useEffect(() => {
    if (!userId) return;

    if (!socket.connected) {
      socket.connect();
    }

    // Join user-specific room
    socket.emit("joinUserRoom", userId);

    // receive message from server.
    // socket.on(comments.IO_RECIEVE_MSG, (message: IMessage) => {
    //   if (message.content && message.content.trim() !== "") {
    //     setMessages((prevMessages) => {
    //       const messageExists = prevMessages.some(
    //         (msg) =>
    //           (msg._id && msg._id === message._id) ||
    //           (msg.timestamp &&
    //             message.timestamp &&
    //             new Date(msg.timestamp).getTime() ===
    //               new Date(message.timestamp).getTime() &&
    //             msg.senderId === message.senderId &&
    //             msg.content === message.content)
    //       );
    //       if (!messageExists) {
    //         setTimeout(() => scrollToBottom(), 100);
    //         return [...prevMessages, message];
    //       }
    //       return prevMessages;
    //     });
    //     if (chats.some((chat) => chat._id === message.chatId)) {
    //       updateChatWithMessage(message);
    //     }
    //   }
    // });

    socket.on(comments.IO_RECIEVE_MSG, (message: IMessage) => {
      if (message.content && message.content.trim() !== "") {
        console.log("Received message:", message);

        // Update messages state
        setMessages((prevMessages) => {
          const messageExists = prevMessages.some(
            (msg) =>
              (msg._id && msg._id === message._id) ||
              (msg.timestamp &&
                message.timestamp &&
                new Date(msg.timestamp).getTime() ===
                  new Date(message.timestamp).getTime() &&
                msg.senderId === message.senderId &&
                msg.content === message.content)
          );

          if (!messageExists) {
            setTimeout(() => scrollToBottom(), 100);

            // If message is for current user and not from current user
            if (message.receiverId === userId && message.senderId !== userId) {
              // If chat is not active or a different chat is active, increment unread count
              if (!activeChat || activeChat._id !== message.chatId) {
                // Update total unread count
                setTotalUnreadCount((prev) => prev + 1);

                // Update unread count for specific chat
                setUnreadCountByChat((prev) => ({
                  ...prev,
                  [message.chatId]: (prev[message.chatId] || 0) + 1,
                }));
              } else {
                // If chat is active, mark as read immediately
                if (message._id) {
                  markMessagesAsRead([message._id]);
                  return [...prevMessages, { ...message, isRead: true }];
                }
              }
            }

            return [...prevMessages, message];
          }
          return prevMessages;
        });

        // Update chat list with new message
        if (chats.some((chat) => chat._id === message.chatId)) {
          updateChatWithMessage(message);

          // Fetch updated unread counts
          fetchUnreadMessageCount();
        }
      }
    });

    // to display notification.
    socket.on(comments.IO_MSG_NOTIFICATION, (notification) => {
      if (
        notification.senderId !== userId &&
        notification.receiverId === userId &&
        showNotifications
      ) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: "New Message",
          text: `${notification.sender}: ${notification.content}`,
          showConfirmButton: false,
          timer: 6000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", () => Swal.stopTimer());
            toast.addEventListener("mouseleave", () => Swal.resumeTimer());
          },
        });
      }
    });

    // video call invite.
    socket.on(comments.IO_CALL_INVITE, (data) => {
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
    });

    fetchUnreadMessageCount();
    fetchChats();

    return () => {
      socket.off(comments.IO_RECIEVE_MSG);
      socket.off(comments.IO_MSG_NOTIFICATION);
      socket.off(comments.IO_CALL_INVITE);
    };
  }, [userId, showNotifications, activeChat]);

  useEffect(() => {
    calculateUnreadCountByChat();

    // Update total unread count if not looking at active chat
    if (!isExpanded) {
      fetchUnreadMessageCount();
    }
  }, [messages, chats, userId, isExpanded]);

  // Send video call invitation.
  const handleVideoCallInvitation = async () => {
    if (activeChat && userId) {
      const receiverId =
        typeof activeChat.tutorId === "string"
          ? activeChat.tutorId === userId
            ? activeChat.studentId
            : activeChat.tutorId
          : (activeChat.tutorId as IUser)._id === userId
          ? typeof activeChat.studentId === "string"
            ? activeChat.studentId
            : (activeChat.studentId as IUser)._id
          : (activeChat.tutorId as IUser)._id;

      const roomID = `room_${userId}_${receiverId}`;
      const videoCallUrl = `/video-call?userId=${userInfo.name}&studentId=${receiverId}&roomID=${roomID}`;

      const videoCallMessage: IMessage = {
        chatId: activeChat._id,
        senderId: userId,
        receiverId: receiverId as string,
        content: "Video call",
        contentType: "video-call",
        isRead: false,
        timestamp: new Date(),
      };

      try {
        await axiosInstance.post(API.MSG_SENT, videoCallMessage);
      } catch (error) {
        console.error("Failed to record video call", error);
      }

      window.open(videoCallUrl, "_blank");
    }
  };

  // Populate chat list.
  // const fetchChats = async () => {
  //   try {
  //     if (!userId) return;
  //     const response = await axiosInstance.get(API.CHAT_LIST + userId);
  //     const chatsData: IChat[] = response.data.data || [];
  //     setChats(chatsData);
  //   } catch (error) {
  //     console.error(comments.CHAT_FETCH_FAIL, error);
  //   }
  // };

  const fetchChats = async () => {
    try {
      if (!userId) return;
      const response = await axiosInstance.get(API.CHAT_LIST + userId);
      const chatsData: IChat[] = response.data.data || [];
      setChats(chatsData);

      // Initialize unread counts for each chat
      const unreadCounts: Record<string, number> = {};
      for (const chat of chatsData) {
        try {
          const unreadResponse = await axiosInstance.get(
            `/chat/unread-count-by-chat/${userId}/${chat._id}`
          );
          if (unreadResponse.data.success && unreadResponse.data.data) {
            unreadCounts[chat._id] = unreadResponse.data.data.unreadCount;
          }
        } catch (error) {
          console.error(
            `Failed to fetch unread count for chat ${chat._id}`,
            error
          );
          unreadCounts[chat._id] = 0;
        }
      }

      setUnreadCountByChat(unreadCounts);
    } catch (error) {
      console.error(comments.CHAT_FETCH_FAIL, error);
    }
  };

  // Populate messages of a chat..
  // const fetchMessages = async (chatId: string) => {
  //   try {
  //     if (!userId) return;
  //     setIsLoading(true);
  //     const response = await axiosInstance.get(API.CHAT_MESSAGES + chatId);
  //     let messagesArray: IMessage[] = [];
  //     if (
  //       response.data.success &&
  //       response.data.data &&
  //       response.data.data.messages
  //     ) {
  //       messagesArray = response.data.data.messages;
  //     } else if (response.data.messages) {
  //       messagesArray = response.data.messages;
  //     }
  //     setMessages(
  //       messagesArray.map((msg: IMessage) => ({
  //         ...msg,
  //         isRead: msg.isRead || false,
  //       }))
  //     );
  //   } catch (error) {
  //     console.error(comments.MSG_FETCH_FAIL, error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchMessages = async (chatId: string) => {
    try {
      if (!userId) return;
      setIsLoading(true);
      const response = await axiosInstance.get(API.CHAT_MESSAGES + chatId);
      let messagesArray: IMessage[] = [];
      if (
        response.data.success &&
        response.data.data &&
        response.data.data.messages
      ) {
        messagesArray = response.data.data.messages;
      } else if (response.data.messages) {
        messagesArray = response.data.messages;
      }

      // Set messages in state
      setMessages(
        messagesArray.map((msg: IMessage) => ({
          ...msg,
          isRead: msg.isRead || false,
        }))
      );

      // Filter unread messages not sent by the current user
      const unreadMessageIds = messagesArray
        .filter((msg) => !msg.isRead && msg.senderId !== userId && msg._id)
        .map((msg) => msg._id as string);

      // Mark unread messages as read
      if (unreadMessageIds.length > 0) {
        await markMessagesAsRead(unreadMessageIds);
      }
    } catch (error) {
      console.error(comments.MSG_FETCH_FAIL, error);
    } finally {
      setIsLoading(false);
    }
  };

  // handle new message in the chat div.
  const updateChatWithMessage = (message: IMessage) => {
    if (activeChat) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === message.chatId
            ? { ...chat, messages: [...chat.messages, message._id || ""] }
            : chat
        )
      );
    }
  };

  const handleBubbleClick = () => {
    if (!userId || chats.length === 0) {
      setShowPlaceholder(true);
    } else {
      if (isExpanded) {
        setActiveChat(null); // Reset activeChat when minimizing
      }
      setIsExpanded(!isExpanded);
    }
  };

  // const handleChatClick = (chat: IChat) => {
  //   setActiveChat(chat);
  //   fetchMessages(chat._id).then(() => setTimeout(() => scrollToBottom(), 100));
  //   socket.emit("joinRoom", chat._id);
  // };

  const handleChatClick = (chat: IChat) => {
    setActiveChat(chat);
    fetchMessages(chat._id).then(() => {
      setTimeout(() => scrollToBottom(), 100);

      // Reset unread count for this chat
      setUnreadCountByChat((prev) => ({
        ...prev,
        [chat._id]: 0,
      }));

      // Update total unread count
      fetchUnreadMessageCount();
    });
    socket.emit("joinRoom", chat._id);
  };

  // Send message.
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() && userId && activeChat) {
      const senderId = userId;
      let receiverId =
        typeof activeChat.tutorId === "string"
          ? activeChat.tutorId === userId
            ? (activeChat.studentId as string)
            : activeChat.tutorId
          : (activeChat.tutorId as IUser)._id === userId
          ? typeof activeChat.studentId === "string"
            ? activeChat.studentId
            : (activeChat.studentId as IUser)._id
          : (activeChat.tutorId as IUser)._id;

      receiverId !== undefined ? receiverId : (receiverId = "");
      const message: IMessage = {
        chatId: activeChat._id,
        senderId,
        receiverId,
        content: newMessage,
        contentType: "text",
        isRead: false,
        timestamp: new Date(),
      };

      try {
        await axiosInstance.post(API.MSG_SENT, message);
        console.log("message sent", message.chatId);
        setNewMessage("");
        setTimeout(() => scrollToBottom(), 100);
      } catch (error) {
        console.error(comments.MSG_SENT_FAIL, error);
      }
    }
  };

  const renderMessageContent = (message: IMessage) => {
    if (message.contentType === "video-call") {
      return (
        <div className="video-call-message">
          <span className="phone-icon">📞</span>
          <span>{message.content}</span>
        </div>
      );
    }
    return <p>{message.content}</p>;
  };

  // Periodically update unread counts
  useEffect(() => {
    if (!userId) return;

    const intervalId = setInterval(() => {
      fetchUnreadMessageCount();

      // Update unread counts for each chat if not in expanded view
      if (!isExpanded) {
        const updateChatUnreadCounts = async () => {
          const updatedCounts = { ...unreadCountByChat };
          let changed = false;

          for (const chat of chats) {
            try {
              const response = await axiosInstance.get(
                `/chat/unread-count-by-chat/${userId}/${chat._id}`
              );
              if (response.data.success && response.data.data) {
                const newCount = response.data.data.unreadCount;
                if (updatedCounts[chat._id] !== newCount) {
                  updatedCounts[chat._id] = newCount;
                  changed = true;
                }
              }
            } catch (error) {
              console.error(
                `Failed to fetch unread count for chat ${chat._id}`,
                error
              );
            }
          }

          if (changed) {
            setUnreadCountByChat(updatedCounts);
          }
        };

        updateChatUnreadCounts();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [userId, chats, isExpanded, unreadCountByChat]);

  return (
    <>
      <div className="chat-bubble-minimized" onClick={handleBubbleClick}>
        <span className="chat-icon">💬</span>
        {totalUnreadCount > 0 && (
          <span className="unread-count">{totalUnreadCount}</span>
        )}
      </div>

      {showPlaceholder && (!userId || chats.length === 0) && (
        <div className="chat-placeholder" ref={placeholderRef}>
          <span>There are no chats to see</span>
        </div>
      )}

      {isExpanded && userId && chats.length > 0 && (
        <>
          <div className="chat-overlay" ref={overlayRef}></div>
          <div className="chat-container" ref={chatRef}>
            <div className="chat-sidebar">
              <h3>Chats</h3>
              <ul className="chat-list">
                {chats.map((chat) => (
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
                          {typeof chat.tutorId === "string"
                            ? chat.tutorId === userId
                              ? typeof chat.studentId === "string"
                                ? chat.studentId
                                : (chat.studentId as IUser).name
                              : chat.tutorId
                            : (chat.tutorId as IUser)._id === userId
                            ? typeof chat.studentId === "string"
                              ? chat.studentId
                              : (chat.studentId as IUser).name
                            : (chat.tutorId as IUser).name}
                        </span>
                        <span className="chat-course">
                          (Course:{" "}
                          {typeof chat.courseId === "string"
                            ? chat.courseId
                            : (chat.courseId as ICourse).title}
                          )
                        </span>
                      </div>
                      {unreadCountByChat[chat._id] > 0 && (
                        <div className="chat-unread-count">
                          {unreadCountByChat[chat._id]}
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
                    ? typeof activeChat.tutorId === "string"
                      ? activeChat.tutorId === userId
                        ? typeof activeChat.studentId === "string"
                          ? activeChat.studentId
                          : (activeChat.studentId as IUser).name
                        : activeChat.tutorId
                      : (activeChat.tutorId as IUser)._id === userId
                      ? typeof activeChat.studentId === "string"
                        ? activeChat.studentId
                        : (activeChat.studentId as IUser).name
                      : (activeChat.tutorId as IUser).name
                    : "Select a chat"}
                </h4>
              </div>
              {activeChat && (
                <>
                  {isLoading ? (
                    <div className="loading-messages">
                      <Loading />
                    </div>
                  ) : (
                    <div className="chat-messages" ref={messagesContainerRef}>
                      {messages.map((msg) => (
                        <div
                          key={msg._id || `msg-${messages.indexOf(msg) + 1}`}
                          className={`message ${
                            msg.senderId === userId ? "sent" : "received"
                          } ${
                            msg.contentType === "video-call" ? "video-call" : ""
                          }`}
                        >
                          {renderMessageContent(msg)}
                          <span className="timestamp">
                            {formatMessageTime(msg.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
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
                        onClick={handleVideoCallInvitation}
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
    </>
  );
};

export default ChatBubble;
