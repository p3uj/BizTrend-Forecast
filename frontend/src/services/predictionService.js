import AxiosInstance from "../components/AxiosInstance";

const predictionService = {
  // Upload dataset
  uploadDataset: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await AxiosInstance.post("/api/datasets/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // Include cookies for session
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Dataset upload error:", error); // Logs full error details

      return {
        success: false,
        error: error.response?.data?.error || "Failed to upload dataset",
      };
    }
  },

  // Get user's datasets
  getDatasets: async () => {
    try {
      const response = await AxiosInstance.get("/api/datasets/");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch datasets",
      };
    }
  },

  // Make predictions
  makePrediction: async (datasetId) => {
    try {
      const response = await AxiosInstance.post(
        "/api/predictions/make_prediction/",
        {
          dataset_id: datasetId,
        },
        {
          withCredentials: true,
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to make predictions",
      };
    }
  },

  // Get prediction history
  getPredictions: async () => {
    try {
      const response = await AxiosInstance.get(
        "/api/predictions/get_predictions/",
        {
          withCredentials: true,
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch predictions",
      };
    }
  },

  // Transform database prediction results to match frontend format
  transformDatabasePredictions: (apiResponse) => {
    const transformedData = {
      growth: [],
      revenue: [],
      leastCrowded: [],
    };

    // Handle the API response structure
    const predictionResults = apiResponse.predictions || apiResponse;

    // Separate predictions by type and sort them
    const growthPredictions = predictionResults
      .filter((result) => result.predicted_growth_rate > 0)
      .sort((a, b) => b.predicted_growth_rate - a.predicted_growth_rate);

    const revenuePredictions = predictionResults
      .filter((result) => result.predicted_revenue > 0)
      .sort((a, b) => b.predicted_revenue - a.predicted_revenue);

    const leastCrowdedPredictions = predictionResults
      .filter((result) => result.predicted_least_crowded > 0)
      .sort((a, b) => a.predicted_least_crowded - b.predicted_least_crowded);

    // Transform growth predictions
    growthPredictions.forEach((result, index) => {
      transformedData.growth.push({
        id: result.id,
        year: result.year,
        industrySector: result.industry_sector,
        predictedGrowth: parseFloat(result.predicted_growth_rate),
        rank: index + 1,
        type:
          result.year <= new Date().getFullYear() + 1
            ? "short-term"
            : result.year <= new Date().getFullYear() + 3
            ? "mid-term"
            : "long-term",
        category: "growing industry sector",
      });
    });

    // Transform revenue predictions
    revenuePredictions.forEach((result, index) => {
      transformedData.revenue.push({
        id: result.id,
        year: result.year,
        industrySector: result.industry_sector,
        predictedRevenue: parseFloat(result.predicted_revenue),
        rank: index + 1,
        type:
          result.year <= new Date().getFullYear() + 1
            ? "short-term"
            : result.year <= new Date().getFullYear() + 3
            ? "mid-term"
            : "long-term",
        category: "revenue industry sector",
      });
    });

    // Transform least crowded predictions
    leastCrowdedPredictions.forEach((result, index) => {
      transformedData.leastCrowded.push({
        id: result.id,
        year: result.year,
        industrySector: result.industry_sector,
        predictedNumBusinesses: parseInt(result.predicted_least_crowded),
        rank: index + 1,
        type:
          result.year <= new Date().getFullYear() + 1
            ? "short-term"
            : result.year <= new Date().getFullYear() + 3
            ? "mid-term"
            : "long-term",
        category: "least crowded industry sector",
      });
    });

    return transformedData;
  },

  // Transform prediction data to match frontend format (for ML predictions)
  transformPredictionData: (predictions) => {
    const transformedData = {
      growth: [],
      revenue: [],
      leastCrowded: [],
    };

    if (predictions.growth_rate) {
      transformedData.growth = predictions.growth_rate.map((item, index) => ({
        id: index + 1,
        year: item.Year,
        industrySector: item["Industry Sector"],
        predictedGrowth: item["Predicted Growth Rate (%)"],
        rank: item.Rank,
        type:
          item.Year <= new Date().getFullYear() + 1
            ? "short-term"
            : item.Year <= new Date().getFullYear() + 3
            ? "mid-term"
            : "long-term",
        category: "growing industry sector",
      }));
    }

    if (predictions.revenue) {
      transformedData.revenue = predictions.revenue.map((item, index) => ({
        id: index + 1,
        year: item.Year,
        industrySector: item["Industry Sector"],
        predictedRevenue: item["Predicted Revenue (PHP Millions)"],
        rank: item.Rank,
        type:
          item.Year <= new Date().getFullYear() + 1
            ? "short-term"
            : item.Year <= new Date().getFullYear() + 3
            ? "mid-term"
            : "long-term",
        category: "revenue industry sector",
      }));
    }

    if (predictions.least_crowded) {
      transformedData.leastCrowded = predictions.least_crowded.map(
        (item, index) => ({
          id: index + 1,
          year: item.Year,
          industrySector: item["Industry Sector"],
          predictedNumBusinesses: item["Predicted Number of Businesses"],
          rank: item.Rank,
          type:
            item.Year <= new Date().getFullYear() + 1
              ? "short-term"
              : item.Year <= new Date().getFullYear() + 3
              ? "mid-term"
              : "long-term",
          category: "least crowded",
        })
      );
    }

    return transformedData;
  },
};

export default predictionService;
