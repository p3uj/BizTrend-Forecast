const API_URL = "http://127.0.0.1:8000/auth/";

class AuthService {
  // Login user and store tokens
  async login(email, password) {
    try {
      const response = await fetch(API_URL + "jwt/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.log("login failed!");
        return false;
      }

      const data = await response.json();

      if (data.access) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        console.log("token stored in the local storage!");
      } else {
        console.log("No access token in response!");
      }

      return true;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  }

  // Get current user
  async getCurrrentUser() {
    try {
      const response = await fetch(API_URL + "users/me/", {
        method: "GET",
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        console.log("failed to fetch curr. user");
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Failed to get the current user!", error);
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
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token ? `JWT ${token}` : "",
    };
  }

  // Logout and clear the tokens
  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}

const authService = new AuthService();

export default authService;
