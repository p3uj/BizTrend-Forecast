import Navbar from "../components/NavBar";
import "../css/AccountDetails.css";
import SampleProfile from "../assets/img/do.png";

export default function AccountDetails() {
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
              <h4>Mary Grace Piattos</h4>
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
                <input type="text" name="first-name" id="first-name" />
              </fieldset>
              <fieldset>
                <label htmlFor="last-name">Last name</label>
                <input type="text" name="last-name" id="last-name" />
              </fieldset>
              <button type="submit">Save Changes</button>
            </form>
          </section>
          <section>
            <h2>Account Overview</h2>
            <fieldset>
              <label htmlFor="email">Email:</label>
              <input
                type="text"
                name="email"
                id="email"
                placeholder="m*****@gmail.com"
                disabled
              />
            </fieldset>
            <fieldset>
              <label htmlFor="role">Role:</label>
              <input
                type="text"
                name="role"
                id="role"
                placeholder="User"
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
