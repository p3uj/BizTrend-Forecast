import "../css/custom-colors.css";
import styles from "../css/LandingPage.module.css";
import illustration1 from "../assets/img/illustration1.png";
import illustration2 from "../assets/img/illustration2.png";
import illustration3 from "../assets/img/illustration3.png";
import systemIcon from "../assets/icons/system_icon.png";

function LandingPage() {
  return (
    <main>
      <section className={styles.leftPanel}>
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
        <div className={`${styles.buttonsGroup} ${styles.extraStyle}`}>
          <button className={styles.adminBtn}>Admin User</button>
          <button className={styles.guestBtn}>Gust User</button>
        </div>
      </section>
      <section className={styles.rightPanel}>
        <div className={styles.bigCircle}></div>
        <div className={styles.smallCircleTop}></div>
        <div className={styles.smallCircleBottom}></div>
        <img
          className={styles.illustrationTop}
          src={illustration3}
          alt="illustration1"
        />
        <img
          className={styles.illustrationCenter}
          src={illustration2}
          alt="illustration2"
        />
        <img
          className={styles.illustrationBottom}
          src={illustration1}
          alt="illustration3"
        />
      </section>
    </main>
  );
}

export default LandingPage;
