import "../css/custom-colors.css";
import "../css/LogIn.css";
import logInImage from "../assets/img/login.png";
import logo from "../assets/img/logo.png";
import { useState } from "react";

function LogIn() {
  const [requiredFieldsData, setRequiredFieldsData] = useState({
    email: "",
    password: "",
  });

  const handleValueFields = (event) => {
    const { name, value } = event.target; // Destructures name and value from the input event.
    setRequiredFieldsData((prevData) => ({
      ...prevData, // Keep all existing value
      [name]: value, // Update the field that changed.
    }));
  };

  // Validate the required input fields.
  const isRequiredFieldValid =
    requiredFieldsData.email.includes("@") && requiredFieldsData.password != "";

  return (
    <main className="login-page">
      <section className="left-panel">
        <img src={logInImage} alt="log-in" />
      </section>
      <section className="right-panel">
        <img src={logo} alt="logo" />
        <form action="" method="post">
          <fieldset>
            <label htmlFor="email">Email:</label>

            {/* Display error for invalid email format if the email does not have '@' */}
            {!requiredFieldsData.email.includes("@") &&
              requiredFieldsData.email != "" && <span>Invalid format.</span>}

            <input
              type="email"
              name="email"
              id="email"
              required
              placeholder="Enter email"
              onChange={handleValueFields}
            />
          </fieldset>

          <fieldset>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              name="password"
              id="password"
              required
              placeholder="Enter password"
              onChange={handleValueFields}
            />
          </fieldset>

          <button type="submit" disabled={!isRequiredFieldValid}>
            Log In
          </button>
        </form>
        <a href="#">Forgot Password?</a>
      </section>
    </main>
  );
}

export default LogIn;
