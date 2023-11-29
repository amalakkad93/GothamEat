import { GoogleLogin } from "react-google-login";
import { useDispatch } from "react-redux";
import { loginWithGoogle } from "../../store/session";
import "./GoogleLoginComponent.css";

const GoogleLoginComponent = () => {
  const dispatch = useDispatch();

  const handleGoogleSuccess = (response) => {
    dispatch(loginWithGoogle(response.tokenId));
  };

  const handleGoogleFailure = (response) => {
    console.error("Google login failed:", response);
  };
  console.log('REACT_APP_CLIENT_ID:', process.env.REACT_APP_CLIENT_ID);
  // console.log('REACT_APP_CLIENT_ID:', process.env.CLIENT_ID);

  return (
    <div className="google-login-container">
      <GoogleLogin
        clientId={process.env.REACT_APP_CLIENT_ID}
        // clientId={process.env.GOOGLE_CLIENT_ID}
        render={(renderProps) => (
          <button
            className="google-login-button"
            onClick={renderProps.onClick}
            disabled={renderProps.disabled}
          >
            <img
              className="google-login-icon"
              src="https://img.icons8.com/color/48/000000/google-logo.png"
              alt="Google logo"
            />
            <span className="google-login-text">Login with Google</span>
          </button>
        )}
        buttonText="Login with Google"
        onSuccess={handleGoogleSuccess}
        onFailure={handleGoogleFailure}
        cookiePolicy={"single_host_origin"}
      />
    </div>
  );
};

export default GoogleLoginComponent;
