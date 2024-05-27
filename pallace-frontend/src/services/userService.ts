import axios from "axios";

const API_URL = "http://localhost:8000/api/users";

export const registerUser = async (userData: {
  email: string;
  name: string;
  password: string;
}) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

export const loginUser = async (userData: {
  email: string;
  password: string;
}) => {
  const response = await axios.post(`${API_URL}/login`, userData, {
    withCredentials: true, // Include credentials (cookies) in the request
  });
  return response.data;
};

export const logoutUser = async () => {
  const response = await axios.delete(`${API_URL}/logout`, {
    withCredentials: true, // Include credentials (cookies) in the request
  });
  return response.data;
};
