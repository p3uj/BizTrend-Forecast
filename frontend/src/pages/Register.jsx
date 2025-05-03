import "../css/Register.css";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import AxiosInstance from "../components/AxiosInstance";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [passwordErrors, setPasswordErrors] = useState([]);

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .required("Email is required.")
      .email("Invalid email format.")
      .matches(/^\S+@\S+\.\S+$/, "Invalid email format."),
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
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
  });

  const submission = (data) => {
    console.log(data);
    AxiosInstance.post("register/", {
      email: data.email,
      password: data.confirmPassword,
    }).then(() => {
      navigate("/login");
    });
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

  return (
    <main className="register-page">
      <form onSubmit={handleSubmit(submission)}>
        <fieldset>
          <label htmlFor="email">Email:</label>

          {errors.email && <span>{errors.email.message}</span>}

          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter email..."
            {...register("email")}
          />
        </fieldset>
        <fieldset>
          <label htmlFor="password">Password:</label>

          {passwordErrors.length !== 0 && (
            <div className="password-errors-container">
              <span>Password must contain the following:</span>
              {passwordErrors.map((error, index) => (
                <span key={index}>{error}</span>
              ))}
            </div>
          )}

          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter password..."
            {...register("password")}
          />
        </fieldset>
        <fieldset>
          <label htmlFor="confirm-password">Confirm Password:</label>

          {errors.confirmPassword && (
            <span>{errors.confirmPassword.message}</span>
          )}

          <input
            type="password"
            name="confirm-password"
            id="confirm-password"
            placeholder="Enter confirm password..."
            {...register("confirmPassword")}
          />
        </fieldset>
        <button type="submit">Create Account</button>
      </form>
    </main>
  );
}
