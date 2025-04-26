import "../../css/UploadDataset.css";
import CloseIconBlack from "../../assets/icons/close-black.svg";
import CloseIconWhite from "../../assets/icons/close-white.svg";
import { useState } from "react";

export default function UploadDataset({ showModal }) {
  const [isCloseBtnHover, setCloseBthHover] = useState(false);

  return (
    <div className="upload-dataset-modal">
      <section className="overlay" onClick={showModal}></section>
      <main className="content">
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
        <h1>Notes here!</h1>
        <section>
          <input type="file" name="file" id="file" />
          <label htmlFor="file">Choose File</label>
        </section>
        <button>Make Prediction</button>
      </main>
    </div>
  );
}
