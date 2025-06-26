import authService from "./authService";

const API_URL = "https://backend-production-37cd.up.railway.app/dataset/";

class Dataset {
  // Post dataset
  async postDataset(file) {
    const formData = new FormData();
    const currentUser = await authService.getCurrentUser();

    formData.append("file", file);
    formData.append("uploaded_by_user", currentUser.id);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: this.getAuthHeader(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Failed to validate dataset!", error);
    }
  }

  // Get the access token
  getAccessToken() {
    return localStorage.getItem("access_token");
  }

  // Get the Autorization headers
  getAuthHeader() {
    const token = this.getAccessToken();

    return {
      Authorization: token ? `JWT ${token}` : "",
    };
  }
}

const dataset = new Dataset();

export default dataset;
