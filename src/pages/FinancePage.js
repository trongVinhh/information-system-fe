import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { UserDetailsApi, UserSheetInfoApi } from "../services/Api";
import { logout, isAuthenticated } from "../services/Auth";
import FinanceTable from "../components/FinanceTable";

export default function FinancePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "" });
  const [userSheetInfo, setUserSheetInfo] = useState({});

  useEffect(() => {
    if (isAuthenticated()) {
      UserDetailsApi().then((response) => {
        setUser({ name: response.data.name, email: response.data.email });
      });

    }
  }, []);

  const logoutUser = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <NavBar logoutUser={logoutUser} />
      <main role="main" className="container-fluid mt-5">
        <div className="text-center mt-5">
          <h3>Quản lí tài chính</h3>
        </div>

        {/* Bảng dữ liệu */}
        <div className="table-container">
          <FinanceTable />
        </div>
      </main>
    </div>
  );
}
