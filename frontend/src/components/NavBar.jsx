import "../css/navbar.css";
import { useEffect, useState } from "react";
import DefaultProfile from "../assets/img/default-profile.svg";
import SystemIcon from "../assets/icons/system-icon.svg";
import { Tooltip } from "react-tooltip";
import { useLocation, useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Navbar({ showModal }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [userProfile, setUserProfile] = useState({
    profile: JSON.parse(sessionStorage.getItem("current_user")).profile_picture,
  });

  const [userRole, setUserRole] = useState(
    sessionStorage.getItem("current_user")
      ? JSON.parse(sessionStorage.getItem("current_user")).is_superuser
        ? "Admin"
        : "User"
      : "Guest"
  );
  const [activeTab, setActiveTab] = useState(".short-term");
  const [isProfileHover, setProfileHover] = useState(false);

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
                    ? `http://127.0.0.1:8000/${userProfile.profile}`
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
