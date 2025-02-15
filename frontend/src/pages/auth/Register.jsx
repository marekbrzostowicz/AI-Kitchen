import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");

      return;
    }

    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("User registered successfully!");
        setTimeout(
          () => navigate("/login", { state: { email, password } }),
          2000
        );
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      // <toast className="error"></toast>("Error during registration");
    }
  };

  return (
    <div className="h-screen flex">
      <div className="flex-1 bg-blue flex items-center text-white justify-center">
        <div className="w-[400px] h-auto border-2 border-green-200 rounded-[20px] flex flex-col items-center justify-center gap-8 shadow-xl p-6">
          <p className="text-2xl font-black text-green-100">Register</p>
          <form
            className="flex flex-col gap-4 w-full"
            onSubmit={handleRegister}
          >
            <div className="flex flex-col gap-1">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded text-black  border border-gray-300 p-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="rounded text-black  border border-gray-300 p-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded text-black  border border-gray-300 p-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="rounded text-black  border border-gray-300 p-1"
              />
            </div>

            <button
              type="submit"
              className="bg-green-500 mt-6 rounded p-2 hover:bg-green-700 w-full text-white font-bold"
            >
              Register
            </button>

            <p className="text-xs text-center mt-4">
              Already have an account?&ensp;
              <Link to="/login" className="text-blue-400 hover:text-blue-600">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default Register;
