const API_URL = "http://127.0.0.1:8000/";

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
}

const accountsService = new AccountsService();

export default accountsService;
