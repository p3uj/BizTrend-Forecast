import "../css/custom-colors.css";
import styles from "../css/LandingPage.module.css";

function LandingPage() {
  return (
    <main>
      <section className={styles.leftPanel}>
        <h1>
          BIZTREND
          <br />
          FORECAST
        </h1>
        <p>STAY AHEAD IN THE BUSINESS GAME!</p>
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
      </section>
    </main>
  );
}

export default LandingPage;
