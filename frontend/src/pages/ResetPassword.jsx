import "../css/ResetPassword.css";
import ForgotPassIllustration from "../assets/img/forgot_password.png";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RippleLoading from "../components/modals/loading/RippleLoading";
import authService from "../services/authService";
import Alert from "../components/modals/Alert";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [isSubmitting, setSubmitting] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null);

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .required("Email is required.")
      .email("Invalid email format.")
      .matches(/^\S+@\S+\.\S+$/, "Invalid email format."),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
  });

  const submission = async (data) => {
    setSubmitting(true);

    const response = await authService.resetPassword(data.email);
    setResponseStatus(response);

    setSubmitting(null);
  };

  useEffect(() => {
    if (responseStatus != null) {
      setTimeout(() => {
        setResponseStatus(null);
      }, 5000);
    }
  }, [responseStatus]);

  console.log("responseStatus:", responseStatus);

  return (
    <>
      {responseStatus === 204 && (
        <Alert
          message="If that email address is in our database, 
          we will send you an email to reset your password."
          type="success"
        />
      )}

      {responseStatus != 204 && responseStatus != null && (
        <Alert
          message="Unable to sent reset password. Please try again."
          type="danger"
        />
      )}

      <main className="reset-password">
        <section className="left-panel">
          <img src={ForgotPassIllustration} alt="log-in" />
        </section>
        <section className="right-panel">
          <h1>Password Reset</h1>
          <p>
            Enter your email address and we will send you a link to reset your
            password.
          </p>
          <form onSubmit={handleSubmit(submission)}>
            <fieldset>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter email..."
                {...register("email")}
              />

              {errors.email && <span>{errors.email.message}</span>}
            </fieldset>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="submit-button"
            >
              {isSubmitting && <RippleLoading />}
              {isSubmitting ? "Submitting..." : "Sent Reset Link"}
            </button>
            <a onClick={() => navigate("/login")}>Back to Log In</a>
          </form>
        </section>
      </main>
    </>
  );
}
