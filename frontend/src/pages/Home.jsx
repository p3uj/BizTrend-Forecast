import "../css/custom-colors.css";
import Navbar from "../components/NavBar";
import UploadDataset from "../components/modals/UploadDataset";
import { useState } from "react";

export default function Home() {
  const [isUploadDataset, setUploadDataset] = useState(false);
  console.log("modal: ", isUploadDataset);

  return (
    <>
      {isUploadDataset && (
        <UploadDataset showModal={() => setUploadDataset(false)} />
      )}

      <nav>
        <Navbar showModal={() => setUploadDataset(true)} />
      </nav>
      <main className="home-page">
        <h1>home!</h1>
      </main>
    </>
  );
}
