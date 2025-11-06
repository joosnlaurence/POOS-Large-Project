import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import PasswordResetPage from "./pages/PasswordResetPage";
import VerifySuccessPage from "./pages/VerifySuccessPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route path="/verify/success" element={<VerifySuccessPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
