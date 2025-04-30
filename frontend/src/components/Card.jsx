import "../css/Card.css";
import { useEffect, useState } from "react";

export default function Card({
  color = null,
  data,
  topNumber,
  type,
  filterResult,
}) {
  const [isHover, setHover] = useState(false);

  // Handle the adding and removing of the active class for the card-top-1
  useEffect(() => {
    if (topNumber != 1 && isHover) {
      document.getElementById(`card-top-1-${type}`).classList.remove("active");
    } else if (topNumber != 1 && !isHover) {
      document.getElementById(`card-top-1-${type}`).classList.add("active");
    }
  }, [isHover]);

  // console.table(data);

  // Function to format the number to be more readable.
  const formatNumber = (num) => {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + " " + "billiion"; // Convert to billions
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + " " + "million"; // Convert to millions
    } else {
      return num.toLocaleString(); // Add commas for thousands
    }
  };

  return (
    <article
      id={`card-top-${topNumber}-${type}`}
      className={`card-top-${topNumber} ${topNumber == 1 ? "active" : ""} ${
        color != null ? color : ""
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`circle ${topNumber == 1 ? "active" : ""} ${
          color != null ? color : ""
        }`}
      ></div>
      <div
        className={`info-container ${topNumber == 1 ? "active" : ""} ${
          color != null ? color : ""
        }`}
      >
        <h1>{topNumber}</h1>
        <div className={`paragraph-container`}>
          {filterResult == "Growing Industry Sector" && (
            <p>
              By {data ? data.year : "___"}, the{" "}
              {data ? data.industrySector : "___"} sector is projected to
              achieve a growth rate of {data ? data.predictedGrowth : "___"}
              %, which marks an increase of{" "}
              <span className="positive">+3.5</span> percentage points from 15%
              in 2025, based on current historical trend analysis.
            </p>
          )}

          {filterResult == "Industry Sector Revenue" && (
            <p>
              By {data ? data.year : "___"}, the{" "}
              {data ? data.industrySector : "___"} sector is expected to
              generate approximately{" "}
              {data ? formatNumber(data.predictedRevenue) : "___"} in revenue,
              reflecting a 12.8% increase from ₱461 billion in 2025, based on
              the current historical trend analysis.
            </p>
          )}
        </div>

        {filterResult == "Least Crowded" && (
          <p>
            By {data ? data.year : "___"}, the{" "}
            {data ? data.industrySector : "___"} sector is projected to be the
            least crowded industry, with an estimated{" "}
            {data ? formatNumber(data.predictedNumBusinesses) : "___"}{" "}
            businesses in operation, reflecting an 8% increase from 12,000 in
            2025, based on the current historical trend analysis.
          </p>
        )}
        <h1 className={`industry ${topNumber == 1 ? "active" : ""}`}>
          {data ? data.industrySector : "___"}
        </h1>
      </div>
    </article>
  );
}
