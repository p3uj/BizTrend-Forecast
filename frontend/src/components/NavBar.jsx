// import "../css/custom-colors.css";
import "../css/navbar.css";
import { useState } from "react";

function Navbar({ showModal }) {
  const [activeTab, setActiveTab] = useState(".short-term");

  return (
    <nav>
      <ul>
        <li
          className={activeTab === ".short-term" ? "active" : ""}
          onClick={() => setActiveTab(".short-term")}
        >
          <a href="#short-term">Short-Term</a>
        </li>
        <li
          className={activeTab === ".mid-term" ? "active" : ""}
          onClick={() => setActiveTab(".mid-term")}
        >
          <a href="#mid-term">Mid-Term</a>
        </li>
        <li
          className={activeTab === ".long-term" ? "active" : ""}
          onClick={() => setActiveTab(".long-term")}
        >
          <a href="#long-term">Long-Term</a>
        </li>
        <li
          className={activeTab === ".graphs-visual" ? "active" : ""}
          onClick={() => setActiveTab(".graphs-visual")}
        >
          <a href="#graphs-visual">Graphs Visual</a>
        </li>
        <li onClick={showModal}>Upload Dataset</li>
        <li
          className={activeTab === ".about" ? "active" : ""}
          onClick={() => setActiveTab(".about")}
        >
          <a href="#about">About</a>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
