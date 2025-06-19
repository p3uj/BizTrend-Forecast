import "../../css/ConfirmStatusChange.css";
import Activate from "../../assets/icons/active-user.svg";
import Deactivate from "../../assets/icons/delete-account.svg";
import CloseIconBlack from "../../assets/icons/close-black.svg";
import CloseIconWhite from "../../assets/icons/close-white.svg";
import { useEffect, useState } from "react";
import accountsService from "../../services/accountsService";
import { useNavigate } from "react-router-dom";
import RippleLoading from "./loading/rippleLoading";

export default function ConfirmStatusChange({ isShow, action, userId }) {
  let icon;
  const navigate = useNavigate();

  const [isCloseBtnHover, setCloseBthHover] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  if (action === "Activate") {
    icon = Activate;
  } else {
    icon = Deactivate;
  }

  const handleConfirm = async () => {
    setSubmitting(true);

    try {
      const success = await accountsService.changeUserStatus(userId);

      if (!success) {
        return;
      } else {
        navigate("/user-management", { state: { changeStatusSuccess: true } });
        isShow();
      }
    } catch (error) {
      console.log("Failed to change user status!", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="confirm-status-change-modal">
      <section className="overlay" onClick={isShow}></section>
      <section className="content">
        <button
          onMouseEnter={() => setCloseBthHover(true)}
          onMouseLeave={() => setCloseBthHover(false)}
          onClick={isShow}
          className="close-btn"
        >
          <img
            src={!isCloseBtnHover ? CloseIconBlack : CloseIconWhite}
            alt="close-icon"
          />
        </button>
        <img src={icon} alt="icon" data-action={action} />
        <h2>{action} Account</h2>
        <p>
          Are you sure you want to {action.toLowerCase()} the account of this
          user?
        </p>
        <div className="group-buttons">
          <button className="submit-button" onClick={isShow}>
            No, keep {action.toLowerCase()}
          </button>
          <button
            className="submit-button"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting && <RippleLoading />}
            {isSubmitting ? "Processing..." : `Yes, ${action.toLowerCase()}`}
          </button>
        </div>
      </section>
    </section>
  );
}
