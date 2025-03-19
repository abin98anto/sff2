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

interface IChat {
  _id: string;
  tutorId: IUser;
  studentId: IUser;
  courseId: ICourse;
  messages: string[];
  lastMessage?: IMessage | null;
  unreadMessageCount?: number;
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

  const placeholderRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // expanding chat bubble.
  const handleBubbleClick = () => {
    console.log("exapanding chat");
    // if (!userId || allChats.length === 0) {}
    const newExpandedState = !isExpanded;
    if (newExpandedState) {
      fetchChats();
    } else {
      setActiveChat(null);
    }
    setIsExpanded(!isExpanded);
  };

  // closing chat bubble.
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatRef.current &&
        !chatRef.current.contains(event.target as Node) &&
        !document
          .querySelector(".chat-bubble-minimized")
          ?.contains(event.target as Node)
      ) {
        setIsExpanded(false);
        setActiveChat(null);
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
      setIsLoading(true);
      if (!userId) return;

      const response = await axiosInstance.get(API.CHAT_LIST + userId);
      console.log("chat list : ", response.data.data);
      setAllChats(response.data.data);

      setIsLoading(false);
    } catch (error) {
      console.error(`Failed to fetch unread count for chat`, error);
    }
  };

  return (
    <>
      <div className="chat-bubble-minimized" onClick={handleBubbleClick}>
        <div className="chat-icon">💬</div>
      </div>

      {showPlaceholder && !userId && (
        <div className="chat-placeholder" ref={placeholderRef}>
          <span>There are no chats to see</span>
        </div>
      )}

      {/* {isExpanded && userId && allChats.length > 0 && ( */}
      {isExpanded && userId && (
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
                    // onClick={() => handleChatClick(chat)}
                  >
                    <div className="chat-item-content">
                      <div className="chat-info">
                        <span className="chat-name">{chat?.tutorId?.name}</span>
                        <span className="chat-course">
                          ({chat.courseId.title})
                        </span>
                        <span>
                          {/* to display the last message */}
                          {chat?.lastMessage && (
                            <div className="chat-last-message">
                              {chat.lastMessage.content}
                            </div>
                          )}
                        </span>
                      </div>
                      {/* {unreadCountByChat[chat._id] > 0 && ( */}
                      <div className="chat-unread-count">
                        {/* {unreadCountByChat[chat._id]} */}
                        {chat.unreadMessageCount}
                      </div>
                      {/* )} */}
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
                          {/* {renderMessageContent(msg)} */}
                          <span className="timestamp">
                            {/* {formatMessageTime(msg.timestamp)} */} timestamp
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* <form className="chat-input" onSubmit={handleSendMessage}> */}
                  <form className="chat-input">
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
    </>
  );
};

export default ChatBubble2;
