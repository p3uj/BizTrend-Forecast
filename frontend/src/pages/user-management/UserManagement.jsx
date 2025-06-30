import { useState, useEffect } from "react";
import Navbar from "../../components/NavBar";
import "../../css/UserManagement.css";
import DefaultProfile from "../../assets/img/default-profile.svg";
import RegisterUser from "../../components/modals/RegisterUser";
import { useLocation, useNavigate } from "react-router-dom";
import Alert from "../../components/modals/Alert";
import accountsService from "../../services/accountsService";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ConfirmStatusChange from "../../components/modals/ConfirmStatusChange";
import websocketService from "../../services/websocketService";

export default function UserManagement() {
  const numSkeletonLoading = 8;
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("All");
  const [isAddUser, setAddUser] = useState(false);
  const [hasNewUser, setHasNewUser] = useState(false);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isChangeStatus, setChangeStatus] = useState(false);
  const [userOverview, setUserOverview] = useState({
    userId: null,
    userName: null,
    action: null,
  });
  const [isSuccessChangeStatus, setSuccessChangeStatus] = useState(false);

  const registrationSuccess = location.state?.registrationSuccess;
  const changeStatusSuccess = location.state?.changeStatusSuccess;

  // Function to fetch users based on active tab
  const fetchUsers = async () => {
    setUsers([]);
    setLoading(true);

    try {
      let fetchedUsers;
      if (activeTab === "All") {
        fetchedUsers = await accountsService.getAllUsers();
        setAllUsers(fetchedUsers || []);
      } else if (activeTab === "Active") {
        fetchedUsers = await accountsService.getUsersByisActive(1);
        setActiveUsers(fetchedUsers || []);
      } else if (activeTab === "Inactive") {
        fetchedUsers = await accountsService.getUsersByisActive(0);
        setInactiveUsers(fetchedUsers || []);
      }

      setUsers(fetchedUsers || []);
      console.log(`Users ${activeTab}:`, fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

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

  // Set up WebSocket event listeners for real-time user management
  useEffect(() => {
    const handleUserCreated = (data) => {
      console.log("User created via WebSocket:", data);
      setHasNewUser(true);
      setTimeout(() => setHasNewUser(false), 5000);
      // Refresh user list
      fetchUsers();
    };

    const handleUserUpdated = (data) => {
      console.log("User updated via WebSocket:", data);
      // Refresh user list to show updated data
      fetchUsers();
    };

    const handleUserStatusChanged = (data) => {
      console.log("User status changed via WebSocket:", data);
      setSuccessChangeStatus(true);
      setTimeout(() => setSuccessChangeStatus(false), 5000);
      // Refresh user list to show status change
      fetchUsers();
    };

    // Register WebSocket event listeners
    websocketService.onUserCreated(handleUserCreated);
    websocketService.onUserUpdated(handleUserUpdated);
    websocketService.onUserStatusChanged(handleUserStatusChanged);

    // Cleanup on component unmount
    return () => {
      websocketService.removeEventListener("user_created", handleUserCreated);
      websocketService.removeEventListener("user_updated", handleUserUpdated);
      websocketService.removeEventListener(
        "user_status_changed",
        handleUserStatusChanged
      );
    };
  }, []);

  // Fetch all users, active, and inactive users when the component mounts.
  useEffect(() => {
    const fetchAllUsers = async () => {
      // Fetch all users
      const allUsers = await accountsService.getAllUsers();
      setAllUsers(allUsers || []);

      // Fetch all active users
      const activeUsers = await accountsService.getUsersByisActive(1);
      setActiveUsers(activeUsers || []);

      // Fetch all inactive users
      const inactiveUsers = await accountsService.getUsersByisActive(0);
      setInactiveUsers(inactiveUsers || []);

      setLoading(false);
    };

    fetchAllUsers();
  }, []);

  // Update users when activeTab changes and isLoading is false
  useEffect(() => {
    if (activeTab === "All") {
      setUsers(allUsers);
    } else if (activeTab === "Active") {
      setUsers(activeUsers);
    } else if (activeTab === "Inactive") {
      setUsers(inactiveUsers);
    }
  }, [!isLoading && activeTab]);

  // Update users every time there is a success change (change status or register new user)
  const handleChangeSuccess = () => {
    fetchUsers(); // Refresh user list
  };

  return (
    <>
      {isAddUser && (
        <RegisterUser
          showRegisterUserModal={() => setAddUser(false)}
          handleChangeSuccess={handleChangeSuccess}
        />
      )}

      {hasNewUser && (
        <Alert message="Registration successful!" type="success" />
      )}

      {isChangeStatus && (
        <ConfirmStatusChange
          isShow={() => setChangeStatus(false)}
          action={userOverview.action}
          userId={userOverview.userId}
          userName={userOverview.userName}
          handleChangeSuccess={handleChangeSuccess}
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
                  <img
                    src={
                      user.profile_picture
                        ? `https://backend-production-37cd.up.railway.app${user.profile_picture}`
                        : DefaultProfile
                    }
                    alt="Profile"
                  />
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
                        userName: `${user.first_name} ${user.last_name}`,
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
