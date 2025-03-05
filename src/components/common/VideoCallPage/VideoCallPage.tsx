import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import comments from "../../../shared/constants/comments";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../shared/config/axiosConfig";
import { useLocation } from "react-router-dom";

function randomID(len: number) {
  let result = "";
  const chars =
    "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
  const maxPos = chars.length;
  let i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

const VideoCallPage = () => {
  const location = useLocation();
  const meetingContainerRef = useRef<HTMLDivElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [roomID, setRoomID] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userIdParam = searchParams.get("userId") || randomID(5);
    const studentIdParam = searchParams.get("studentId") || randomID(5);
    const roomIDParam = searchParams.get("roomID") || randomID(5);

    setUserId(userIdParam);
    setStudentId(studentIdParam);
    setRoomID(roomIDParam);
  }, [location.search]);

  useEffect(() => {
    if (roomID && userId && studentId && meetingContainerRef.current) {
      const initializeVideoCall = async () => {
        try {
          const appID = 381031416;
          const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;
          const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            roomID,
            studentId,
            userId
          );

          const zp = ZegoUIKitPrebuilt.create(kitToken);
          zp.joinRoom({
            container: meetingContainerRef.current,
            showPreJoinView: false,
            sharedLinks: [
              {
                name: "Meeting link",
                url: comments.ZEGO_BASE_URL + roomID,
              },
            ],
            scenario: {
              mode: ZegoUIKitPrebuilt.VideoConference,
            },
            onLeaveRoom: () => {
              window.close();
            },
          });

          await axiosInstance.post("/chat/video-call", {
            roomID,
            userId,
            studentId,
          });
        } catch (error) {
          console.error("Failed to initialize video call", error);
        }
      };

      initializeVideoCall();
    }
  }, [roomID, userId, studentId]);

  return (
    <div ref={meetingContainerRef} style={{ width: "100%", height: "100vh" }} />
  );
};

export default VideoCallPage;
