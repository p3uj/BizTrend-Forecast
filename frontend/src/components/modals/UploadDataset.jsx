import "../../css/UploadDataset.css";
import CloseIconBlack from "../../assets/icons/close-black.svg";
import CloseIconWhite from "../../assets/icons/close-white.svg";
import { useState } from "react";
import UploadIcon from "../../assets/icons/upload.svg";
import validateDataset from "../../services/datasetValidationService";
import dataset from "../../services/datasetService";

export default function UploadDataset({ showModal }) {
  const [isCloseBtnHover, setCloseBthHover] = useState(false);
  const [fileSelected, setFileSelected] = useState(null);
  const [response, setResponse] = useState(String);

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
  };

  const handleSubmission = async () => {
    const response = await validateDataset.validate(fileSelected);
    //console.log(response);
    setResponse(response);

    if (response.valid) {
      const postResponse = await dataset.postDataset(fileSelected);
      console.log(postResponse);
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

        {response && (
          <div>
            <p>{response.message}</p>
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
          disabled={fileSelected === null}
          className="make-prediction-btn"
          onClick={handleSubmission}
        >
          Make Prediction
        </button>
      </section>
    </div>
  );
}
