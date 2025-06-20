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
  //console.log("data:", data);

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
              By {data ? data.prediction_result.year : "___"}, the{" "}
              {data ? data.prediction_result.industry_sector : "___"} sector is
              projected to achieve a growth rate of{" "}
              {data ? data.prediction_result.predicted_growth_rate : "___"}
              %, based on current historical trend analysis.
            </p>
          )}

          {filterResult == "Industry Sector Revenue" && (
            <p>
              By {data ? data.prediction_result.year : "___"}, the{" "}
              {data ? data.prediction_result.industry_sector : "___"} sector is
              expected to generate approximately ₱
              {data
                ? formatNumber(Number(data.prediction_result.predicted_revenue))
                : "___"}{" "}
              in revenue, based on the current historical trend analysis.
            </p>
          )}
        </div>

        {filterResult == "Least Crowded" && (
          <p>
            By {data ? data.prediction_result.year : "___"}, the{" "}
            {data ? data.prediction_result.industry_sector : "___"} sector is
            projected to be the least crowded industry, with an estimated{" "}
            {data
              ? formatNumber(data.prediction_result.predicted_least_crowded)
              : "___"}{" "}
            businesses in operation, based on the current historical trend
            analysis.
          </p>
        )}
        <h1 className={`industry ${topNumber == 1 ? "active" : ""}`}>
          {data ? data.prediction_result.industry_sector : "___"}
        </h1>
      </div>
    </article>
  );
}
