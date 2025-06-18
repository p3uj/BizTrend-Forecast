import { useState, useEffect } from "react";
import Navbar from "../../components/NavBar";
import "../../css/UserManagement.css";
import SampleProfile from "../../assets/img/do.png";
import RegisterUser from "../../components/modals/RegisterUser";
import { useLocation, useNavigate } from "react-router-dom";
import Alert from "../../components/modals/Alert";

export default function UserManagement() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("All");
  const [isAddUser, setAddUser] = useState(false);
  const [hasNewUser, setHasNewUser] = useState(false);

  const registrationSuccess = location.state?.registrationSuccess;

  useEffect(() => {
    if (registrationSuccess) {
      setHasNewUser(true);

      setTimeout(() => {
        setHasNewUser(false);

        // Set the regsitrationSuccess state to false.
        navigate(location.pathname, { state: { registrationSuccess: false } });
      }, 5000);
    }
  }, [registrationSuccess]);

  return (
    <>
      {isAddUser && (
        <RegisterUser showRegisterUserModal={() => setAddUser(false)} />
      )}

      {hasNewUser && (
        <Alert message="Registration successful!" type="success" />
      )}

      <nav>
        <Navbar />
      </nav>
      <main className="user-management">
        <section>
          <div className="title-page">
            <h1>User Management</h1>
            <button onClick={() => setAddUser(true)}>Add User</button>
          </div>
        </section>
        <section>
          <div className="table-header">
            <h2>All Users (8)</h2>
            <ul>
              <li
                className={activeTab === "All" ? "active" : ""}
                onClick={() => setActiveTab("All")}
              >
                All
              </li>
              <li
                className={activeTab === "Active" ? "active" : ""}
                onClick={() => setActiveTab("Active")}
              >
                Active
              </li>
              <li
                className={activeTab === "Inactive" ? "active" : ""}
                onClick={() => setActiveTab("Inactive")}
              >
                Inactive
              </li>
            </ul>
          </div>
        </section>
        <section className="grid-container">
          <article className="grid-item-1">
            <img src={SampleProfile} alt="Profile" />
            <h2>Mary Grace Piattos</h2>
            <section className="status-and-role">
              <span className="status" data-status={"active"}>
                <div className="dot"></div>
                <p>Active</p>
              </span>
              <span className="role" data-role={"admin"}>
                <div className="dot"></div>
                <p>Admin</p>
              </span>
            </section>
            <button>Deactivate Account</button>
          </article>
          <article className="grid-item-2">
            <img src={SampleProfile} alt="Profile" />
            <h2>Jay Kamote</h2>
            <section className="status-and-role">
              <span className="status" data-status={"inactive"}>
                <div className="dot"></div>
                <p>Inactive</p>
              </span>
            </section>
            <button>Activate Account</button>
          </article>
          <article className="grid-item-3">
            <img src={SampleProfile} alt="Profile" />
            <h2>Mary Grace Piattos</h2>
            <section className="status-and-role">
              <span className="status" data-status={"active"}>
                <div className="dot"></div>
                <p>Active</p>
              </span>
              <span className="role" data-role={"admin"}>
                <div className="dot"></div>
                <p>Admin</p>
              </span>
            </section>
            <button>Make Inactive</button>
          </article>
          <article className="grid-item-4">
            <img src={SampleProfile} alt="Profile" />
            <h2>Mary Grace Piattos</h2>
            <section className="status-and-role">
              <span className="status" data-status={"active"}>
                <div className="dot"></div>
                <p>Active</p>
              </span>
              <span className="role" data-role={"admin"}>
                <div className="dot"></div>
                <p>Admin</p>
              </span>
            </section>
            <button>Make Inactive</button>
          </article>
          <article className="grid-item-5">
            <img src={SampleProfile} alt="Profile" />
            <h2>Mary Grace Piattos</h2>
            <section className="status-and-role">
              <span className="status" data-status={"active"}>
                <div className="dot"></div>
                <p>Active</p>
              </span>
              <span className="role" data-role={"admin"}>
                <div className="dot"></div>
                <p>Admin</p>
              </span>
            </section>
            <button>Make Inactive</button>
          </article>
          <article className="grid-item-6">
            <img src={SampleProfile} alt="Profile" />
            <h2>Mary Grace Piattos</h2>
            <section className="status-and-role">
              <span className="status" data-status={"active"}>
                <div className="dot"></div>
                <p>Active</p>
              </span>
              <span className="role" data-role={"admin"}>
                <div className="dot"></div>
                <p>Admin</p>
              </span>
            </section>
            <button>Make Inactive</button>
          </article>
          <article className="grid-item-7">
            <img src={SampleProfile} alt="Profile" />
            <h2>Mary Grace Piattos</h2>
            <section className="status-and-role">
              <span className="status" data-status={"active"}>
                <div className="dot"></div>
                <p>Active</p>
              </span>
              <span className="role" data-role={"admin"}>
                <div className="dot"></div>
                <p>Admin</p>
              </span>
            </section>
            <button>Make Inactive</button>
          </article>
          <article className="grid-item-8">
            <img src={SampleProfile} alt="Profile" />
            <h2>Mary Grace Piattos</h2>
            <section className="status-and-role">
              <span className="status" data-status={"active"}>
                <div className="dot"></div>
                <p>Active</p>
              </span>
              <span className="role" data-role={"admin"}>
                <div className="dot"></div>
                <p>Admin</p>
              </span>
            </section>
            <button>Make Inactive</button>
          </article>
        </section>
      </main>
    </>
  );
}
