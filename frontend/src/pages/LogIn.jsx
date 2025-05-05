import "../css/custom-colors.css";
import "../css/LogIn.css";
import logInImage from "../assets/img/login.png";
import logo from "../assets/img/logo.png";
import { useEffect, useState } from "react";
import { data, useNavigate } from "react-router-dom";
import { set, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import AxiosInstance from "../components/AxiosInstance";
import authService from "../services/authService";

function LogIn() {
  const navigate = useNavigate();
  const [isFieldsValid, setFieldsValid] = useState(false);
  const [isInvalidCredentials, setInvalidCredentials] = useState(null);

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
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
  });

  const submission = async (data) => {
    try {
      const success = await authService.login(data.email, data.password);

      if (success) {
        console.log("Login successfully!");
        setInvalidCredentials(false);

        navigate("/home");
      } else {
        setInvalidCredentials(true);
      }
    } catch (error) {
      console.log("login failed!", error);
    }
  };

  const [requiredFieldsData, setRequiredFieldsData] = useState({
    email: "",
    password: "",
  });

  const handleValueFields = (event) => {
    const { name, value } = event.target; // Destructures name and value from the input event.
    setRequiredFieldsData((prevData) => ({
      ...prevData, // Keep all existing value
      [name]: value, // Update the field that changed.
    }));
  };

  // Validate the required input fields.
  const isRequiredFieldValid =
    requiredFieldsData.email.includes("@") && requiredFieldsData.password != "";

  return (
    <main className="login-page">
      <section className="left-panel">
        <img src={logInImage} alt="log-in" />
      </section>
      <section className="right-panel">
        {isInvalidCredentials != null && isInvalidCredentials && (
          <span>Invalid Credentials!</span>
        )}
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
              type="password"
              name="password"
              id="password"
              required
              placeholder="Enter password"
              // onChange={handleValueFields}
              {...register("password")}
            />
          </fieldset>

          <button type="submit" disabled={!isValid}>
            Log In
          </button>
        </form>
        <a href="#">Forgot Password?</a>
        <a onClick={() => navigate("/register")}>Create new account</a>
      </section>
    </main>
  );
}

export default LogIn;
