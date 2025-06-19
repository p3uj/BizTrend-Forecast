import "../css/ResetPassword.css";
import ForgotPassIllustration from "../assets/img/forgot_password.png";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RippleLoading from "../components/modals/loading/rippleLoading";
import authService from "../services/authService";
import Alert from "../components/modals/Alert";

export default function ResetPasswordConfirm() {
  const navigate = useNavigate();
  const { uid, token } = useParams();
  const [isSubmitting, setSubmitting] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [responseStatus, setResponseStatus] = useState(null);

  const validationSchema = yup.object().shape({
    password: yup
      .string()
      .required("Password is required.")
      .min(12)
      .max(16)
      .matches(
        /^(?=.*\d{1})(?=.*[a-z]{1})(?=.*[A-Z]{1})(?=.*[!@#$%^&*{|}?~_=+.-]{1})(?=.*[^a-zA-Z0-9])(?!.*\s).{12,16}$/
      ),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Password don't match.")
      .required("Confirm Password is required."),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
  });

  const submission = async (data) => {
    setSubmitting(true);

    const response = await authService.resetPasswordConfirm(
      uid,
      token,
      data.password
    );

    console.log("response response:", response);
    setResponseStatus(response);
    setSubmitting(false);

    console.log(data);
  };

  useEffect(() => {
    if (responseStatus != null) {
      setTimeout(() => {
        setResponseStatus(null);
      }, 5000);
    }
  }, [responseStatus]);

  const watchPassword = watch("password", "");
  useEffect(() => {
    let errors = [];

    if (watchPassword.length < 12) {
      errors.push("- At least 12 characters.");
    }

    if (watchPassword.length > 16) {
      errors.push("- Not exceed 16 characters.");
    }

    if (!/[0-9]/.test(watchPassword)) {
      errors.push("- At least one number.");
    }

    if (!/[a-z]/.test(watchPassword)) {
      errors.push("- At least one lowercase letter.");
    }

    if (!/[A-Z]/.test(watchPassword)) {
      errors.push("- At least one uppercase letter.");
    }

    if (!/[!@#$%^&*{|}?~_=+.-]/.test(watchPassword)) {
      errors.push("- At least one special character (!@#$%^&*{|}?~_=+.-)");
    }

    if (/\s/.test(watchPassword)) {
      errors.push("Must not contain spaces");
    }

    setPasswordErrors(errors);
  }, [watchPassword]);

  console.log("change password:", responseStatus);

  return (
    <>
      {responseStatus === 204 && (
        <Alert message="Password changed successfully!" type="success" />
      )}

      {responseStatus != 204 && responseStatus != null && (
        <Alert
          message="Unable to change password. Please try again."
          type="danger"
        />
      )}

      <main className="reset-password">
        <section className="left-panel">
          <img src={ForgotPassIllustration} alt="log-in" />
        </section>
        <section className="right-panel">
          <h1>Set-Up New Password</h1>
          <p>Set a new password for your account.</p>
          <form onSubmit={handleSubmit(submission)}>
            <fieldset>
              <label htmlFor="password">New Password:</label>

              <input
                type="password"
                name="password"
                id="password"
                placeholder="Enter new password..."
                {...register("password")}
              />
            </fieldset>

            {passwordErrors.length !== 0 && (
              <div className="password-errors-container">
                <span>Password must contain the following:</span>
                {passwordErrors.map((error, index) => (
                  <span key={index}>{error}</span>
                ))}
              </div>
            )}

            <fieldset>
              <label htmlFor="confirm-password">Confirm Password:</label>

              <input
                type="password"
                name="confirm-password"
                id="confirm-password"
                placeholder="Enter confirm password..."
                {...register("confirmPassword")}
              />

              {errors.confirmPassword && (
                <span>{errors.confirmPassword.message}</span>
              )}
            </fieldset>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="submit-button"
            >
              {isSubmitting && <RippleLoading />}
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
            <a onClick={() => navigate("/login")}>Back to Log In</a>
          </form>
        </section>
      </main>
    </>
  );
}
