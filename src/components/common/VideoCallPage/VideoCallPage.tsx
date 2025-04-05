// Fix for VideoCallPage.tsx
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../shared/config/axiosConfig";
import API from "../../../shared/constants/API";
import comments from "../../../shared/constants/comments";

// function randomID(len: number) {
//   let result = "";
//   const chars =
//     "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
//   const maxPos = chars.length;
//   let i;
//   len = len || 5;
//   for (i = 0; i < len; i++) {
//     result += chars.charAt(Math.floor(Math.random() * maxPos));
//   }
//   return result;
// }

const VideoCallPage = () => {
  const location = useLocation();
  const meetingContainerRef = useRef<HTMLDivElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [roomID, setRoomID] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userIdParam = searchParams.get("userId");
    const studentIdParam = searchParams.get("studentId");
    const roomIDParam = searchParams.get("roomID");

    // Ensure all parameters are present
    if (!userIdParam || !studentIdParam || !roomIDParam) {
      setErrorMessage("Missing required parameters for video call");
      return;
    }

    setUserId(userIdParam);
    setStudentId(studentIdParam);
    setRoomID(roomIDParam);
  }, [location.search]);

  useEffect(() => {
    if (roomID && userId && studentId && meetingContainerRef.current) {
      const initializeVideoCall = async () => {
        try {
          // Make sure this value is correct and actually defined
          const appID = 381031416;

          // Important: Ensure this value is correctly set in your .env file
          const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

          if (!serverSecret) {
            console.error("Zego server secret is not defined");
            setErrorMessage("Configuration error: Missing Zego credentials");
            return;
          }

          // Generate a proper token
          // Note: Using the actual user ID is important for authentication
          const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            roomID,
            userId, // Use actual user ID here, not studentId
            userId // Use consistent display name
          );

          // Create and join with error handling
          const zp = ZegoUIKitPrebuilt.create(kitToken);

          zp.joinRoom({
            container: meetingContainerRef.current,
            showPreJoinView: true, // Show pre-join UI to confirm camera/mic
            turnOnCameraWhenJoining: true,
            turnOnMicrophoneWhenJoining: true,
            showMyCameraToggleButton: true,
            showMyMicrophoneToggleButton: true,
            showUserList: true,
            sharedLinks: [
              {
                name: "Meeting link",
                url: window.location.href,
              },
            ],
            scenario: {
              mode: ZegoUIKitPrebuilt.VideoConference,
            },
            onJoinRoom: () => {
              console.log("Successfully joined room:", roomID);
            },
            onLeaveRoom: () => {
              console.log("Left room:", roomID);
              // Don't try to close the window programmatically
              // Let the user close it manually or navigate away
            },
            // onError: (error) => {
            //   console.error("Zego error:", error);
            //   setErrorMessage(
            //     `Video call error: ${error.message || "Connection failed"}`
            //   );
            // },
          });

          // Notify server about successful connection
          await axiosInstance.post(API.VIDEO_CALL_PAGE, {
            roomID,
            userId,
            studentId,
          });
        } catch (error) {
          console.error(comments.VIDEO_CALLINIT_FAIL, error);
          setErrorMessage("Failed to initialize video call");
        }
      };

      initializeVideoCall();
    }
  }, [roomID, userId, studentId]);

  // Show loading or error states
  if (errorMessage) {
    return (
      <div className="video-call-error">
        <h3>Video Call Error</h3>
        <p>{errorMessage}</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  if (!roomID || !userId || !studentId) {
    return <div>Loading video call...</div>;
  }

  return (
    <div ref={meetingContainerRef} style={{ width: "100%", height: "100vh" }} />
  );
};

export default VideoCallPage;
