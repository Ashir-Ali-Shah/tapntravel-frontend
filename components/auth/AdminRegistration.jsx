import React, { useState } from "react";
import { FaBus } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons for password visibility
import toast from "react-hot-toast";
import { apiBaseUrl } from "../apis/setting";
import Loader from "../utils/Loader";

function AdminRegistration() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to track password visibility
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "Password123!",
    company: "",
    role: "admin",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token"); // Ensure you have the token
      const response = await fetch(`${apiBaseUrl}/admin/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          company: formData.company,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register admin");
      }

      const data = await response.json();
      toast.success("Admin registered successfully!");
      console.log("Registered Admin:", data);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center m-3 w-2/4">
      <form
        onSubmit={handleSubmit}
        className="border-primary border-solid border-2 w-full rounded-lg h-fit m-3 px-4 lg:px-10 py-5 bg-main"
      >
        <div className="flex items-center justify-center">
          <FaBus className="text-2xl text-primary mr-2" />
          <span className="text-primary text-2xl text-center font-bold mb-0.5">
            Tap & Travel
          </span>
        </div>
        <h2 className="text-xl italic font-bold text-center mb-0.5">
          Journey Bright, Day or Night
        </h2>

        <div className="mb-1 flex flex-col">
          <label htmlFor="full-name" className="font-bold text-lg">
            Full Name :
          </label>
          <input
            type="text"
            placeholder="Full Name"
            id="full-name"
            className="border-ternary_light w-full border-solid border-2 rounded-full px-4 py-1 focus:border-primary focus:outline-none"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-1 flex flex-col">
          <label htmlFor="role" className="font-bold text-lg">
            Role:
          </label>
          <select
            className="border-ternary_light w-full border-solid border-2 rounded-full px-4 py-1 focus:border-primary focus:outline-none"
            id="options"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="option1">Admin</option>
            <option value="option2">User</option>
          </select>
        </div>

        <div className="mb-1 flex flex-col">
          <label htmlFor="email" className="font-bold text-lg">
            Email :
          </label>
          <input
            className="border-ternary_light border-solid border-2 rounded-full px-4 py-1 focus:border-primary focus:outline-none"
            type="email"
            id="email"
            name="email"
            required
            placeholder="Enter Your Email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="mb-1 flex flex-col">
          <label htmlFor="password" className="font-bold text-lg">
            Password :
          </label>
          <div className="relative">
            <input
              className="border-ternary_light border-solid border-2 rounded-full px-4 py-1 w-full focus:border-primary focus:outline-none"
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="mb-1 flex flex-col">
          <label htmlFor="company-name" className="font-bold text-lg">
            Company Name :
          </label>
          <input
            className="border-ternary_light border-solid border-2 rounded-full px-4 py-1 focus:border-primary focus:outline-none"
            name="company"
            id="company-name"
            placeholder="Company Name"
            value={formData.company}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <div className="bg-primary my-2 border-2 border-solid rounded-full px-4 py-1 text-main text-xl w-full">
            <button className="text-main text-lg w-full" type="submit">
              {loading ? <Loader /> : "Register Company"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AdminRegistration;
