import Navbar from "../components/NavBar";
import "../css/AccountDetails.css";
import DefaultProfile from "../assets/img/default-profile.svg";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import accountsService from "../services/accountsService";
import RippleLoading from "../components/modals/loading/RippleLoading";
import Alert from "../components/modals/Alert";
import authService from "../services/authService";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import websocketService from "../services/websocketService";
import dateRelated from "../utils/dateRelated";

export default function AccountDetails() {
  const savedUser = JSON.parse(sessionStorage.getItem("current_user")) || null;
  const account_date_created =
    sessionStorage.getItem("account_created_date") || null;

  const [userInfo, setUserInfo] = useState({
    id: savedUser?.id || null,
    firstName: savedUser?.first_name || "",
    lastName: savedUser?.last_name || "",
    email: savedUser?.email || "",
    is_superuser: savedUser?.is_superuser || null,
    profile: savedUser?.profile_picture || null,
  });
  const [isUpdateSuccess, setUpdateSuccess] = useState(null);
  const [hasChange, setHasChange] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [changeProfileResStatus, setChangeProfileResStatus] = useState(null);
  const [isSubmittingProfile, setSubmittingProfile] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUpdatingSessionStorage, setUpdatingSessionStorage] = useState(false);

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

    // console.log("data:", data);
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
      setFile(null);
      setPreviewImage(null);
    }
  };

  const updateUserInfo = async () => {
    setUpdatingSessionStorage(true);
    const getCurrentUser = await authService.getCurrentUser();

    // Create a copy without 'date_created'
    const { date_created, ...filteredUser } = getCurrentUser;

    // Update current_user in the session storage.
    sessionStorage.setItem("current_user", JSON.stringify(filteredUser));

    console.log("updating user info in session storage!");
    // Update local state with new user info
    setUserInfo({
      id: getCurrentUser.id,
      firstName: getCurrentUser.first_name,
      lastName: getCurrentUser.last_name,
      email: getCurrentUser.email,
      is_superuser: getCurrentUser.is_superuser,
      profile: getCurrentUser.profile_picture,
    });
    console.log("Successfully updated the user info in the session storage!");

    // Dispatch custom event to notify other components (like NavBar) about the profile update
    const profileUpdateEvent = new CustomEvent("userProfileUpdated", {
      detail: {
        user: filteredUser,
        timestamp: new Date().toISOString(),
      },
    });
    window.dispatchEvent(profileUpdateEvent);
    console.log("Dispatched userProfileUpdated event");

    setUpdatingSessionStorage(false);
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
    const currentUserData = JSON.parse(sessionStorage.getItem("current_user"));
    const currentUserId = currentUserData
      ? JSON.parse(sessionStorage.getItem("current_user")).id
      : null;

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
                    ? `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${userInfo.profile}`
                    : DefaultProfile
                }
                alt="profile-picture"
              />
            </div>
          </div>
        </section>
        <section>
          <section className="left-panel">
            {isUpdatingSessionStorage ? (
              <Skeleton
                height={100}
                width={100}
                circle
                style={{ borderRadius: "50%" }}
              />
            ) : (
              <img
                src={
                  previewImage
                    ? previewImage
                    : userInfo.profile
                    ? `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${userInfo.profile}`
                    : DefaultProfile
                }
                alt=""
              />
            )}

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

                {isUpdatingSessionStorage ? (
                  <div style={{ width: "100%" }}>
                    <Skeleton
                      height={44}
                      style={{ borderRadius: "40px", width: "100%" }}
                    />
                  </div>
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

                {isUpdatingSessionStorage ? (
                  <div style={{ width: "100%" }}>
                    <Skeleton
                      height={44}
                      style={{ borderRadius: "40px", width: "100%" }}
                    />
                  </div>
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

              {isUpdatingSessionStorage ? (
                <div style={{ width: "100%" }}>
                  <Skeleton
                    height={44}
                    style={{
                      borderRadius: "40px",
                      width: "100%",
                    }}
                  />
                </div>
              ) : (
                <button
                  type="submit"
                  className="submit-button"
                  disabled={!hasChange || isSubmitting}
                >
                  {isSubmitting && <RippleLoading />}
                  Save Change
                </button>
              )}
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
                value={userInfo.email != "" ? maskEmail(userInfo.email) : ""}
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
                value={
                  account_date_created != null
                    ? dateRelated.formatDateWithTime(account_date_created)
                    : ""
                }
                disabled
              />
              {/* {isUpdatingSessionStorage ? (
                <div style={{ width: "100%" }}>
                  <Skeleton
                    height={44}
                    style={{ borderRadius: "40px", width: "100%" }}
                  />
                </div>
              ) : (

              )} */}
            </fieldset>
          </section>
        </section>
      </main>
    </>
  );
}
