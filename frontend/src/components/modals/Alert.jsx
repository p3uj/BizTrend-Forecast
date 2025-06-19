import "../../css/Alert.css";
import closeIcon from "../../assets/icons/close-white.svg";
import checkIcon from "../../assets/icons/check.svg";

export default function Alert({ message, type }) {
  let icon = type === "success" ? checkIcon : closeIcon;

  return (
    <div className={`alert alert-${type}`}>
      <img src={icon} alt="close-icon" />
      <p>{message}</p>
    </div>
  );
}
