import "../../css/UploadDataset.css";
import CloseIconBlack from "../../assets/icons/close-black.svg";
import CloseIconWhite from "../../assets/icons/close-white.svg";
import { useState } from "react";
import UploadIcon from "../../assets/icons/upload.svg";
import validateDataset from "../../services/datasetValidationService";
import dataset from "../../services/datasetService";
import predictionService from "../../services/predictionService";
import LoadingIcon from "../../assets/icons/analysis-chart.gif";
import { Tooltip } from "react-tooltip";
import RippleLoading from "./loading/rippleLoading";

export default function UploadDataset({ showModal, onPredictionComplete }) {
  const [isCloseBtnHover, setCloseBthHover] = useState(false);
  const [fileSelected, setFileSelected] = useState(null);
  const [response, setResponse] = useState(String);
  const [currentStep, setCurrentStep] = useState("");
  const [isPredictionSuccess, setPredictionSuccess] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const datasetRequirements = (
    <div className="dataset-requirements">
      Must include exactly the following columns and data types:
      <br />
      <br />
      <table>
        <tr>
          <th>Column Name</th>
          <th>Data Type</th>
        </tr>
        <tr>
          <td>Year</td>
          <td>Integer</td>
        </tr>
        <tr>
          <td>Industry Sector</td>
          <td>String</td>
        </tr>
        <tr>
          <td>Number of Businesses</td>
          <td>Number</td>
        </tr>
        <tr>
          <td>Revenue (PHP Millions)</td>
          <td>Number</td>
        </tr>
        <tr>
          <td>Growth Rate (%)</td>
          <td>Number</td>
        </tr>
      </table>
    </div>
  );

  //console.log("file selected: ", fileSelected);

  const handleFileUpload = (event) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileSelected(file);
    } else {
      setFileSelected(null);
    }
  };

  const handleRemoveFile = (e) => {
    setResponse(null);
    e.preventDefault(); // Prevent default behavior.
    e.stopPropagation(); // Stop propagation to prevent label click.

    document.getElementById("file").value = ""; // Reset the value in the input file.
    setFileSelected(null); // Clear value of the fileSelected state.
  };

  const handleSubmission = async () => {
    setPredictionSuccess(false);
    setSubmitting(true);

    try {
      // Step 1: Validate dataset
      const validationResponse = await validateDataset.validate(fileSelected);
      setResponse(validationResponse);

      console.log(validationResponse);

      if (validationResponse.valid) {
        // Step 2: Upload dataset
        setCurrentStep("Uploading dataset...");

        const uploadResponse = await dataset.postDataset(fileSelected);
        //console.log("Upload response:", uploadResponse);

        if (uploadResponse.id) {
          // Step 3: Generate ML predictions
          setCurrentStep(
            "Generating predictions... This may take a few moments."
          );

          const predictionResponse =
            await predictionService.generatePredictions(uploadResponse.id);
          //console.log("Prediction response:", predictionResponse);

          if (predictionResponse.success) {
            setPredictionSuccess(true);
            setCurrentStep(
              `Successfully generated ${predictionResponse.predictions_count} predictions for your dataset!`
            );

            setResponse({
              success: true,
              valid: true,
              message: `Successfully generated ${predictionResponse.predictions_count} predictions for your dataset!`,
            });

            // Notify parent component that predictions are complete
            if (onPredictionComplete) {
              onPredictionComplete(uploadResponse.id, predictionResponse);
            }

            // Auto-close modal after 2 seconds
            setTimeout(() => {
              setPredictionSuccess(false);
              showModal();
            }, 2000);
          } else {
            throw new Error("Failed to generate predictions");
          }
        } else {
          throw new Error("Failed to upload dataset");
        }
      }
    } catch (error) {
      console.error("Error in submission process:", error);
      setResponse({
        valid: false,
        message: `Error: ${error.message || "An unexpected error occurred"}`,
      });
      setCurrentStep("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="upload-dataset-modal">
      <section className="overlay" onClick={showModal}></section>
      <Tooltip
        id="dataset-required-info"
        place="bottom"
        effect="solid"
        className="tooltip"
      >
        {datasetRequirements}
      </Tooltip>
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
          Please make sure the dataset is correct and complete to avoid
          inaccurate result. {""}
          <a data-tooltip-id="dataset-required-info" data-tooltip-offset={10}>
            Hover to see Dataset Requirements.
          </a>
        </p>

        {currentStep && (
          <div
            className={`current-step ${
              isPredictionSuccess ? "success" : "processing"
            }`}
          >
            <img src={LoadingIcon} alt="" />
            <p>{currentStep}</p>
          </div>
        )}

        {response && response.valid === false && (
          <div
            className={`response-message ${
              response.valid ? "success" : "error"
            }`}
          >
            {response.message}
          </div>
        )}

        {currentStep === "" && (
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
        )}

        <button
          disabled={fileSelected === null || isSubmitting}
          className="submit-button"
          onClick={handleSubmission}
        >
          {isSubmitting && <RippleLoading />}
          {isSubmitting ? "Processing..." : "Make Prediction"}
        </button>
      </section>
    </div>
  );
}
