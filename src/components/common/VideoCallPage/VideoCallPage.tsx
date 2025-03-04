// VideoCallPage.tsx
import React, { useEffect } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useLocation } from "react-router-dom";

const VideoCallPage: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const initVideoCall = async () => {
      // Extract query parameters directly
      const searchParams = new URLSearchParams(location.search);
      const roomId = searchParams.get("roomId");
      const userId = searchParams.get("userId");

      if (!roomId || !userId) {
        return;
      }

      const appID = import.meta.env.VITE_ZEGO_APP_ID;
      const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        Number(appID),
        serverSecret,
        roomId,
        userId,
        `User_${userId}`
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: document.getElementById("video-container") as HTMLElement,
        sharedLinks: [
          {
            name: "Copy link",
            url: window.location.href,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        onLeaveRoom: () => {
          window.close();
        },
      });
    };
    initVideoCall();
  }, [location]);

  return (
    <div
      id="video-container"
      style={{
        width: "100vw",
        height: "100vh",
      }}
    />
  );
};

export default VideoCallPage;
