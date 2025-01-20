import { images } from "../../../shared/constants/images";

const GoogleButton = () => {
  return (
    <div className="buttons-container">
      <div className="google-login-button">
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth={0}
          version="1.1"
          x="0px"
          y="0px"
          className="google-icon"
          viewBox="0 0 48 48"
          height="1em"
          width="1em"
          xmlns={images.GOOGLE_SVG}
        >
          <path fill="#FFC107" d={images.GOOGLE_SIGN1} />
          <path fill="#FF3D00" d={images.GOOGLE_SIGN2} />
          <path fill="#4CAF50" d={images.GOOGLE_SIGN3} />
          <path fill="#1976D2" d={images.GOOGLE_SIGN4} />
        </svg>
      </div>
    </div>
  );
};

export default GoogleButton;
