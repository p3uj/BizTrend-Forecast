import Navbar from "../components/NavBar";
import "../css/AccountDetails.css";
import DefaultProfile from "../assets/img/default-profile.svg";
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
import websocketService from "../services/websocketService";

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
  const [isUpdateSuccess, setUpdateSuccess] = useState(null);
  const [hasChange, setHasChange] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [changeProfileResStatus, setChangeProfileResStatus] = useState(null);
  const [isSubmittingProfile, setSubmittingProfile] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const maskEmail = (email) => {
    const [user, domain] = email.split("@");
    const maskedUser = user[0] + "*".repeat(user.length - 1);
    return `${maskedUser}@${domain}`;
  };

  const handleFileUpload = (event) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      setFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFile(null);
      setPreviewImage(null);
    }
  };

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
    },
    mode: "all",
  });

  const watchFirstName = watch("firstName", "");
  const watchLastName = watch("lastName", "");
  useEffect(() => {
    // Trim values to eliminate leading/trailing whitespace
    const trimmedFirstName = watchFirstName.trim();
    const trimmedLastName = watchLastName.trim();

    // Ensure both fields contain meaningful content
    const isFirstNameValid = trimmedFirstName !== "";
    const isLastNameValid = trimmedLastName !== "";

    // Check if the trimmed values differ from the original user info
    const hasFirstNameChanged = trimmedFirstName !== userInfo.firstName;
    const hasLastNameChanged = trimmedLastName !== userInfo.lastName;

    // Only flag change if both fields are non-empty and at least one has changed
    const shouldFlagChange =
      isFirstNameValid &&
      isLastNameValid &&
      (hasFirstNameChanged || hasLastNameChanged);

    // Update hasChange state based on evaluation
    setHasChange(shouldFlagChange);
  }, [watchFirstName, watchLastName, userInfo]);

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
        setUpdateSuccess(response);
      } else {
        console.log("going to update user info...");
        // Update the current user stored in the session storage
        updateUserInfo();
        setIsLoading(false);
        setUpdateSuccess(response);
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

    // Update local state with new user info
    setUserInfo({
      id: getCurrentUser.id,
      firstName: getCurrentUser.first_name,
      lastName: getCurrentUser.last_name,
      email: getCurrentUser.email,
      is_superuser: getCurrentUser.is_superuser,
      profile: getCurrentUser.profile_picture,
    });
  };

  useEffect(() => {
    if (isUpdateSuccess != null) {
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 5000);
    }
  }, [isUpdateSuccess]);

  // Set up WebSocket event listeners for real-time profile updates
  useEffect(() => {
    const currentUserId = JSON.parse(sessionStorage.getItem("current_user")).id;

    const handleProfileUpdated = (data) => {
      console.log("Profile updated via WebSocket:", data);
      // Only update if it's the current user's profile
      if (data.user_id === currentUserId) {
        updateUserInfo();
        setUpdateSuccess(200);
      }
    };

    const handleUserUpdated = (data) => {
      console.log("User updated via WebSocket:", data);
      // Only update if it's the current user
      if (data.user_id === currentUserId) {
        updateUserInfo();
        setUpdateSuccess(200);
      }
    };

    // Register WebSocket event listeners
    websocketService.onProfileUpdated(handleProfileUpdated);
    websocketService.onUserUpdated(handleUserUpdated);

    // Cleanup on component unmount
    return () => {
      websocketService.removeEventListener(
        "profile_updated",
        handleProfileUpdated
      );
      websocketService.removeEventListener("user_updated", handleUserUpdated);
    };
  }, []);

  return (
    <>
      {isUpdateSuccess === 200 && (
        <Alert message={"Successfully Updated!"} type={"success"} />
      )}

      {isUpdateSuccess != 200 && isUpdateSuccess != null && (
        <Alert
          message={"Unable to update information. Please try again!"}
          type={"danger"}
        />
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
              <h4>{userInfo.firstName + " " + userInfo.lastName}</h4>
              <img
                src={
                  userInfo.profile
                    ? `http://127.0.0.1:8000${userInfo.profile}`
                    : DefaultProfile
                }
                alt="profile-picture"
              />
            </div>
          </div>
        </section>
        <section>
          <section className="left-panel">
            <img
              src={
                previewImage
                  ? previewImage
                  : userInfo.profile
                  ? `http://127.0.0.1:8000${userInfo.profile}`
                  : DefaultProfile
              }
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
                className="submit-button"
              >
                {isSubmittingProfile && <RippleLoading />}
                {isSubmittingProfile ? "Saving..." : "Save Profile Change"}
              </button>
            )}

            <form action={handleSubmit(submission)}>
              <fieldset>
                <label htmlFor="first-name">First name</label>
                <input
                  type="text"
                  name="first-name"
                  id="first-name"
                  defaultValue={userInfo.firstName}
                  {...register("firstName")}
                />
              </fieldset>
              <fieldset>
                <label htmlFor="last-name">Last name</label>
                <input
                  type="text"
                  name="last-name"
                  id="last-name"
                  defaultValue={userInfo.lastName}
                  {...register("lastName")}
                />
              </fieldset>
              <button
                type="submit"
                className="submit-button"
                disabled={!hasChange || isSubmitting}
              >
                {isSubmitting && <RippleLoading />}
                Save Change
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
