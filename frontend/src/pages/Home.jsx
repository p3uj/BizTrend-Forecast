import Navbar from "../components/NavBar";
import UploadDataset from "../components/modals/UploadDataset";
import { useState } from "react";
import "../css/Home.css";

export default function Home() {
  const [isUploadDataset, setUploadDataset] = useState(false);
  const [isActive, setActive] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Growing Industry Sector");

  const isFilterFeedHover =
    localStorage.getItem("isFilterFeedHover") === "true";

  console.log("hover: ", isFilterFeedHover);

  // Set if the user can scroll.
  if (isUploadDataset) {
    document.body.style.overflow = "hidden"; // Prevent the user from scrolling when the modal is open.
  } else {
    document.body.style.overflow = "auto"; // Ensure the user can scroll when the modal is close.
  }

  return (
    <>
      {isUploadDataset && (
        <UploadDataset showModal={() => setUploadDataset(false)} />
      )}

      <nav>
        <Navbar showModal={() => setUploadDataset(true)} />
      </nav>
      <main className="home">
        <section className="short-term" id="short-term">
          <div className="filter">
            <p>Filter Results</p>
            <div className="line">
              <div
                className={`dot ${
                  activeFilter == "Growing Industry Sector" ? "active" : ""
                }`}
                onClick={() => setActiveFilter("Growing Industry Sector")}
              >
                <span>Growing Industry Sector</span>
              </div>
            </div>
            <div className="line">
              <div
                className={`dot ${
                  activeFilter == "Industry Sector Revenue" ? "active" : ""
                }`}
                onClick={() => setActiveFilter("Industry Sector Revenue")}
              >
                <span>Industry Sector Revenue</span>
              </div>
            </div>
            <div className="line">
              <div
                className={`dot ${
                  activeFilter == "Least Saturated" ? "active" : ""
                }`}
                onClick={() => setActiveFilter("Least Saturated")}
              >
                <span>Least Saturated</span>
              </div>
            </div>
          </div>
          <h1>Short-Term: Top 5 {activeFilter} for 2026</h1>
          <section className="short-term-contents">
            {/* TOP 4 */}
            <article
              className="card-top-4"
              onMouseEnter={() => setActive(false)}
              onMouseLeave={() => setActive(true)}
            >
              <div className="circle"></div>
              <div className="info-container">
                <h1>4</h1>
                <div className="paragraph-container">
                  <p>
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Ex, deleniti. Vero architecto minima expedita ad ipsum quis
                    esse ipsam possimus nostrum nisi obcaecati aliquid libero
                    odio, quisquam natus, at temporibus. Lorem ipsum dolor sit
                    amet consectetur adipisicing elit.
                  </p>
                </div>
                <h1 className="industry">Information and Communication</h1>
              </div>
            </article>

            {/* TOP 2 */}
            <article
              className="card-top-2"
              onMouseEnter={() => setActive(false)}
              onMouseLeave={() => setActive(true)}
            >
              <div className="circle"></div>
              <div className="info-container">
                <h1>2</h1>
                <div className="paragraph-container">
                  <p>
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Ex, deleniti. Vero architecto minima expedita ad ipsum quis
                    esse ipsam possimus nostrum nisi obcaecati aliquid libero
                    odio, quisquam natus, at temporibus. Lorem ipsum dolor sit
                    amet consectetur adipisicing elit. Iusto, expedita cumque
                    dolores quia a qui odit officiis ut aperiam provident autem
                    optio sunt temporibus nihil architecto impedit officia, non
                    dignissimos! Lorem ipsum dolor sit amet consectetur
                    adipisicing elit. Nemo neque libero iste. Vitae atque, ex
                    delectus deserunt similique repellendus. Vero dolore nostrum
                    dicta officia
                  </p>
                </div>
                <h1 className="industry">Information and Communication</h1>
              </div>
            </article>

            {/* TOP 1 */}
            <article className={`card-top-1 ${isActive ? "active" : ""}`}>
              <div className={`circle ${isActive ? "active" : ""}`}></div>
              <div className={`info-container ${isActive ? "active" : ""}`}>
                <h1>1</h1>
                <div
                  className={`paragraph-container ${isActive ? "active" : ""}`}
                >
                  <p>
                    By 2026, renewable energy is projected to achieve a growth
                    rate of 18.5%, which marks an increase of{" "}
                    <span className="positive">+3.5</span> percentage points
                    from 15% in 2025, based on current historical trend
                    analysis.
                  </p>
                </div>
                <h1 className={`industry ${isActive ? "active" : ""}`}>
                  Information and Communication
                </h1>
              </div>
            </article>

            {/* TOP 3 */}
            <article
              className="card-top-3"
              onMouseEnter={() => setActive(false)}
              onMouseLeave={() => setActive(true)}
            >
              <div className="circle"></div>
              <div className="info-container">
                <h1>3</h1>
                <div className="paragraph-container">
                  <p>
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Ex, deleniti. Vero architecto minima expedita ad ipsum quis
                    esse ipsam possimus nostrum nisi obcaecati aliquid libero
                    odio, quisquam natus, at temporibus. Lorem ipsum dolor sit
                    amet consectetur adipisicing elit. Iusto, expedita cumque
                    dolores quia a qui odit officiis ut aperiam provident autem
                    optio sunt temporibus nihil architecto impedit officia, non
                    dignissimos! Lorem ipsum dolor sit amet consectetur
                    adipisicing elit. Nemo neque libero iste. Vitae atque, ex
                    delectus deserunt similique repellendus. Vero dolore nostrum
                    dicta officia, dignissimos totam non voluptatem maxime
                    porro.
                  </p>
                </div>
                <h1 className="industry">Information and Communication</h1>
              </div>
            </article>

            {/* TOP 5 */}
            <article
              className="card-top-5"
              onMouseEnter={() => setActive(false)}
              onMouseLeave={() => setActive(true)}
            >
              <div className="circle"></div>
              <div className="info-container">
                <h1>5</h1>
                <div className="paragraph-container">
                  <p>
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Ex, deleniti. Vero architecto minima expedita ad ipsum quis
                    esse ipsam possimus nostrum nisi obcaecati aliquid libero
                    odio, quisquam natus, at temporibus. Lorem ipsum dolor sit
                    amet consectetur adipisicing elit. Iusto, expedita cumque
                    dolores quia a qui odit officiis ut aperiam provident autem
                    optio sunt temporibus nihil architecto impedit officia, non
                    dignissimos! Lorem ipsum dolor sit amet consectetur
                    adipisicing elit.
                  </p>
                </div>
                <h1 className="industry">Information and Communication</h1>
              </div>
            </article>
          </section>
        </section>

        {/* Mid-term Trends */}
        <section className="mid-term" id="mid-term">
          <h1>Top 5 Mid-Term Forecasted Business Industry Trends for 2028</h1>
          <section className="mid-term-contents">
            {/* TOP 4 */}
            <article className="card-top-4">
              <div className="circle"></div>
              <div className="info-container">
                <h1>4</h1>
                <div className="paragraph-container">
                  <p>
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Ex, deleniti. Vero architecto minima expedita ad ipsum quis
                    esse ipsam possimus nostrum nisi obcaecati aliquid libero
                    odio, quisquam natus, at temporibus. Lorem ipsum dolor sit
                    amet consectetur adipisicing elit.
                  </p>
                </div>
                <h1 className="industry">Information and Communication</h1>
              </div>
            </article>

            {/* TOP 2 */}
            <article className="card-top-2">
              <div className="circle"></div>
              <div className="info-container">
                <h1>2</h1>
                <div className="paragraph-container">
                  <p>
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Ex, deleniti. Vero architecto minima expedita ad ipsum quis
                    esse ipsam possimus nostrum nisi obcaecati aliquid libero
                    odio, quisquam natus, at temporibus. Lorem ipsum dolor sit
                    amet consectetur adipisicing elit. Iusto, expedita cumque
                    dolores quia a qui odit officiis ut aperiam provident autem
                    optio sunt temporibus nihil architecto impedit officia, non
                    dignissimos! Lorem ipsum dolor sit amet consectetur
                    adipisicing elit. Nemo neque libero iste. Vitae atque, ex
                    delectus deserunt similique repellendus. Vero dolore nostrum
                    dicta officia
                  </p>
                </div>
                <h1 className="industry">Information and Communication</h1>
              </div>
            </article>

            {/* TOP 1 */}
            <article className="card-top-1">
              <div className="circle"></div>
              <div className="info-container">
                <h1>1</h1>
                <div className="paragraph-container">
                  <p>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Laborum, quis blanditiis officia provident facilis veniam
                    molestias ullam fugiat delectus repellat vel quo recusandae,
                    officiis consequatur labore soluta quas, possimus aut? Lorem
                    ipsum dolor sit amet consectetur adipisicing elit. Neque
                    voluptatum ratione ex debitis earum aspernatur impedit saepe
                    odit corporis alias molestias cum nobis, modi distinctio
                    commodi obcaecati aliquam quia dolorem. Lorem ipsum dolor
                    sit amet consectetur, adipisicing elit. Placeat, modi dolor
                    maiores sapiente officiis beatae facilis adipisci ea, iure
                    voluptatum voluptate perspiciatis nisi? Repellat facilis
                    cumque quas laudantium accusantium temporibus. Lorem ipsum
                    dolor sit amet consectetur, adipisicing elit. Voluptates
                    necessitatibus dolor, delectus, dolorem cum aperiam eveniet
                    alias eligendi rerum ut dicta. Sit assumenda sint nostrum
                    labore maxime ratione magnam consequuntur.
                  </p>
                </div>
                <h1 className="industry">Information and Communication</h1>
              </div>
            </article>

            {/* TOP 3 */}
            <article className="card-top-3">
              <div className="circle"></div>
              <div className="info-container">
                <h1>3</h1>
                <div className="paragraph-container">
                  <p>
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Ex, deleniti. Vero architecto minima expedita ad ipsum quis
                    esse ipsam possimus nostrum nisi obcaecati aliquid libero
                    odio, quisquam natus, at temporibus. Lorem ipsum dolor sit
                    amet consectetur adipisicing elit. Iusto, expedita cumque
                    dolores quia a qui odit officiis ut aperiam provident autem
                    optio sunt temporibus nihil architecto impedit officia, non
                    dignissimos! Lorem ipsum dolor sit amet consectetur
                    adipisicing elit. Nemo neque libero iste. Vitae atque, ex
                    delectus deserunt similique repellendus. Vero dolore nostrum
                    dicta officia, dignissimos totam non voluptatem maxime
                    porro.
                  </p>
                </div>
                <h1 className="industry">Information and Communication</h1>
              </div>
            </article>

            {/* TOP 5 */}
            <article className="card-top-5">
              <div className="circle"></div>
              <div className="info-container">
                <h1>5</h1>
                <div className="paragraph-container">
                  <p>
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Ex, deleniti. Vero architecto minima expedita ad ipsum quis
                    esse ipsam possimus nostrum nisi obcaecati aliquid libero
                    odio, quisquam natus, at temporibus. Lorem ipsum dolor sit
                    amet consectetur adipisicing elit. Iusto, expedita cumque
                    dolores quia a qui odit officiis ut aperiam provident autem
                    optio sunt temporibus nihil architecto impedit officia, non
                    dignissimos! Lorem ipsum dolor sit amet consectetur
                    adipisicing elit.
                  </p>
                </div>
                <h1 className="industry">Information and Communication</h1>
              </div>
            </article>
          </section>
        </section>

        <section className="graphs-visual" id="graphs-visual">
          <h1>
            Graphical Visualization of Forecasted Business Industry Trends
          </h1>
        </section>
        <section className="about" id="about">
          <h1>About</h1>
        </section>
      </main>
    </>
  );
}
