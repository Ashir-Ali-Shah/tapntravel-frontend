/* eslint-disable no-unused-vars */
import { apiBaseUrl } from "./setting";

export const addBus = async (busData) => {
    try{
      const response = await fetch(`${apiBaseUrl}/bus/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,

        },
        body: JSON.stringify(busData),
      });
  
      const data = await response.json(); // Parse the JSON directly
      console.log("Parsed JSON data:", data);
  
      if (response.ok) {
        return { success: true, data }; // Return the success flag and data
      }
    }
      catch(err){
        return { success: false, data: "Error adding bus" };
      } 
  };

// api.js

export const fetchBusById = async (busId) => {
    const response = await fetch(`${apiBaseUrl}/bus/${busId}`);
    if (!response.ok) throw new Error('Failed to fetch bus');
    return response.json();
  };
  
  export const updateBus = async (busId, data) => {
    const response = await fetch(`${apiBaseUrl}/bus/${busId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) throw new Error('Failed to update bus');
    return response.json();
  };
  