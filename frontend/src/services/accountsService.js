const API_URL = "http://127.0.0.1:8000/";
const API_URL_QUERY = "http://127.0.0.1:8000/users/list_by_status/?is_active=";

import authService from "./authService";

class AccountsService {
  // Register new account
  async register(email, password, firstName, lastName, isAdmin) {
    try {
      const response = await fetch(API_URL + "register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          first_name: firstName,
          last_name: lastName,
          is_superuser: isAdmin,
        }),
      });

      if (!response.ok) {
        return response;
      }

      //   const data = await response.json();
      return response;
    } catch (error) {
      console.log("Failed to register!", error);
    }
  }

  // Update user information
  async updateUserInfo(userId, firstName, lastName) {
    try {
      const response = await fetch(API_URL + "users/" + userId + "/", {
        method: "PUT",
        headers: authService.getAuthHeader(),
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.log("failed to update user info", errorResponse);

        return response.status;
      }

      const data = await response.json();
      return response.status;
    } catch (error) {
      console.log("Failed to update user info!", error);
    }
  }

  // Update user profile picture
  async updateProfile(userId, profilePicture) {
    const formData = new FormData();
    formData.append("profile_picture", profilePicture);

    try {
      const token = authService.getAccessToken();

      const response = await fetch(API_URL + "users/" + userId + "/", {
        method: "PATCH",
        headers: {
          Authorization: token ? `JWT ${token}` : "",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.log("failed to update user profile picture", errorResponse);

        return response.status;
      }

      return response.status;
    } catch (error) {
      console.log("Failed to update user profile picture!", error);
      return error;
    }
  }

  // Get all users
  async getAllUsers() {
    try {
      const response = await fetch(API_URL + "users/", {
        method: "GET",
        headers: authService.getAuthHeader(),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.log("failed to fetch all users");

        return errorResponse;
      }

      const data = await response.json();
      return Array.from(data);
    } catch (error) {
      console.log("Failed to get all users!", error);
    }
  }

  // Get users by isActive
  async getUsersByisActive(status) {
    try {
      const response = await fetch(API_URL_QUERY + status, {
        method: "GET",
        headers: authService.getAuthHeader(),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.log("failed to fetch is_active users");

        return errorResponse;
      }

      const data = await response.json();
      return Array.from(data);
    } catch (error) {
      console.log("Failed to get users by status!", error);
    }
  }

  // Change user status
  async changeUserStatus(userId) {
    try {
      const response = await fetch(API_URL + "users/change_status/", {
        method: "PATCH",
        headers: authService.getAuthHeader(),
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.log("failed to change user status", errorResponse);

        return false;
      }

      return true;
    } catch (error) {
      console.log("Failed to change user status!", error);
    }
  }
}

const accountsService = new AccountsService();

export default accountsService;
