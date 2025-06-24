import "../css/navbar.css";
import { useEffect, useState } from "react";
import DefaultProfile from "../assets/img/default-profile.svg";
import SystemIcon from "../assets/icons/system-icon.svg";
import { Tooltip } from "react-tooltip";
import { useLocation, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import websocketService from "../services/websocketService";

function Navbar({ showModal }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [userProfile, setUserProfile] = useState({
    profile: JSON.parse(sessionStorage.getItem("current_user"))
      ? JSON.parse(sessionStorage.getItem("current_user")).profile_picture
      : null,
  });

  // Debug: Log initial profile state
  useEffect(() => {
    console.log("NavBar: Initial userProfile state:", userProfile);
  }, []);

  // Debug: Log profile state changes
  useEffect(() => {
    console.log("NavBar: userProfile state changed:", userProfile);
  }, [userProfile]);

  const [userRole, setUserRole] = useState(
    sessionStorage.getItem("current_user")
      ? JSON.parse(sessionStorage.getItem("current_user")).is_superuser
        ? "Admin"
        : "User"
      : "Guest"
  );
  const [activeTab, setActiveTab] = useState(".short-term");
  const [isProfileHover, setProfileHover] = useState(false);

  // Function to update user profile from session storage
  const updateUserProfile = () => {
    console.log("NavBar: updateUserProfile called");
    const currentUser = JSON.parse(sessionStorage.getItem("current_user"));
    console.log("NavBar: Current user from session storage:", currentUser);
    if (currentUser) {
      console.log(
        "NavBar: Updating profile state with:",
        currentUser.profile_picture
      );
      setUserProfile({
        profile: currentUser.profile_picture,
      });
      setUserRole(currentUser.is_superuser ? "Admin" : "User");
    }
  };

  // Set up WebSocket event listeners for real-time profile updates
  useEffect(() => {
    const currentUser = JSON.parse(sessionStorage.getItem("current_user"));
    if (!currentUser) return;

    const currentUserId = currentUser.id;

    // Ensure WebSocket is connected
    if (
      !websocketService.getConnectionStatus().isConnected &&
      !websocketService.getConnectionStatus().isConnecting
    ) {
      console.log("NavBar: Connecting to WebSocket...");
      websocketService.connect();
    }

    const handleProfileUpdated = (data) => {
      console.log("NavBar: Profile updated via WebSocket:", data);
      // Only update if it's the current user's profile
      if (data.user_id === currentUserId) {
        updateUserProfile();
      }
    };

    const handleUserUpdated = (data) => {
      console.log("NavBar: User updated via WebSocket:", data);
      // Only update if it's the current user
      if (data.user_id === currentUserId) {
        updateUserProfile();
      }
    };

    // Register WebSocket event listeners
    websocketService.onProfileUpdated(handleProfileUpdated);
    websocketService.onUserUpdated(handleUserUpdated);

    // Also listen for storage changes as a backup
    const handleStorageChange = (e) => {
      console.log("NavBar: Storage change detected:", e.key);
      if (e.key === "current_user") {
        console.log(
          "NavBar: current_user changed in storage, updating profile"
        );
        updateUserProfile();
      }
    };

    // Add storage event listener
    window.addEventListener("storage", handleStorageChange);

    // Also add a custom event listener for same-tab storage changes
    const handleCustomStorageChange = () => {
      console.log("NavBar: Custom storage change event received");
      updateUserProfile();
    };

    window.addEventListener("userProfileUpdated", handleCustomStorageChange);

    // Cleanup on component unmount
    return () => {
      websocketService.removeEventListener(
        "profile_updated",
        handleProfileUpdated
      );
      websocketService.removeEventListener("user_updated", handleUserUpdated);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "userProfileUpdated",
        handleCustomStorageChange
      );
    };
  }, []);

  // Function to scroll to the section smoothly
  const scrollToSection = (sectionId) => {
    window.scrollTo({
      top: document.querySelector(sectionId).offsetTop,
      behavior: "smooth",
    });
  };

  const sections = document.querySelectorAll(
    "section.short-term, section.mid-term, section.long-term"
  );
  window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (window.scrollY >= sectionTop - sectionHeight / 2) {
        current = section.getAttribute("id");
      }
    });

    setActiveTab(`.${current}`);
  });

  const logout = () => {
    authService.logout();
    navigate("/");
  };

  //console.log("user role: ", userRole);

  return (
    <nav>
      <Tooltip
        id="nav-menu-tooltip"
        place="top"
        effect="solid"
        className="tooltip"
      />
      <ul>
        <li className="system-icon">
          <img src={SystemIcon} alt="system-icon" />
        </li>
        <li
          className={
            activeTab === ".short-term" && location.pathname.startsWith("/home")
              ? "active"
              : ""
          }
          onClick={() => {
            {
              location.pathname.startsWith("/user-management") ||
              location.pathname.startsWith("/account")
                ? navigate("/home")
                : null;
            }
            setActiveTab(".short-term");
            scrollToSection("#short-term");
          }}
        >
          <a
            data-tooltip-id="nav-menu-tooltip"
            data-tooltip-content="1 year ahead"
            data-tooltip-offset={30}
            onClick={() => {
              setActiveTab(".short-term");
              scrollToSection("#short-term");
            }}
          >
            Short-Term
          </a>
        </li>
        <li
          className={activeTab === ".mid-term" ? "active" : ""}
          onClick={() => {
            {
              location.pathname.startsWith("/user-management") ||
              location.pathname.startsWith("/account")
                ? navigate("/home")
                : null;
            }
            setActiveTab(".mid-term");
            scrollToSection("#mid-term");
          }}
        >
          <a
            data-tooltip-id="nav-menu-tooltip"
            data-tooltip-content="3 years ahead"
            data-tooltip-offset={30}
            onClick={() => {
              setActiveTab(".mid-term");
              scrollToSection("#mid-term");
            }}
          >
            Mid-Term
          </a>
        </li>
        <li
          className={activeTab === ".long-term" ? "active" : ""}
          onClick={() => {
            {
              location.pathname.startsWith("/user-management") ||
              location.pathname.startsWith("/account")
                ? navigate("/home")
                : null;
            }
            setActiveTab(".long-term");
            scrollToSection("#long-term");
          }}
        >
          <a
            data-tooltip-id="nav-menu-tooltip"
            data-tooltip-content="5 years ahead"
            data-tooltip-offset={30}
            onClick={() => {
              setActiveTab(".long-term");
              scrollToSection("#long-term");
            }}
          >
            Long-Term
          </a>
        </li>
        {userRole == "Admin" || userRole == "User" ? (
          <>
            <li onClick={showModal}>Upload Dataset</li>
            <li>
              <img
                src={
                  userProfile.profile
                    ? `http://127.0.0.1:8000${userProfile.profile}`
                    : DefaultProfile
                }
                alt="sample-profile"
                onMouseEnter={() => setProfileHover(true)}
                onMouseLeave={() => setProfileHover(false)}
                className={
                  location.pathname.includes("/user-management") ||
                  location.pathname.includes("/account")
                    ? "active"
                    : ""
                }
              />

              {isProfileHover && (
                <div
                  className={`profile-menu-container ${userRole}`}
                  onMouseEnter={() => setProfileHover(true)}
                  onMouseLeave={() => setProfileHover(false)}
                >
                  <div className="profile-menu">
                    <li
                      onClick={() => {
                        navigate("/account");
                        setActiveTab("profile");
                      }}
                      className={
                        location.pathname.startsWith("/account") ? "active" : ""
                      }
                    >
                      Edit Account Details
                    </li>

                    {/* Render only if the current user is superuser */}
                    {JSON.parse(sessionStorage.getItem("current_user"))
                      .is_superuser && (
                      <li
                        onClick={() => {
                          navigate("/user-management");
                          setActiveTab("profile");
                        }}
                        className={
                          location.pathname.startsWith("/user-management")
                            ? "active"
                            : ""
                        }
                      >
                        User Management
                      </li>
                    )}

                    <li onClick={logout}>Log Out</li>
                  </div>
                </div>
              )}
            </li>
          </>
        ) : (
          <button disabled="disabled" className="view-as-guest">
            View as Guest
          </button>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
