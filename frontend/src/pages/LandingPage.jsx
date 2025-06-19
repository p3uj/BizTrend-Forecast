import "../css/custom-colors.css";
import "../css/LandingPage.css";
import illustration1 from "../assets/img/illustration1.png";
import illustration2 from "../assets/img/illustration2.png";
import illustration3 from "../assets/img/illustration3.png";
import systemIcon from "../assets/icons/system_icon.png";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="landing-page">
      <section className="left-panel">
        <h1>
          BIZTREND
          <br />
          F<img src={systemIcon} alt="system icon" />
          <span>RECAST</span>
        </h1>
        <h4>STAY AHEAD IN THE BUSINESS GAME!</h4>
        <br />
        <br />
        <p>Ready to explore?</p>
        <p>Select your user type and we'll guide the way!</p>
        <br />
        <div className="buttons-group extra-style">
          <button className="admin-btn" onClick={() => navigate("/login")}>
            Registered User
          </button>
          <button className="guest-btn" onClick={() => navigate("/home")}>
            Guest
          </button>
        </div>
      </section>
      <section className="right-panel">
        <div className="big-circle"></div>
        <div className="small-circle-top"></div>
        <div className="small-circle-bottom"></div>
        <img
          className="illustration-top"
          src={illustration3}
          alt="illustration1"
        />
        <img
          className="illustration-middle"
          src={illustration2}
          alt="illustration2"
        />
        <img
          className="illustration-bottom"
          src={illustration1}
          alt="illustration3"
        />
      </section>
    </main>
  );
}

export default LandingPage;
