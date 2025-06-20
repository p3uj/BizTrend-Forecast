import Navbar from "../components/NavBar";
import "../css/AccountDetails.css";
import SampleProfile from "../assets/img/do.png";
import { useState } from "react";

export default function AccountDetails() {
  const [userInfo, setUserInfo] = useState({
    firstName: JSON.parse(sessionStorage.getItem("current_user")).first_name,
    lastName: JSON.parse(sessionStorage.getItem("current_user")).last_name,
    email: JSON.parse(sessionStorage.getItem("current_user")).email,
    is_superuser: JSON.parse(sessionStorage.getItem("current_user"))
      .is_superuser,
  });

  const maskEmail = (email) => {
    const [user, domain] = email.split("@");
    const maskedUser = user[0] + "*".repeat(user.length - 1);
    return `${maskedUser}@${domain}`;
  };

  return (
    <>
      <nav>
        <Navbar />
      </nav>
      <main className="account-details">
        <section>
          <div className="title-page">
            <h1>Account Profile</h1>
            <div className="profile-container">
              <h4>
                {userInfo.firstName} {userInfo.lastName}
              </h4>
              <img src={SampleProfile} alt="" />
            </div>
          </div>
        </section>
        <section>
          <section className="left-panel">
            <img src={SampleProfile} alt="" />
            <button>Change Profile Picture</button>
            <form action="">
              <fieldset>
                <label htmlFor="first-name">First name</label>
                <input
                  type="text"
                  name="first-name"
                  id="first-name"
                  defaultValue={userInfo.firstName}
                />
              </fieldset>
              <fieldset>
                <label htmlFor="last-name">Last name</label>
                <input
                  type="text"
                  name="last-name"
                  id="last-name"
                  defaultValue={userInfo.lastName}
                />
              </fieldset>
              <button type="submit" className="submit-button">
                Save Changes
              </button>
            </form>
          </section>
          <section className="right-panel">
            <h2>Account Overview</h2>
            <fieldset>
              <label htmlFor="email">Email:</label>
              <input
                type="text"
                name="email"
                id="email"
                value={maskEmail(userInfo.email)}
                disabled
              />
            </fieldset>
            <fieldset>
              <label htmlFor="role">Role:</label>
              <input
                type="text"
                name="role"
                id="role"
                value={userInfo.is_superuser ? "Admin" : "User"}
                disabled
              />
            </fieldset>
            <fieldset>
              <label htmlFor="date-created">Date Created:</label>
              <input
                type="text"
                name="date-created"
                id="date-created"
                placeholder="2024-01-01"
                disabled
              />
            </fieldset>
          </section>
        </section>
      </main>
    </>
  );
}
