/* eslint-disable no-unused-vars */
import { apiBaseUrl } from "./setting";


//login Admin
export const loginAdmin = async (adminData) => {
    try {
      const response = await fetch(`${apiBaseUrl}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminData),
      });
  
      const data = await response.json(); // Parse the JSON directly
      console.log("Parsed JSON data:", data);
  
      if (response.ok && data.token) {
        localStorage.setItem("token", data.token); // Store the token
        return { success: true, data }; // Return the success flag and data
      } else {
        console.error("Login failed", data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Error while logging in:", err.message);
      return { success: false, message: err.message };
    }
  };