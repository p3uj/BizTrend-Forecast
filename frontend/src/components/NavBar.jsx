import "../css/navbar.css";
import { useState } from "react";

function Navbar({ showModal }) {
  const [activeTab, setActiveTab] = useState(".short-term");

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

  return (
    <nav>
      <ul>
        <li
          className={activeTab === ".short-term" ? "active" : ""}
          onClick={() => {
            setActiveTab(".short-term");
            scrollToSection("#short-term");
          }}
        >
          <a
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
            onClick={() => {
              setActiveTab(".long-term");
              scrollToSection("#long-term");
            }}
          >
            Long-Term
          </a>
        </li>
        <li onClick={showModal}>Upload Dataset</li>
      </ul>
    </nav>
  );
}

export default Navbar;
