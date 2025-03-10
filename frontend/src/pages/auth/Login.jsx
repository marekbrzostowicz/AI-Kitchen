import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
// import login from "../assets/login.jpg";
import login from "../../assets/login.jpg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      setEmail(location.state.email || "");
      setPassword(location.state.password || "");
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log(data);
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("userId", data.userId);
        // toast.success("Succesfully loggen in");

        navigate("/welcome", { state: { email, password } });
      } else {
        toast.error(`${data.message}`);
      }
    } catch (error) {
      console.error("Error loggin in:", error);
    }
  };

  return (
    <div className="h-screen flex">
      <div className="flex-1 bg-blue flex items-center text-white justify-center">
        <div className="w-[350px] h-[400px] border-2 border-green-200 rounded-[20px] flex flex-col items-center justify-center gap-8 shadow-xl">
          <p className="text-2xl font-black text-green-100">Welcome back</p>
          <form className="flex flex-col gap-2" onSubmit={handleLogin}>
            <p>Email address</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mb-4 rounded text-black p-1 w-[250px]"
            ></input>
            <p>Password</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded text-black p-1"
              required
            ></input>

            <button
              type="submit"
              className="bg-green-500 mt-6 rounded p-1 hover:bg-green-700"
            >
              Sign in
            </button>

            <p className="text-xs text-center">
              Dont have account?&ensp;
              <Link
                className="text-blue-400 hover:text-blue-600"
                to="/register"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
      <div className="flex-1 bg-cover bg-center">
        <img src={login} className="w-full h-full object-cover"></img>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default Login;
