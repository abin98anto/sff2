"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import "./ChatBubble.scss";
import { useAppSelector } from "../../../hooks/reduxHooks";
import type IChat from "../../../entities/IChat";
import type IMessage from "../../../entities/IMessage";
import { socket } from "../../../shared/config/socketConfig";
import axiosInstance from "../../../shared/config/axiosConfig";
import type { IUser } from "../../../entities/IUser";
import type ICourse from "../../../entities/ICourse";
import Loading from "../Loading/Loading";
import Swal from "sweetalert2";

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

  const chatRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Changed to depend on messages array

  const unreadCount = messages.filter(
    (msg) => msg.senderId !== userId && !msg.isRead
  ).length;

  useEffect(() => {
    if (!userId) return;

    if (!socket.connected) {
      socket.connect();
    }

    // Handle real-time messages for the active chat
    socket.on("receive_message", (message: IMessage) => {
      if (message.content && message.content.trim() !== "") {
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
            setTimeout(() => {
              scrollToBottom();
            }, 100);
            return [...prevMessages, message];
          }
          return prevMessages;
        });

        if (chats.some((chat) => chat._id === message.chatId)) {
          updateChatWithMessage(message);
        }
      }
    });

    // Handle notifications for all messages (even when chat is minimized)
    socket.on("messageNotification", (notification) => {
      // console.log("noftifjctn", notification);
      if (notification.senderId !== userId && notification.receiverId === userId) {
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

    fetchChats();

    return () => {
      socket.off("receive_message");
      socket.off("messageNotification");
    };
  }, [userId]);

  const formatMessageTime = (timestamp: string | Date) => {
    if (!timestamp) return "";

    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "Just now";
      }
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Just now";
    }
  };

  const fetchChats = async () => {
    try {
      if (!userId) return;
      const response = await axiosInstance.get(`/chat/list?userId=${userId}`);
      const chatsData: IChat[] = response.data.data || [];
      setChats(chatsData);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      if (!userId) return;
      setIsLoading(true);
      const response = await axiosInstance.get(`/chat/messages/${chatId}`);

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

      setMessages(
        messagesArray.map((msg: IMessage) => ({
          ...msg,
          isRead: msg.isRead || false,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
    return Promise.resolve();
  };

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
    if (!userId) {
      setShowPlaceholder(true);
    } else if (chats.length === 0) {
      setShowPlaceholder(true);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleChatClick = (chat: IChat): void => {
    setActiveChat(chat);
    fetchMessages(chat._id).then(() => {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });
    socket.emit("joinRoom", chat._id);
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() && userId && activeChat) {
      const senderId = userId;

      let receiverId: string | undefined;
      if (typeof activeChat.tutorId === "string") {
        receiverId =
          activeChat.tutorId === userId
            ? (activeChat.studentId as string)
            : activeChat.tutorId;
      } else {
        receiverId =
          (activeChat.tutorId as IUser)._id === userId
            ? typeof activeChat.studentId === "string"
              ? activeChat.studentId
              : (activeChat.studentId as IUser)._id
            : (activeChat.tutorId as IUser)._id;
      }

      if (!receiverId) {
        console.error("Could not determine receiver ID");
        return;
      }

      const message: IMessage = {
        chatId: activeChat._id,
        senderId: senderId,
        receiverId: receiverId,
        content: newMessage,
        contentType: "text",
        isRead: false,
        timestamp: new Date(),
      };

      try {
        await axiosInstance.post("/chat/send", message);
        setNewMessage("");
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  useEffect(() => {
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, showPlaceholder]);

  return (
    <>
      <div className="chat-bubble-minimized" onClick={handleBubbleClick}>
        <span className="chat-icon">💬</span>
        {userId && unreadCount > 0 && (
          <span className="unread-count">{unreadCount}</span>
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
                          }`}
                        >
                          <p>{msg.content}</p>
                          <span className="timestamp">
                            {formatMessageTime(msg.timestamp)}
                          </span>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
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
