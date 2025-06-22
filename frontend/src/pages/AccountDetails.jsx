import Navbar from "../components/NavBar";
import "../css/AccountDetails.css";
import SampleProfile from "../assets/img/do.png";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import accountsService from "../services/accountsService";
import RippleLoading from "../components/modals/loading/rippleLoading";
import Alert from "../components/modals/Alert";
import authService from "../services/authService";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import Image from "../../../backend/profile_pictures/708e74b232a8b32bc86d14314197b84f.jpg";

export default function AccountDetails() {
  const [userInfo, setUserInfo] = useState({
    id: JSON.parse(sessionStorage.getItem("current_user")).id,
    firstName: JSON.parse(sessionStorage.getItem("current_user")).first_name,
    lastName: JSON.parse(sessionStorage.getItem("current_user")).last_name,
    email: JSON.parse(sessionStorage.getItem("current_user")).email,
    is_superuser: JSON.parse(sessionStorage.getItem("current_user"))
      .is_superuser,
    profile: JSON.parse(sessionStorage.getItem("current_user")).profile_picture,
  });
  const [isUpdateSuccess, setUpdateSuccess] = useState(false);
  const [hasChange, setHasChange] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [changeProfileResStatus, setChangeProfileResStatus] = useState(null);
  const [isSubmittingProfile, setSubmittingProfile] = useState(false);

  const maskEmail = (email) => {
    const [user, domain] = email.split("@");
    const maskedUser = user[0] + "*".repeat(user.length - 1);
    return `${maskedUser}@${domain}`;
  };

  const handleFileUpload = (event) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      setFile(file);
    } else {
      setFile(null);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    // resolver: yupResolver(validationSchema),
    mode: "all",
  });

  const submission = async (data) => {
    setIsLoading(true);
    setSubmitting(true);

    console.log("data:", data);
    try {
      const response = await accountsService.updateUserInfo(
        JSON.parse(sessionStorage.getItem("current_user")).id,
        data.firstName,
        data.lastName
      );

      console.log("response received:", response);

      if (!response === 200) {
        console.log("failed to update user info", response);
        setUpdateSuccess(false);
      } else {
        console.log("going to update user info...");
        // Update the current user stored in the session storage
        updateUserInfo();
        setIsLoading(false);
        setUpdateSuccess(true);
      }
    } catch (error) {
      console.log("Failed to update user info!", error);
    } finally {
      setSubmitting(false);
    }
  };

  const changeProfileSubmission = async (userId, file) => {
    setSubmittingProfile(true);
    const response = await accountsService.updateProfile(userId, file);

    if (!response === 200) {
      console.log("failed to update user profile picture", response);
      setChangeProfileResStatus(response);
    } else {
      console.log("going to update user profile picture...");
      // Update the current user stored in the session storage
      updateUserInfo();
      setChangeProfileResStatus(response);
      setSubmittingProfile(false);
    }
  };

  const updateUserInfo = async () => {
    const getCurrentUser = await authService.getCurrentUser();
    sessionStorage.setItem("current_user", JSON.stringify(getCurrentUser));
  };

  useEffect(() => {
    if (isUpdateSuccess) {
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 5000);
    }
  }, [isUpdateSuccess]);

  return (
    <>
      {isUpdateSuccess && (
        <Alert message={"Successfully Updated!"} type={"success"} />
      )}

      {changeProfileResStatus === 200 && (
        <Alert
          message={"Successfully changed profile picture!"}
          type={"success"}
        />
      )}

      <Navbar />
      <main className="account-details">
        <section>
          <div className="title-page">
            <h1>Account Profile</h1>
            <div className="profile-container">
              <h4>
                {isLoading ? (
                  <Skeleton height={20} width={100} />
                ) : (
                  userInfo.firstName + " " + userInfo.lastName
                )}
              </h4>
              <img
                src={userInfo.profile ? userInfo.profile : SampleProfile}
                alt=""
              />
            </div>
          </div>
        </section>
        <section>
          <section className="left-panel">
            <img
              src={userInfo.profile ? userInfo.profile : SampleProfile}
              alt=""
            />

            <input
              type="file"
              name="profile"
              id="profile"
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleFileUpload}
            />

            {file === null && (
              <label htmlFor="profile">Change Profile Picture</label>
            )}

            {file != null && (
              <button
                onClick={() => changeProfileSubmission(userInfo.id, file)}
                disabled={isSubmittingProfile}
              >
                {isSubmittingProfile && <RippleLoading />}
                Save Profile Change
              </button>
            )}

            <form action={handleSubmit(submission)}>
              <fieldset>
                <label htmlFor="first-name">First name</label>
                {isLoading ? (
                  <Skeleton height={40} width={200} borderRadius={40} />
                ) : (
                  <input
                    type="text"
                    name="first-name"
                    id="first-name"
                    defaultValue={userInfo.firstName}
                    {...register("firstName")}
                  />
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="last-name">Last name</label>
                {isLoading ? (
                  <Skeleton height={40} width={200} borderRadius={40} />
                ) : (
                  <input
                    type="text"
                    name="last-name"
                    id="last-name"
                    defaultValue={userInfo.lastName}
                    {...register("lastName")}
                  />
                )}
              </fieldset>
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting && <RippleLoading />}
                Save Changes
              </button>
            </form>
          </section>
          <section className="right-panel">
            <h2>Account Overview</h2>
            <fieldset>
              <label htmlFor="email">Email:</label>
              <input
                type="text"
                name="email"
                id="email"
                value={maskEmail(userInfo.email)}
                disabled
              />
            </fieldset>
            <fieldset>
              <label htmlFor="role">Role:</label>
              <input
                type="text"
                name="role"
                id="role"
                value={userInfo.is_superuser ? "Admin" : "Operator"}
                disabled
              />
            </fieldset>
            <fieldset>
              <label htmlFor="date-created">Date Created:</label>
              <input
                type="text"
                name="date-created"
                id="date-created"
                placeholder="2024-01-01"
                disabled
              />
            </fieldset>
          </section>
        </section>
      </main>
    </>
  );
}
