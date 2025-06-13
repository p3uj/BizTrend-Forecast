import Navbar from "../components/NavBar";
import UploadDataset from "../components/modals/UploadDataset";
import { useEffect, useState } from "react";
import "../css/Home.css";
import Card from "../components/Card";
import AxiosInstance from "../components/AxiosInstance";
import authService from "../services/authService";
import predictionService from "../services/predictionService";

export default function Home() {
  const [isUploadDataset, setUploadDataset] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Growing Industry Sector");
  const [growthSampleData, setGrowthSampleData] = useState([]);
  const [revenueSampleData, setRevenueSampleData] = useState([]);
  const [leastSaturatedSampleData, setLeastSaturatedSampleData] = useState([]);
  const [title, setTitle] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userPredictions, setUserPredictions] = useState(null);
  const [modelPerformance, setModelPerformance] = useState(null);
  const [isUsingUserData, setIsUsingUserData] = useState(false);

  // Get the current user and load prediction history.
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const getCurrentUser = await authService.getCurrrentUser();
      setCurrentUser(getCurrentUser);
    };

    const loadPredictionHistory = async () => {
      try {
        const result = await predictionService.getPredictions();
        if (result.success && result.data.length > 0) {
          // Transform database predictions to frontend format
          const transformedData =
            predictionService.transformDatabasePredictions(result.data);

          // Set the data if we have predictions
          if (
            transformedData.growth.length > 0 ||
            transformedData.revenue.length > 0 ||
            transformedData.leastCrowded.length > 0
          ) {
            setUserPredictions(transformedData);
            setIsUsingUserData(true);

            // Update the data arrays with user predictions
            if (transformedData.growth.length > 0)
              setGrowthSampleData(transformedData.growth);
            if (transformedData.revenue.length > 0)
              setRevenueSampleData(transformedData.revenue);
            if (transformedData.leastCrowded.length > 0)
              setLeastSaturatedSampleData(transformedData.leastCrowded);

            // Get model performance from the first prediction result
            if (result.data[0].model_performance) {
              setModelPerformance(result.data[0].model_performance);
            }
          }
        }
      } catch (error) {
        console.error("Error loading prediction history:", error);
      }
    };

    fetchCurrentUser();
    loadPredictionHistory();
  }, []);

  // Fetch the sample data from the JSON files only if no user data is available
  useEffect(() => {
    if (!isUsingUserData) {
      fetch("Industry-Growth-Predictions.json")
        .then((response) => response.json())
        .then((json) => setGrowthSampleData(json))
        .catch((error) => console.error("Error loading growth data: ", error));
      fetch("Industry-Revenue-Predictions.json")
        .then((response) => response.json())
        .then((json) => setRevenueSampleData(json))
        .catch((error) => console.error("Error loading revenue data: ", error));
      fetch("Least-Crowded-Industry-Predictions.json")
        .then((response) => response.json())
        .then((json) => setLeastSaturatedSampleData(json))
        .catch((error) =>
          console.error("Error loading least saturated data: ", error)
        );
    }
  }, [isUsingUserData]);

  // Set the title based on the active filter.
  useEffect(() => {
    if (activeFilter == "Growing Industry Sector") {
      setTitle("Top 5 Growing Industry Sectors in 2026");
    } else if (activeFilter == "Industry Sector Revenue") {
      setTitle("Top 5 Industry Sectors by Revenue in 2026");
    } else {
      setTitle(
        "Top 5 Least Crowded Industry Sectors in 2026 (Based on Business Count)"
      );
    }
  }, [activeFilter]);

  // Set this to prevent the user from scrolling when the modal is open.
  if (isUploadDataset) {
    document.body.style.overflow = "hidden"; // Prevent the user from scrolling when the modal is open.
  } else {
    document.body.style.overflow = "auto"; // Ensure the user can scroll when the modal is close.
  }

  // Handle prediction completion
  const handlePredictionComplete = (predictions, performance) => {
    setUserPredictions(predictions);
    setModelPerformance(performance);
    setIsUsingUserData(true);

    // Update the data arrays with user predictions
    if (predictions.growth) setGrowthSampleData(predictions.growth);
    if (predictions.revenue) setRevenueSampleData(predictions.revenue);
    if (predictions.leastCrowded)
      setLeastSaturatedSampleData(predictions.leastCrowded);
  };

  // Function to get the sample data based on the active filter, type, and top number.
  const sampleData = (type, topNumber, filterResult) => {
    let dataSource;

    if (filterResult == "Growing Industry Sector") {
      dataSource = growthSampleData;
    } else if (filterResult == "Industry Sector Revenue") {
      dataSource = revenueSampleData;
    } else if (filterResult == "Least Crowded") {
      dataSource = leastSaturatedSampleData;
    }

    // Find the data based on the type and top number then return it to the calling function.
    return dataSource.find(
      (item) => item.type === type && item.rank === topNumber
    );
  };

  return (
    <>
      {isUploadDataset && (
        <UploadDataset
          showModal={() => setUploadDataset(false)}
          onPredictionComplete={handlePredictionComplete}
        />
      )}

      <nav>
        <Navbar showModal={() => setUploadDataset(true)} />
      </nav>
      <main className="home">
        {isUsingUserData && modelPerformance && (
          <section
            className="model-performance"
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              margin: "20px 0",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            <h3>Model Performance (Your Data)</h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: "10px",
              }}
            >
              <div>
                <strong>RMSE:</strong> {modelPerformance.avg_rmse?.toFixed(2)}
              </div>
              <div>
                <strong>MAE:</strong> {modelPerformance.avg_mae?.toFixed(2)}
              </div>
              <div>
                <strong>R²:</strong> {modelPerformance.avg_r2?.toFixed(3)}
              </div>
            </div>
          </section>
        )}

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
                  activeFilter == "Least Crowded" ? "active" : ""
                }`}
                onClick={() => setActiveFilter("Least Crowded")}
              >
                <span>Least Crowded</span>
              </div>
            </div>
          </div>
          <h1>Short-Term Outlook: {title}</h1>
          <section className="short-term-contents">
            <Card
              topNumber={4}
              type="short-term"
              data={sampleData("short-term", 4, activeFilter)}
              filterResult={activeFilter}
            />
            <Card
              topNumber={2}
              type="short-term"
              data={sampleData("short-term", 2, activeFilter)}
              filterResult={activeFilter}
            />
            <Card
              topNumber={1}
              type="short-term"
              data={sampleData("short-term", 1, activeFilter)}
              filterResult={activeFilter}
            />
            <Card
              topNumber={3}
              type="short-term"
              data={sampleData("short-term", 3, activeFilter)}
              filterResult={activeFilter}
            />
            <Card
              topNumber={5}
              type="short-term"
              data={sampleData("short-term", 5, activeFilter)}
              filterResult={activeFilter}
            />
          </section>
        </section>

        {/* Mid-term Trends */}
        <section className="mid-term" id="mid-term">
          <h1>Mid-Term Outlook: {title}</h1>
          <section className="mid-term-contents">
            <Card
              topNumber={4}
              type="mid-term"
              data={sampleData("mid-term", 4, activeFilter)}
              filterResult={activeFilter}
              color="dark"
            />
            <Card
              topNumber={2}
              type="mid-term"
              data={sampleData("mid-term", 2, activeFilter)}
              filterResult={activeFilter}
              color="dark"
            />
            <Card
              topNumber={1}
              type="mid-term"
              data={sampleData("mid-term", 1, activeFilter)}
              filterResult={activeFilter}
              color="dark"
            />
            <Card
              topNumber={3}
              type="mid-term"
              data={sampleData("mid-term", 3, activeFilter)}
              filterResult={activeFilter}
              color="dark"
            />
            <Card
              topNumber={5}
              type="mid-term"
              data={sampleData("mid-term", 5, activeFilter)}
              filterResult={activeFilter}
              color="dark"
            />
          </section>
        </section>

        {/* Long-term Trends */}
        <section className="long-term" id="long-term">
          <h1>Long-Term Outlook: {title}</h1>
          <section className="long-term-contents">
            <Card
              topNumber={4}
              type="long-term"
              data={sampleData("long-term", 4, activeFilter)}
              filterResult={activeFilter}
            />
            <Card
              topNumber={2}
              type="long-term"
              data={sampleData("long-term", 2, activeFilter)}
              filterResult={activeFilter}
            />
            <Card
              topNumber={1}
              type="long-term"
              data={sampleData("long-term", 1, activeFilter)}
              filterResult={activeFilter}
            />
            <Card
              topNumber={3}
              type="long-term"
              data={sampleData("long-term", 3, activeFilter)}
              filterResult={activeFilter}
            />
            <Card
              topNumber={5}
              type="long-term"
              data={sampleData("long-term", 5, activeFilter)}
              filterResult={activeFilter}
            />
          </section>
        </section>
      </main>
    </>
  );
}
