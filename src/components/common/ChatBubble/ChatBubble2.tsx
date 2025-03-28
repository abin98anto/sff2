import { useEffect, useRef, useState } from "react";
import "./ChatBubble.scss";
import { useAppSelector } from "../../../hooks/reduxHooks";
// import IChat from "../../../entities/IChat";
import { IUser } from "../../../entities/IUser";
import ICourse from "../../../entities/ICourse";
import Loading from "../Loading/Loading";
import IMessage from "../../../entities/IMessage";
import axiosInstance from "../../../shared/config/axiosConfig";
import API from "../../../shared/constants/API";
import comments from "../../../shared/constants/comments";
import { socket } from "../../../shared/config/socketConfig";
// import Swal from "sweetalert2";

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
  // const [showNotifications, setShowNotifications] = useState<boolean>(true);

  const placeholderRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // expanding chat bubble.
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

  // fetching chats when the chat bubble expands.
  const fetchChats = async () => {
    try {
      if (!userId) return;

      const response = await axiosInstance.get(API.CHAT_LIST + userId);
      // console.log("chat list : ", response.data.data);
      setAllChats(response.data.data);
    } catch (error) {
      console.error(`Failed to fetch unread count for chat`, error);
    }
  };

  // fetch messages for a specific chat
  const fetchMessages = async (chatId: string): Promise<IMessage[]> => {
    try {
      setIsLoading(true);
      if (!userId) return [];

      const response = await axiosInstance.get(API.CHAT_MESSAGES + chatId);
      // setMessages(response.data.data);
      setMessages((prevMessages) => {
        // console.log("messages set", response.data.data);
        return response.data.data;
      });
      console.log("messges set", messages);
      return response.data.data;
    } catch (error) {
      console.log(comments.MSG_FETCH_FAIL, error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Selecting a specific chat.
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

  // format date.
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

  // Video call history design
  // const renderMessageContent = (message: IMessage) => {
  //   if (message.contentType === "video-call") {
  //     return (
  //       <div className="video-call-message">
  //         <span className="phone-icon">📞</span>
  //         <span>{message.content}</span>
  //       </div>
  //     );
  //   }
  //   return <p>{message.content}</p>;
  // };

  // send messages.
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

  // scroll to bottom of messages.
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

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

      console.log("the active chat", activeChat);
      let senderId =
        activeChat?.tutorId._id === userId
          ? activeChat?.studentId._id
          : activeChat?.tutorId._id;
      // console.log("sender id", senderId);
      senderId !== undefined ? senderId : (senderId = "");

      socket.emit("msg-read", {
        messageIds,
        chatId: activeChat?._id,
        receiverId: userId,
        senderId,
      });
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

  const handleNewMessage = (message: IMessage) => {
    try {
      setAllChats((prevChats) => {
        const chatToUpdate = prevChats.find(
          (chat) => chat._id === message.chatId
        );

        if (chatToUpdate) {
          const otherChats = prevChats.filter(
            (chat) => chat._id !== message.chatId
          );

          if (chatToUpdate.lastMessage) {
            chatToUpdate.unreadMessageCount =
              (chatToUpdate.unreadMessageCount || 0) + 1;
            chatToUpdate.lastMessage = message;

            return [...otherChats, chatToUpdate].sort(
              (a, b) =>
                new Date(b.lastMessage?.createdAt || 0).getTime() -
                new Date(a.lastMessage?.createdAt || 0).getTime()
            );
          }
        }

        return prevChats;
      });

      if (activeChat?._id === message.chatId) {
        setMessages((prev) => [...prev, message]);
      }

      if (message.senderId !== userId)
        markMessagesAsRead([message._id as string]);
    } catch (error) {
      console.log("error handling new message", error);
    }
  };

  const clearUnreadMessageCount = async (chatId: string) => {
    try {
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
      console.log("msg read in fe", data);
      if (data.chatId === activeChat?._id) {
        console.log("the read message is in active chat");
        setAllChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === data.chatId ? { ...chat, unreadMessageCount: 0 } : chat
          )
        );

        console.log("before smss", messages);

        setMessages((prevMessages) =>
          prevMessages.map((message) => ({
            ...message,
            isRead: true,
          }))
        );
      }

      console.log("all chats", messages);
    } catch (error) {
      console.log("error marking message as read", error);
    }
  };

  // To receive messages.
  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.emit("joinRoom", userId);

    socket.on(comments.IO_RECIEVE_MSG, handleNewMessage);

    socket.on("msg-read", messageRead);

    scrollToBottom();
    return () => {
      socket.off(comments.IO_RECIEVE_MSG, handleNewMessage);
    };
  }, [userId, activeChat]);

  // To scroll to bottom.
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
                      {chat.unreadMessageCount! > 0 && (
                        // <div className="chat-unread">
                        <div className="chat-unread-count">
                          {chat.unreadMessageCount}
                          {/* <div>{getUnreadMessageCount(userId)}</div> */}
                        </div>
                        // </div>
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
                        // onClick={handleVideoCallInvitation}
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
