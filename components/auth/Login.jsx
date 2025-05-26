/* eslint-disable no-unused-vars */
import { FaBus, FaEye, FaEyeSlash } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginAdmin } from "../apis/AuthenticationApi";
import { useState } from "react";
import Loader from "../utils/Loader";
import { useDispatch } from "react-redux";
import { initializeStore } from "../../store/initializeStore";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);  // ← new
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = { email, password };
    try {
      const result = await loginAdmin(data);
      if (result.success) {
        const { data } = result;
        window.localStorage.setItem("token", data.token);
        await initializeStore(dispatch);
        setIsLoading(false);
        toast.success(data.message);
        navigate("/");
      } else {
        setIsLoading(false);
        toast.error(result.message);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="px-4 lg:px-0 grid grid-cols-1 md:grid-cols-2 h-screen bg-main overflow-hidden">
      <div className="hidden md:block">
        <div className="h-full flex justify-center items-center">
          <img
            src="https://www.freeiconspng.com/uploads/bus-png-4.png"
            className="object-cover w-full"
            alt="quiz-mine"
          />
        </div>
      </div>

      <div className="flex justify-center items-center">
        <form
          className="border-2 border-primary rounded-lg p-5 w-full lg:w-2/3"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-center mb-2">
            <FaBus className="text-3xl text-primary mr-2" />
            <span className="text-3xl font-bold text-primary">
              Tap & Travel
            </span>
          </div>
          <h2 className="text-xl italic font-bold text-center mb-6">
            Journey Bright, Day or Night
          </h2>

          <div className="mb-4">
            <label htmlFor="email" className="block font-bold text-lg mb-1">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full border-2 border-ternary_light rounded-full px-4 py-2 focus:border-primary focus:outline-none"
              placeholder="Enter Your Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block font-bold text-lg mb-1">
              Password:
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}  // ← toggle type
                id="password"
                name="password"
                className="w-full border-2 border-ternary_light rounded-full px-4 py-2 pr-10 focus:border-primary focus:outline-none"
                placeholder="Enter Your Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary border-2 border-primary rounded-full py-2 text-main text-xl"
          >
            {isLoading ? <Loader /> : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
