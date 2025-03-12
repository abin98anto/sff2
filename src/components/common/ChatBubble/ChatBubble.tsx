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

  const chatRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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
        console.log("Received message:", message); // Log the full message
        console.log("Current userId:", userId); // Log the current user ID
        console.log("Current activeChat:", activeChat); // Log the current active chat

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

            // Detailed condition checking
            const isActiveChat =
              activeChat && message.chatId === activeChat._id;
            const isNotSender = message.senderId !== userId;
            const isUnread = !message.isRead;
            const hasId = !!message._id;

            console.log("Conditions:", {
              isActiveChat,
              isNotSender,
              isUnread,
              hasId,
            });

            if (isActiveChat && isNotSender && isUnread && hasId) {
              console.log(
                "Marking message as read because it is in active chat:",
                message._id
              );
              markMessagesAsRead([message._id as string]);
              // Optimistically update the message as read in the UI
              return [...prevMessages, { ...message, isRead: true }];
            }

            console.log("Message not marked as read, adding as is:", message);
            return [...prevMessages, message];
          }

          console.log("Message already exists, no action taken");
          return prevMessages;
        });

        if (chats.some((chat) => chat._id === message.chatId)) {
          updateChatWithMessage(message);
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

    fetchChats();

    return () => {
      socket.off(comments.IO_RECIEVE_MSG);
      socket.off(comments.IO_MSG_NOTIFICATION);
      socket.off(comments.IO_CALL_INVITE);
    };
  }, [userId, showNotifications, activeChat]);

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
  const fetchChats = async () => {
    try {
      if (!userId) return;
      const response = await axiosInstance.get(API.CHAT_LIST + userId);
      const chatsData: IChat[] = response.data.data || [];
      setChats(chatsData);
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
    fetchMessages(chat._id).then(() => setTimeout(() => scrollToBottom(), 100));
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

  return (
    <>
      <div className="chat-bubble-minimized" onClick={handleBubbleClick}>
        <span className="chat-icon">💬</span>
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
                      : (chat.tutorId as IUser).name}{" "}
                    (Course:{" "}
                    {typeof chat.courseId === "string"
                      ? chat.courseId
                      : (chat.courseId as ICourse).title}
                    )
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
