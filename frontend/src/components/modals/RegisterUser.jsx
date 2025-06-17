import { useState } from "react";
import CloseIconBlack from "../../assets/icons/close-black.svg";
import CloseIconWhite from "../../assets/icons/close-white.svg";
import "../../css/RegisterUser.css";

export default function RegisterUser({ showRegisterUserModal }) {
  const [isCloseBtnHover, setCloseBthHover] = useState(false);

  return (
    <div className="register-user-modal">
      <section className="overlay" onClick={showRegisterUserModal}></section>
      <section className="content">
        <header>
          <button
            onMouseEnter={() => setCloseBthHover(true)}
            onMouseLeave={() => setCloseBthHover(false)}
            onClick={showRegisterUserModal}
          >
            <img
              src={!isCloseBtnHover ? CloseIconBlack : CloseIconWhite}
              alt="close-icon"
            />
          </button>
          <h2>Register New User</h2>
        </header>
        <form action="">
          <fieldset>
            <label htmlFor="first-name">First Name *</label>
            <input
              type="text"
              name="first-name"
              id="first-name"
              placeholder="Enter first name..."
            />
          </fieldset>
          <fieldset>
            <label htmlFor="last-name">Last Name *</label>
            <input
              type="text"
              name="last-name"
              id="last-name"
              placeholder="Enter last name..."
            />
          </fieldset>
          <fieldset>
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter email..."
            />
          </fieldset>
          <fieldset>
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter password..."
            />
          </fieldset>
          <fieldset>
            <label htmlFor="confirm-password">Confirm Password *</label>
            <input
              type="password"
              name="confirm-password"
              id="confirm-password"
              placeholder="Enter confirm password..."
            />
          </fieldset>
          <fieldset>
            <input type="checkbox" name="role" id="role" />
            <label htmlFor="role">
              Check this if the new user is an admin.
            </label>
          </fieldset>
          <button className="register-btn">Register</button>
        </form>
      </section>
    </div>
  );
}
