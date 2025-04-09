import "../css/custom-colors.css";
import "../css/LogIn.css";
import logInImage from "../assets/img/login.png";
import logo from "../assets/img/logo.png";

function LogIn() {
  return (
    <main className="login-page">
      <section className="left-panel">
        <img src={logInImage} alt="log-in" />
      </section>
      <section className="right-panel">
        <img src={logo} alt="logo" />
        <form action="" method="post">
          <fieldset>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              placeholder="Enter email"
            />
          </fieldset>

          <fieldset>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              id="password"
              required
              placeholder="Enter password"
            />
          </fieldset>

          <button type="submit">Log In</button>
        </form>
        <a href="#">Forgot Password?</a>
      </section>
    </main>
  );
}

export default LogIn;
