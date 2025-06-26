import { useState, useEffect } from "react";
import CloseIconBlack from "../../assets/icons/close-black.svg";
import CloseIconWhite from "../../assets/icons/close-white.svg";
import "../../css/RegisterUser.css";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import accountsService from "../../services/accountsService";
import "../../css/global.css";
import RippleLoading from "./loading/RippleLoading";
import Alert from "./Alert";
import { useNavigate } from "react-router-dom";

export default function RegisterUser({ showRegisterUserModal }) {
  const navigate = useNavigate();

  const [isCloseBtnHover, setCloseBthHover] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [isSubmitting, setSubmitting] = useState(false);
  const [registrationResponse, setRegistrationResponse] = useState(null);

  const validationSchema = yup.object().shape({
    firstName: yup.string().required("First name is required."),
    lastName: yup.string().required("Last name is required."),
    email: yup
      .string()
      .required("Email is required.")
      .email("Invalid email format.")
      .matches(/^\S+@\S+\.\S+$/, "Invalid email format."),
    password: yup
      .string()
      .required("Password is required.")
      .matches(
        /^(?=.*\d{1})(?=.*[a-z]{1})(?=.*[A-Z]{1})(?=.*[!@#$%^&*{|}?~_=+.-]{1})(?=.*[^a-zA-Z0-9])(?!.*\s).{12,16}$/
      ),
    confirmPassword: yup
      .string()
      .required("Confirm password is required.")
      .oneOf([yup.ref("password"), null], "Password don't match."),
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

    try {
      const postAccountResponse = await accountsService.register(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.isAdmin
      );

      console.log("response received:", postAccountResponse);

      if (!postAccountResponse.ok) {
        setRegistrationResponse(postAccountResponse);
      } else {
        navigate("/user-management", { state: { registrationSuccess: true } });
        showRegisterUserModal();
      }

      // console.log("Register response:", postAccountResponse);
    } catch (error) {
      console.error("Error during registration:", error);
    } finally {
      setSubmitting(false);
    }
  };

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

  useEffect(() => {
    if (registrationResponse != null) {
      setTimeout(() => {
        setRegistrationResponse(null);
      }, 5000);
    }
  }, [registrationResponse]);

  return (
    <>
      {registrationResponse != null && registrationResponse.status != 201 && (
        <Alert message={registrationResponse.message} type={"danger"} />
      )}

      <div className="register-user-modal">
        <section className="overlay" onClick={showRegisterUserModal}></section>
        <section className="content">
          <header>
            <button
              onMouseEnter={() => setCloseBthHover(true)}
              onMouseLeave={() => setCloseBthHover(false)}
              onClick={showRegisterUserModal}
            >
              <img
                src={!isCloseBtnHover ? CloseIconBlack : CloseIconWhite}
                alt="close-icon"
              />
            </button>
            <h2>Register New User</h2>
          </header>

          <form onSubmit={handleSubmit(submission)}>
            <fieldset>
              <label htmlFor="first-name">First Name *</label>
              <input
                type="text"
                name="first-name"
                id="first-name"
                required
                placeholder="Enter first name..."
                {...register("firstName")}
              />
              {errors.firstName && <span>{errors.firstName.message}</span>}
            </fieldset>
            <fieldset>
              <label htmlFor="last-name">Last Name *</label>
              <input
                type="text"
                name="last-name"
                id="last-name"
                required
                placeholder="Enter last name..."
                {...register("lastName")}
              />
              {errors.lastName && <span>{errors.lastName.message}</span>}
            </fieldset>
            <fieldset>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                name="email"
                id="email"
                required
                placeholder="Enter email..."
                {...register("email")}
              />
              {errors.email && <span>{errors.email.message}</span>}
            </fieldset>
            <fieldset>
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                name="password"
                id="password"
                required
                placeholder="Enter password..."
                {...register("password")}
              />

              {passwordErrors.length !== 0 && (
                <div className="password-errors-container">
                  <span>Password must contain the following:</span>
                  {passwordErrors.map((error, index) => (
                    <span key={index}>{error}</span>
                  ))}
                </div>
              )}
            </fieldset>
            <fieldset>
              <label htmlFor="confirm-password">Confirm Password *</label>
              <input
                type="password"
                name="confirm-password"
                id="confirm-password"
                required
                placeholder="Enter confirm password..."
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <span>{errors.confirmPassword.message}</span>
              )}
            </fieldset>
            <fieldset>
              <input
                type="checkbox"
                name="is-admin"
                id="is-admin"
                {...register("isAdmin")}
              />
              <label htmlFor="is-admin">
                Click the checkbox if the new user is an admin.
              </label>
            </fieldset>
            <button
              className="submit-button"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting && <RippleLoading />}
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
