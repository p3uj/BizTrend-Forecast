import authService from "./authService";

const API_URL = "http://127.0.0.1:8000/dataset_validation/validate/";

class DatasetValidation {
  // Validate the selected file
  async validate(file) {
    const formData = new FormData();

    formData.append("file", file);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
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
}

const validateDataset = new DatasetValidation();

export default validateDataset;
