import axios from 'axios';

// Simple axios instance without authentication for testing
const SimpleAxios = axios.create({
  baseURL: 'http://127.0.0.1:8000/',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: false, // Disable credentials for simple server
});

const simplePredictionService = {
  // Test API connection
  testConnection: async () => {
    try {
      const response = await SimpleAxios.get('/api/test/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Connection test error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Connection failed',
      };
    }
  },

  // Upload dataset without authentication
  uploadDataset: async (file) => {
    try {
      console.log('Uploading file:', file.name, 'Size:', file.size);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await SimpleAxios.post('/api/datasets/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload successful:', response.data);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to upload dataset',
      };
    }
  },

  // Make predictions without authentication
  makePrediction: async (datasetId) => {
    try {
      console.log('Making prediction for dataset:', datasetId);
      
      const response = await SimpleAxios.post('/api/predictions/make_prediction/', {
        dataset_id: datasetId,
      });
      
      console.log('Prediction successful:', response.data);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Prediction error:', error);
      console.error('Error response:', error.response?.data);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to make predictions',
      };
    }
  },

  // Transform prediction data to match frontend format
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

export default simplePredictionService;
