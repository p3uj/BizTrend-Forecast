const API_URL = "https://backend-production-37cd.up.railway.app/auth/";
const API_URL_USERS = "https://backend-production-37cd.up.railway.app/users/";

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
        // console.log("login failed!");
        return false;
      }

      const data = await response.json();

      if (data.access) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        // console.log("token stored in the local storage!");

        // Store the info of the current authenticated user.
        const currentUser = await this.getCurrentUser();

        // Create a copy without 'date_created'
        const { date_created, ...filteredUser } = currentUser;
        sessionStorage.setItem("current_user", JSON.stringify(filteredUser));

        // Store the constant value of account date created
        sessionStorage.setItem(
          "account_created_date",
          currentUser.date_created
        );
      } else {
        // console.log("No access token in response!");
      }

      return true;
    } catch (error) {
      // console.error("Login failed", error);
      throw error;
    }
  }

  // Reset Password
  async resetPassword(email) {
    try {
      const response = await fetch(API_URL + "users/reset_password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        // console.log("Reset password response:", response);
        return response.status;
      }

      return response.status;
    } catch (error) {
      // console.log("Failed to reset password!", error);
      return error;
    }
  }

  // Change password froom reset password request
  async resetPasswordConfirm(uid, token, password) {
    try {
      const response = await fetch(API_URL + `users/reset_password_confirm/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          uid: uid,
          token: token,
          new_password: password,
        }),
      });

      if (!response.ok) {
        // console.log("Reset password confirm response:", response.status);
        return response.status;
      }

      return response.status;
    } catch (error) {
      // console.log("Failed to reset password confirm!", error);
      return error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      // console.log("Getting current user...");
      const response = await fetch(API_URL_USERS + "me/", {
        method: "GET",
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // console.log("Error data: ", errorData);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // console.log("Failed to get the current user!", error);
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
    sessionStorage.removeItem("current_user");
    sessionStorage.removeItem("account_created_date");
  }
}

const authService = new AuthService();

export default authService;
