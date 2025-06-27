import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { logout, isAuthenticated } from "../services/Auth";
import { SmartTableColumnNamesExample } from "../components/SmartTable";


export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "", localId: "" });

  const logoutUser = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated()) {
    //redirect user to dashboard
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <NavBar logoutUser={logoutUser} />
      <main role="main" className="container-fluid mt-5">
        <div className="text-center mt-5">
          <h3>Quản lí tài khoản</h3>
        </div>
        
        {/* Căn giữa bảng */}
        <div className="table-responsive mx-auto" style={{ maxWidth: "90%" }}>
          <SmartTableColumnNamesExample />
        </div>
      </main>
    </div>
  );
}
