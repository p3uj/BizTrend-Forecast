import "../../css/UploadDataset.css";
import CloseIconBlack from "../../assets/icons/close-black.svg";
import CloseIconWhite from "../../assets/icons/close-white.svg";
import { useState } from "react";
import UploadIcon from "../../assets/icons/upload.svg";
import predictionService from "../../services/predictionService";

export default function UploadDataset({ showModal, onPredictionComplete }) {
  const [isCloseBtnHover, setCloseBthHover] = useState(false);
  const [fileSelected, setFileSelected] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedDataset, setUploadedDataset] = useState(null);
  const [error, setError] = useState(null);

  console.log("file selected: ", fileSelected);

  const handleFileUpload = (event) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileSelected(file);
    } else {
      setFileSelected(null);
    }
  };

  const handleRemoveFile = (e) => {
    e.preventDefault(); // Prevent default behavior.
    e.stopPropagation(); // Stop propagation to prevent label click.

    document.getElementById("file").value = ""; // Reset the value in the input file.
    setFileSelected(null); // Clear value of the fileSelected state.
    setUploadedDataset(null);
    setError(null);
  };

  const handleMakePrediction = async () => {
    if (!fileSelected) return;

    try {
      setError(null);
      setIsUploading(true);

      // Upload dataset using authenticated service
      const uploadResult = await predictionService.uploadDataset(fileSelected);
      if (!uploadResult.success) {
        setError(uploadResult.error);
        return;
      }

      setUploadedDataset(uploadResult.data.dataset);
      setIsUploading(false);
      setIsProcessing(true);

      // Make predictions
      const predictionResult = await predictionService.makePrediction(
        uploadResult.data.dataset.id
      );
      if (!predictionResult.success) {
        setError(predictionResult.error);
        return;
      }

      // Transform data and pass to parent
      const transformedData = predictionService.transformPredictionData(
        predictionResult.data.predictions
      );

      if (onPredictionComplete) {
        onPredictionComplete(
          transformedData,
          predictionResult.data.model_performance
        );
      }

      // Close modal
      showModal();
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Prediction error:", error);
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="upload-dataset-modal">
      <section className="overlay" onClick={showModal}></section>
      <section className="content">
        <button
          onMouseEnter={() => setCloseBthHover(true)}
          onMouseLeave={() => setCloseBthHover(false)}
          onClick={showModal}
        >
          <img
            src={!isCloseBtnHover ? CloseIconBlack : CloseIconWhite}
            alt="close-icon"
          />
        </button>
        <h2>Upload Dataset</h2>
        <p className="reminder">
          Please make sure the dataset is complete to avoid inaccurate result.
        </p>

        {error && (
          <div
            className="error-message"
            style={{ color: "red", marginBottom: "10px" }}
          >
            {error}
          </div>
        )}

        {uploadedDataset && (
          <div
            className="dataset-info"
            style={{
              marginBottom: "10px",
              padding: "10px",
              backgroundColor: "#f0f0f0",
              borderRadius: "5px",
            }}
          >
            <p>
              <strong>Dataset uploaded successfully!</strong>
            </p>
            <p>
              Rows: {uploadedDataset.total_rows} | Sectors:{" "}
              {uploadedDataset.total_sectors}
            </p>
            <p>
              Years: {uploadedDataset.year_min} - {uploadedDataset.year_max}
            </p>
          </div>
        )}
        <section>
          <input
            type="file"
            name="file"
            id="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <label htmlFor="file">
            <img src={UploadIcon} alt="upload-icon" className="upload-icon" />
            <p>
              <span>Click here</span> to upload your file.
            </p>
            <p className="supported-format">Supported Format: csv</p>

            {fileSelected && (
              <div className="selected-file">
                <p>{fileSelected.name}</p>
                <img
                  src={CloseIconBlack}
                  alt="remove"
                  className="remove-icon"
                  onClick={handleRemoveFile}
                />
              </div>
            )}
          </label>
        </section>
        <button
          disabled={fileSelected === null || isUploading || isProcessing}
          className="make-prediction-btn"
          onClick={handleMakePrediction}
        >
          {isUploading
            ? "Uploading..."
            : isProcessing
            ? "Processing..."
            : "Make Prediction"}
        </button>
      </section>
    </div>
  );
}
