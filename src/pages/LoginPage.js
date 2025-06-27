import "./LoginPage.css";
import { useState } from "react";
import { storeUserData } from "../services/Storage";
import { isAuthenticated } from "../services/Auth";
import { Link, Navigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { supabaseClient } from "../services/Supabase";

export default function LoginPage() {
  const initialStateErrors = {
    email: { required: false },
    password: { required: false },
    custom_error: null,
  };

  const [errors, setErrors] = useState(initialStateErrors);
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const handleInput = (event) => {
    setInputs({ ...inputs, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let errors = initialStateErrors;
    let hasError = false;

    if (inputs.email === "") {
      errors.email.required = true;
      hasError = true;
    }
    if (inputs.password === "") {
      errors.password.required = true;
      hasError = true;
    }

    if (!hasError) {
      setLoading(true);

      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: inputs.email,
          password: inputs.password,
        });
        console.log("Login response:", data, error);

        if (error) {
          errors.custom_error = "Invalid credentials.";
        } else {
          storeUserData(data); // lưu token vào localStorage
        }
      } catch (e) {
        errors.custom_error = "Unexpected error occurred.";
      } finally {
        setLoading(false);
      }
    }

    setErrors({ ...errors });
  };

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div>
      <NavBar />
      <section className="login-block">
        <div className="container">
          <div className="row ">
            <div className="col login-sec">
              <h2 className="text-center">Login Now</h2>
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label className="text-uppercase">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    onChange={handleInput}
                    name="email"
                    placeholder="email"
                  />
                  {errors.email.required && (
                    <span className="text-danger">Email is required.</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="text-uppercase">Password</label>
                  <input
                    className="form-control"
                    type="password"
                    onChange={handleInput}
                    name="password"
                    placeholder="password"
                  />
                  {errors.password.required && (
                    <span className="text-danger">Password is required.</span>
                  )}
                </div>

                <div className="form-group">
                  {loading && (
                    <div className="text-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  )}

                  <span className="text-danger">
                    {errors.custom_error && <p>{errors.custom_error}</p>}
                  </span>

                  <input
                    type="submit"
                    className="btn btn-login float-right"
                    disabled={loading}
                    value="Login"
                  />
                </div>

                <div className="clearfix"></div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
