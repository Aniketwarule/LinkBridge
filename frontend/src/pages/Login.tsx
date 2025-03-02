import { useState } from "react";
import { User, Lock, LogIn, Loader2, Eye, EyeOff, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSetRecoilState } from "recoil";
import { userState } from "../store/atoms/user";
import { BaseUrl } from "../App";

function Login() {
  const [identifier, setIdentifier] = useState(""); // Username or Company Name
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [organizationLogin, setOrganizationLogin] = useState(false); // Toggle between user and company login
  
  const setUser = useSetRecoilState(userState);
  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const endpoint = organizationLogin ? "auth/company/login" : "auth/login"; // Switch endpoint
      const res = await axios.post(`${BaseUrl}/${endpoint}`, {
        identifier, // Can be username or company name
        password,
      });

      if (res.data) {
        setUser({
          userName: identifier,
          isLoading: false,
          isCompany: organizationLogin, // Store whether it's a company login
        });

        localStorage.setItem("token", "Bearer " + res.data.token);
        navigate(organizationLogin ? "/company/dashboard" : "/feed");
      }
    } catch (error) {
      setErrorMessage("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const setnew = () => {
    setOrganizationLogin(!organizationLogin);
    setIdentifier("");
    setPassword("");
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            {organizationLogin ? (
              <Building className="w-8 h-8 text-indigo-600" />
            ) : (
              <LogIn className="w-8 h-8 text-indigo-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {organizationLogin ? "Company Login" : "Welcome Back"}
          </h1>
          <p className="text-gray-500 mt-2">
            {organizationLogin
              ? "Sign in to your company account"
              : "Please sign in to your account"}
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
              {organizationLogin ? "Company Name" : "Username"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {organizationLogin ? (
                  <Building className="h-5 w-5 text-gray-400" />
                ) : (
                  <User className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={organizationLogin ? "Enter your company name" : "Enter your username"}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
              loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
          </button>
        </form>
      </div>

      {/* Organization Toggle */}
      <div className="text-center">
        <p className="text-gray-600 text-sm">Are you a company?</p>
        <button
          onClick={setnew}
          className="mt-2 text-indigo-600 font-semibold hover:underline"
        >
          {organizationLogin ? "Switch to User Login" : "Switch to Company Login"}
        </button>
      </div>
    </div>
  );
}

export default Login;