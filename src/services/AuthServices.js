import axios from "axios";
import { toast } from "react-toastify";
import { getBookMarkedPosts } from "./PostServices";
const regexPassword =
  /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,14}$/;
const regexEmail = /^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[A-Za-z]+$/;

const validateRegex = (value, regex) => regex.test(value);

export const signUpHandler = async (
  e,
  signUpData,
  setSignUpData,
  setErrorSignup,
  setIsLoggedIn,
  setUser,
  setToken,
  navigate
) => {
  e.preventDefault();
  try {
    if (!validateRegex(signUpData.password, regexPassword)) {
      setErrorSignup({
        hasError: true,
        errorMessage:
          "Password should be 8 to 14 characters long and should have a digit, a special character, one uppercase and one lowercase letter",
      });
      toast.error("Password Not Strong Enough!");
    } else if (!validateRegex(signUpData.email, regexEmail)) {
      setErrorSignup({
        hasError: true,
        errorMessage: "Please enter a valid email",
      });
      toast.error("Please enter a valid email");
    } else if (signUpData.password !== signUpData.confirmPassword) {
      setErrorSignup({
        hasError: true,
        errorMessage: "Password and Confirm Password Should Match",
      });
      setSignUpData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      toast.error("Password and Confirm Password Should Match");
    } else {
      const response = await axios.post("/api/auth/signup", {
        ...signUpData,
      });
      // console.log(response);
      if (response.status === 201) {
        toast.success("SignUp Successful");
        // setErrorSignup({ hasError: false, errorMessage: "" });

        // setting userDetails to local storage
        localStorage.setItem(
          "userDetails",
          JSON.stringify(response.data.createdUser)
        );
        localStorage.setItem("authenticationToken", response.data.encodedToken);

        // setting userDetails to Auth Context
        setIsLoggedIn(true);
        setUser(response.data.createdUser);
        setToken(response.data.encodedToken);
        toast.success("Login Successful");
        navigate("/home");
      }
    }
  } catch (e) {
    const err = e.response.data.errors[0];
    setErrorSignup({ hasError: true, errorMessage: err });
    err.includes("Email Already Exists")
      ? setErrorSignup({
          hasError: true,
          errorMessage: "Account Already exists.",
        })
      : setErrorSignup({ hasError: true, errorMessage: err });
    setSignUpData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  }
};

export const loginHandler = async (
  e,
  username,
  password,
  setUsername,
  setPassword,
  setErrorLogin,
  setIsLoggedIn,
  setBookMarkedPosts,
  setUser,
  setToken,
  navigate
) => {
  e.preventDefault();
  try {
    const response = await axios.post("/api/auth/login", {
      username,
      password,
    });

    if (response.status === 200) {
      toast.success("Login Successful");

      // setting userDetails to local storage
      localStorage.setItem(
        "userDetails",
        JSON.stringify(response.data.foundUser)
      );
      localStorage.setItem("authenticationToken", response.data.encodedToken);

      // setting userDetails to Auth Context
      setIsLoggedIn(true);
      setUser(response.data.foundUser);
      setToken(response.data.encodedToken);

      getBookMarkedPosts(setBookMarkedPosts);

      navigate("/home");

      setErrorLogin({ hasError: false, errorMessage: "" });
      setUsername("");
      setPassword("");
    }
  } catch (e) {
    console.error(e);
    const err = e.response.data.errors[0];
    setErrorLogin({
      hasError: true,
      errorMessage: err.includes("The email you entered is not Registered")
        ? "Email Not Registered"
        : err,
    });
  }
};

export const logoutHandler = (setUser, setToken, setIsLoggedIn) => {
  localStorage.removeItem("authenticationToken");
  localStorage.removeItem("userDetails");
  setToken(null);
  setUser(null);
  setIsLoggedIn(false);
  localStorage.removeItem("userDetails");
  localStorage.removeItem("authenticationToken");
  toast.success("Logged Off Successfully");
};

export const updateUser = async (setUser, updatedUserData) => {
  try {
    const response = await axios.post(
      "/api/users/edit",
      { userData: updatedUserData },
      {
        headers: { authorization: localStorage.getItem("authenticationToken") },
      }
    );
    if (response.status === 201) {
      setUser(response.data.user);
      toast.success("Updated Profile");
    }
  } catch (err) {
    console.error(err);
  }
};
