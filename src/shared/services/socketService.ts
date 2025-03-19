import { socket } from "../config/socketConfig";
import Swal from "sweetalert2";

interface MessageNotification {
  chatId: string;
  sender: string;
  content: string;
  timestamp: string;
}

class SocketService {
  private static instance: SocketService;
  private notifications: MessageNotification[] = [];

  private constructor() {
    this.initializeSocketListeners();
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  private initializeSocketListeners() {
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("messageNotification", (notification: MessageNotification) => {
      this.handleNewNotification(notification);
    });

    socket.on("receive_message", (message: MessageNotification) => {
      console.log("Message received:", message);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  public joinChatRoom(chatId: string) {
    socket.emit("joinRoom", chatId);
  }

  private handleNewNotification(notification: MessageNotification) {
    this.notifications.push(notification);
    this.showNotification(notification);
  }

  private showNotification(notification: MessageNotification) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "info",
      title: "New Message",
      text: `${notification.sender}: ${notification.content}`,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", () => Swal.stopTimer());
        toast.addEventListener("mouseleave", () => Swal.resumeTimer());
      },
    });
  }

  public getNotifications(): MessageNotification[] {
    return this.notifications;
  }

  public clearNotifications() {
    this.notifications = [];
  }
}

export const socketService = SocketService.getInstance();
