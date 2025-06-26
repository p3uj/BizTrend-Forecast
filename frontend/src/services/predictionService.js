const API_URL = "https://backend-production-37cd.up.railway.app/predictions/";

class PredictionService {
  // Generate ML predictions for a dataset
  async generatePredictions(datasetId) {
    try {
      const response = await fetch(`${API_URL}generate/`, {
        method: "POST",
        headers: {
          ...this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dataset_id: datasetId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate predictions");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to generate predictions:", error);
      throw error;
    }
  }

  // Get predictions by dataset ID
  async getPredictionsByDataset(datasetId) {
    try {
      const response = await fetch(
        `${API_URL}by_dataset/?dataset_id=${datasetId}`,
        {
          method: "GET",
          headers: this.getAuthHeader(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch predictions");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
      throw error;
    }
  }

  // Get the latest trends
  async getLatestTrends() {
    try {
      let growthTrends = [];
      let revenueTrends = [];
      let leastCrowdedTrends = [];

      const response = await fetch(`${API_URL}latest_trends/`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch latest trends");
      }

      const data = await response.json();

      // Assign based on the category
      data.forEach((trend) => {
        if (trend.category == "growth_rate") {
          growthTrends.push(trend);
        } else if (trend.category == "revenue") {
          revenueTrends.push(trend);
        } else if (trend.category == "least_crowded") {
          leastCrowdedTrends.push(trend);
        }
      });

      // Get unique years
      const years = [
        ...new Set(data.map((trend) => trend.prediction_result.year)),
      ];

      return [
        growthTrends,
        revenueTrends,
        leastCrowdedTrends,
        years.sort((a, b) => a - b),
      ];
    } catch (error) {
      console.error("Failed to fetch latest trends:", error);
      throw error;
    }
  }

  // Get the access token
  getAccessToken() {
    return localStorage.getItem("access_token");
  }

  // Get the Authorization headers
  getAuthHeader() {
    const token = this.getAccessToken();
    return {
      Authorization: token ? `JWT ${token}` : "",
    };
  }
}

const predictionService = new PredictionService();

export default predictionService;
