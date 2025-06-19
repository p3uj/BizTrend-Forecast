import { useState, useEffect } from "react";
import Navbar from "../../components/NavBar";
import "../../css/UserManagement.css";
import SampleProfile from "../../assets/img/do.png";
import RegisterUser from "../../components/modals/RegisterUser";
import { useLocation, useNavigate } from "react-router-dom";
import Alert from "../../components/modals/Alert";
import accountsService from "../../services/accountsService";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ConfirmStatusChange from "../../components/modals/ConfirmStatusChange";

export default function UserManagement() {
  const numSkeletonLoading = 8;
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("All");
  const [isAddUser, setAddUser] = useState(false);
  const [hasNewUser, setHasNewUser] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isChangeStatus, setChangeStatus] = useState(false);
  const [userOverview, setUserOverview] = useState({
    userId: null,
    action: null,
  });
  const [isSuccessChangeStatus, setSuccessChangeStatus] = useState(false);

  const registrationSuccess = location.state?.registrationSuccess;
  const changeStatusSuccess = location.state?.changeStatusSuccess;

  useEffect(() => {
    if (registrationSuccess) {
      setHasNewUser(true);

      setTimeout(() => {
        setHasNewUser(false);

        // Set the regsitrationSuccess state to false.
        navigate(location.pathname, { state: { registrationSuccess: false } });
      }, 5000);
    }

    if (changeStatusSuccess) {
      setSuccessChangeStatus(true);

      setTimeout(() => {
        setSuccessChangeStatus(false);

        // Set the changeStatusSuccess state to false.
        navigate(location.pathname, { state: { changeStatusSuccess: false } });
      }, 5000);
    }
  }, [registrationSuccess, changeStatusSuccess]);

  useEffect(() => {
    setUsers([]);
    setLoading(true);
    const fetchUsers = async () => {
      if (activeTab === "All") {
        const users = await accountsService.getAllUsers();
        setUsers(users);
        setLoading(false);

        console.log("Users All:", users);
      } else if (activeTab === "Active") {
        const users = await accountsService.getUsersByisActive(1);
        setUsers(users);
        setLoading(false);

        console.log("Users Active:", users);
      } else if (activeTab === "Inactive") {
        const users = await accountsService.getUsersByisActive(0);
        setUsers(users);
        setLoading(false);

        console.log("Users Inactive:", users);
      }
    };

    fetchUsers();
  }, [activeTab]);

  return (
    <>
      {isAddUser && (
        <RegisterUser showRegisterUserModal={() => setAddUser(false)} />
      )}

      {hasNewUser && (
        <Alert message="Registration successful!" type="success" />
      )}

      {isChangeStatus && (
        <ConfirmStatusChange
          isShow={() => setChangeStatus(false)}
          action={userOverview.action}
          userId={userOverview.userId}
        />
      )}

      {isSuccessChangeStatus && (
        <Alert message="User status changed successfully!" type="success" />
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
            <h2>
              {activeTab} Users {!isLoading && <span>({users.length})</span>}
            </h2>
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

        {isLoading && (
          <section className="grid-container">
            {Array.from({ length: numSkeletonLoading }).map((_, index) => (
              <article className="user-container" key={index}>
                <Skeleton height={40} width={40} circle />
                <Skeleton height={20} width={100} />
                <section className="status-and-role">
                  <Skeleton height={20} width={60} />
                  <Skeleton height={20} width={60} />
                </section>
                <Skeleton height={40} width={200} borderRadius={40} />
              </article>
            ))}
          </section>
        )}

        {!isLoading && users.length == 0 && <p>No users found.</p>}

        {users.length > 0 && (
          <section className="grid-container">
            {users.map((user, index) => {
              return (
                <article className="user-container" key={index}>
                  <img src={SampleProfile} alt="Profile" />
                  <h2>
                    {user.first_name} {user.last_name}
                  </h2>
                  <section className="status-and-role">
                    <span
                      className="status"
                      data-status={
                        user.is_active === true ? "active" : "inactive"
                      }
                    >
                      <div className="dot"></div>
                      <p>{user.is_active === true ? "Active" : "Inactive"}</p>
                    </span>

                    {user.is_superuser === true && (
                      <span className="role" data-role={"admin"}>
                        <div className="dot"></div>
                        <p>Admin</p>
                      </span>
                    )}
                  </section>
                  <button
                    onClick={() => {
                      setChangeStatus(true);
                      setUserOverview({
                        userId: user.id,
                        action:
                          user.is_active === true ? "Deactivate" : "Activate",
                      });
                    }}
                  >
                    {user.is_active === true
                      ? "Deactivate Account"
                      : "Activate Account"}
                  </button>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </>
  );
}
