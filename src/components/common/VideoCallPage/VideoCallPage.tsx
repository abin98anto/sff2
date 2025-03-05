import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import comments from "../../../shared/constants/comments";

export type ZegoElement = HTMLElement | null | undefined;

function randomID(len: number) {
  let result = "";
  if (result) return result;
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

export function getUrlParams(url = window.location.href) {
  const urlStr = url.split("?")[1];
  return new URLSearchParams(urlStr);
}

const VideoCallPage = () => {
  const roomID = getUrlParams().get("roomID") || randomID(5);

  const myMeeting = async (element: ZegoElement) => {
    const appID = 381031416;
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      randomID(5),
      randomID(5)
    );

    // Create instance object from Kit Token.
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    // start the call
    zp.joinRoom({
      container: element,
      //   showPreJoinView: false,
      sharedLinks: [
        {
          name: "Meeting link",
          url: comments.ZEGO_BASE_URL + roomID,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
    });
  };

  return (
    <div
      className="myCallContainer"
      ref={myMeeting}
      style={{ width: "100vw", height: "100vh" }}
    ></div>
  );
};

export default VideoCallPage;
