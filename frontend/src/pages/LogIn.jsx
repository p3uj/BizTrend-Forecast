import "../css/custom-colors.css";
import "../css/LogIn.css";
import logInImage from "../assets/img/login.png";
import logo from "../assets/img/Logo-black-color.svg";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import authService from "../services/authService";
import RippleLoading from "../components/modals/loading/RippleLoading";
import Alert from "../components/modals/Alert";
import EyeOpen from "../assets/icons/eye-open.svg";
import EyeClose from "../assets/icons/eye-close.svg";

function LogIn() {
  const navigate = useNavigate();
  const [isSubmitting, setSubmitting] = useState(false);
  const [isInvalidCredentials, setInvalidCredentials] = useState(null);
  const [isShowPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isInvalidCredentials) {
      setTimeout(() => {
        setInvalidCredentials(false);
      }, 5000);
    }
  }, [isInvalidCredentials]);

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .required("Must not empty.")
      .email("Invalid email format.")
      .matches(/^\S+@\S+\.\S+$/, "Invalid email format."),
    password: yup.string().required("Must not empty."),
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

  const watchPassword = watch("password", "");

  const submission = async (data) => {
    setSubmitting(true);
    try {
      const success = await authService.login(data.email, data.password);

      if (success) {
        console.log("Login successfully!");

        navigate("/home");
      } else {
        setInvalidCredentials(true);
      }
    } catch (error) {
      console.log("login failed!", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {isInvalidCredentials && (
        <Alert message="Invalid credentials." type="danger" />
      )}

      <main className="login-page">
        <section className="left-panel">
          <img src={logInImage} alt="log-in" />
        </section>
        <section className="right-panel">
          <img src={logo} alt="logo" />
          <form onSubmit={handleSubmit(submission)}>
            <fieldset>
              <label htmlFor="email">Email:</label>

              {/* Display error for invalid email format if the email does not have '@' */}
              {/* {!requiredFieldsData.email.includes("@") &&
              requiredFieldsData.email != "" && <span>Invalid format.</span>} */}
              {errors.email && <span>{errors.email.message}</span>}

              <input
                type="email"
                name="email"
                id="email"
                required
                placeholder="Enter email"
                // onChange={handleValueFields}
                {...register("email")}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="password">Password:</label>

              {errors.password && <span>{errors.password.message}</span>}

              <input
                type={isShowPassword ? "text" : "password"}
                name="password"
                id="password"
                required
                placeholder="Enter password"
                // onChange={handleValueFields}
                {...register("password")}
              />

              {watchPassword.length > 0 && (
                <img
                  src={isShowPassword ? EyeOpen : EyeClose}
                  alt="eye"
                  onClick={() => setShowPassword(!isShowPassword)}
                />
              )}
            </fieldset>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="submit-button"
            >
              {isSubmitting && <RippleLoading />}
              {isSubmitting ? "Verifying..." : "Log In"}
            </button>
          </form>
          <a onClick={() => navigate("/reset-password")}>Forgot Password?</a>
        </section>
      </main>
    </>
  );
}

export default LogIn;
