import React, { useState } from "react";
import * as Yup from "yup";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import { signupSchema } from "../../../shared/config/yupConfig";
import { comments } from "../../../shared/constants/comments";

const UserSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "error"
  );

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emptyField = Object.keys(formData).find(
      (key) => formData[key as keyof typeof formData].trim() === ""
    );

    if (emptyField) {
      setSnackbarMessage(comments.ALL_FIELDS_REQ);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      await signupSchema.validate(formData, { abortEarly: false });
      setSnackbarMessage(comments.SIGNUP_SUCC);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      console.log(comments.SIGNUP_SUCC, formData);
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        setSnackbarMessage(err.errors[0]);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };

  return (
    <div className="auth-section">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        <button type="submit">Sign Up</button>
      </form>

      {/* Snackbar for error/success messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserSignup;
