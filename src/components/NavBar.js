import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { isAuthenticated } from "../services/Auth";
import { Button } from "antd";
import axios from "axios";
import "./NavBar.css";
import { supabaseClient } from "../services/Supabase";
import { getUserId } from "../services/Storage";

export default function NavBar(props) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchUserDetails();
    }
  }, []);

  const fetchUserDetails = async () => {
    try {
      const response = await supabaseClient.from("users").select("name", "email").eq("email", getUserId()).single();
      console.log("User details:", response.data);
      setUser(response.data);
    } catch (error) {
      console.error("Lỗi lấy thông tin user:", error);
    }
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark px-3 position-relative">
      
      <a className="navbar-brand" href="#">
        E-Life
      </a>

      {/* Nút toggler mở menu khi màn hình nhỏ */}
      <button
        className="navbar-toggler"
        type="button"
        onClick={() => setIsNavOpen(!isNavOpen)}
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className={`collapse navbar-collapse ${isNavOpen ? "show" : ""}`}>
        <ul className="navbar-nav ms-auto">
          {!isAuthenticated() ? (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/register">
                  Register
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Login
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  Tài khoản
                </Link>
              </li>
              
              {user && (
                <li className="nav-item nav-custom">
                  <span className="nav-link text-white">
                    Xin chào, {user.name}
                  </span>
                </li>
              )}
              {/* Đặt Logout ở góc phải khi màn hình lớn */}
              <div
                className={`logout-container ${
                  isNavOpen ? "static" : "absolute"
                }`}
              >
                <Button
                  type="link"
                  className="nav-link text-danger"
                  onClick={props.logoutUser}
                >
                  Đăng xuất
                </Button>
              </div>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
