import Navbar from "../components/NavBar";
import UploadDataset from "../components/modals/UploadDataset";
import { useEffect, useState } from "react";
import "../css/Home.css";
import Card from "../components/Card";
import AxiosInstance from "../components/AxiosInstance";
import authService from "../services/authService";
import predictionService from "../services/predictionService";
import CardSkeletonLoading from "../components/loading/CardSkeletonLoading";
import websocketService from "../services/websocketService";

export default function Home() {
  const [isUploadDataset, setUploadDataset] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Growing Industry Sector");
  const [growthRateData, setGrowthRateData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [leastCrowdedData, setLeastCrowdedData] = useState([]);
  const [years, setYears] = useState([]);
  const [title, setTitle] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isWebSocketConnected, setWebSocketConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // Function to fetch latest trends data
  const fetchLatestTrends = async () => {
    try {
      const latestTrends = await predictionService.getLatestTrends();
      // console.log("Latest trends:", latestTrends);
      setGrowthRateData(latestTrends[0]);
      setRevenueData(latestTrends[1]);
      setLeastCrowdedData(latestTrends[2]);
      setYears(latestTrends[3]);
      setLoading(false);
      setLastUpdateTime(new Date().toLocaleTimeString());
    } catch (error) {
      // console.error("Failed to fetch latest trends:", error);
      setLoading(false);
    }
  };

  // Get the current user.
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const getCurrentUser = await authService.getCurrentUser();
      setCurrentUser(getCurrentUser);
    };

    fetchCurrentUser();
  }, []);

  // Initialize WebSocket connection and fetch initial data
  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Set up WebSocket event listeners
    const handleConnectionEstablished = (data) => {
      // console.log("WebSocket connected:", data.message);
      setWebSocketConnected(true);
    };

    const handleConnectionLost = (data) => {
      // console.log("WebSocket disconnected:", data.message);
      setWebSocketConnected(false);
    };

    const handlePredictionCompleted = (data) => {
      // console.log("Prediction completed:", data);
      // Automatically refresh data when predictions are completed
      fetchLatestTrends();
    };

    const handleDatasetUploaded = (data) => {
      // console.log("Dataset uploaded:", data);
      // You can add additional handling here if needed
    };

    // Register event listeners
    websocketService.onConnectionEstablished(handleConnectionEstablished);
    websocketService.onConnectionLost(handleConnectionLost);
    websocketService.onPredictionCompleted(handlePredictionCompleted);
    websocketService.onDatasetUploaded(handleDatasetUploaded);

    // Fetch initial data
    fetchLatestTrends();

    // Cleanup on component unmount
    return () => {
      websocketService.removeEventListener(
        "connection_established",
        handleConnectionEstablished
      );
      websocketService.removeEventListener(
        "connection_lost",
        handleConnectionLost
      );
      websocketService.removeEventListener(
        "prediction_completed",
        handlePredictionCompleted
      );
      websocketService.removeEventListener(
        "dataset_uploaded",
        handleDatasetUploaded
      );
      websocketService.disconnect();
    };
  }, []);

  // Set the title based on the active filter.
  useEffect(() => {
    if (activeFilter == "Growing Industry Sector") {
      setTitle("Top 5 Growing Industry Sectors in");
    } else if (activeFilter == "Industry Sector Revenue") {
      setTitle("Top 5 Industry Sectors by Revenue in");
    } else {
      setTitle("Top 5 Least Crowded Industry Sectors in");
    }
  }, [activeFilter]);

  // Set this to prevent the user from scrolling when the modal is open.
  if (isUploadDataset) {
    document.body.style.overflow = "hidden"; // Prevent the user from scrolling when the modal is open.
  } else {
    document.body.style.overflow = "auto"; // Ensure the user can scroll when the modal is close.
  }

  // Function to get the sample data based on the active filter, type, and top number.
  const sampleData = (type, topNumber, filterResult) => {
    if (filterResult == "Growing Industry Sector") {
      return growthRateData.find(
        (item) => item.type === type && item.rank === topNumber
      );
    } else if (filterResult == "Industry Sector Revenue") {
      return revenueData.find(
        (item) => item.type === type && item.rank === topNumber
      );
    } else if (filterResult == "Least Crowded") {
      return leastCrowdedData.find(
        (item) => item.type === type && item.rank === topNumber
      );
    }
  };

  const handlePredictionComplete = (datasetId, predictionResponse) => {
    fetchLatestTrends(); // Refresh the trends data
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
          <h1>
            Short-Term Outlook: {title} {years.length > 0 ? years[0] : "🔮"}
          </h1>
          <section className="short-term-contents">
            {/* Display Skeleton Loading if data is not yet loaded */}
            {isLoading && <CardSkeletonLoading />}

            {/* Display Cards if data is already loaded */}
            {!isLoading && (
              <>
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
              </>
            )}
          </section>
        </section>

        {/* Mid-term Trends */}
        <section className="mid-term" id="mid-term">
          <h1>
            Mid-Term Outlook: {title} {years.length > 0 ? years[1] : "🔮"}
          </h1>
          <section className="mid-term-contents">
            {/* Display Skeleton Loading if data is not yet loaded */}
            {isLoading && <CardSkeletonLoading />}

            {/* Display Cards if data is already loaded */}
            {!isLoading && (
              <>
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
              </>
            )}
          </section>
        </section>

        {/* Long-term Trends */}
        <section className="long-term" id="long-term">
          <h1>
            Long-Term Outlook: {title} {years.length > 0 ? years[2] : "🔮"}{" "}
            (Based on Business Count)
          </h1>
          <section className="long-term-contents">
            {/* Display Skeleton Loading if data is not yet loaded */}
            {isLoading && <CardSkeletonLoading />}

            {/* Display Cards if data is already loaded */}
            {!isLoading && (
              <>
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
              </>
            )}
          </section>
        </section>
      </main>
    </>
  );
}
