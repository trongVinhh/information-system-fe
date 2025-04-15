import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/Dashboard";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CreateAccount from "./pages/CreateAccount";
import FinancePage from "./pages/FinancePage";

function App() {
  return (
    <div className="App">
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<RegisterPage/>} />
                <Route path="/login" element={<LoginPage/>} />
                <Route path="/create-account" element={<CreateAccount/>} />
                <Route path="/finance" element={<FinancePage/>} />
                <Route path="/dashboard" element={<DashboardPage/>} />
                <Route path="/" element={<LoginPage/>} />
            </Routes>
        
        
        </BrowserRouter>

        
    </div>
  );
}

export default App;
