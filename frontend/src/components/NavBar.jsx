import "../css/navbar.css";
import { useEffect, useState } from "react";
import SampleProfile from "../assets/img/do.png";
import SystemIcon from "../assets/icons/system-icon.svg";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Navbar({ showModal }) {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

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

  // Check if the access token exist then set the corresponding user role.
  useEffect(() => {
    const hasAccessToken = authService.getAccessToken();
    if (hasAccessToken) {
      setUserRole("Admin");
    } else {
      setUserRole("Guest");
    }
  }, []);

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
          className={activeTab === ".short-term" ? "active" : ""}
          onClick={() => {
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
        {userRole == "Admin" ? (
          <>
            <li onClick={showModal}>Upload Dataset</li>
            <li>
              <img
                src={SampleProfile}
                alt="sample-profile"
                onMouseEnter={() => setProfileHover(true)}
                onMouseLeave={() => setProfileHover(false)}
              />

              {isProfileHover && (
                <div
                  className="profile-menu-container"
                  onMouseEnter={() => setProfileHover(true)}
                  onMouseLeave={() => setProfileHover(false)}
                >
                  <div className="profile-menu">
                    <li>Edit Account Details</li>
                    <li>User Management</li>
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
