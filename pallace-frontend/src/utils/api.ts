import axios from "axios";

const API_URL = "http://localhost:8000/api/users";

export const registerUser = async (userData: {
  email: string;
  name: string;
  password: string;
}) => {
  const response = await axios.post(`${API_URL}/createUser`, userData);
  return response.data;
};

export const loginUser = async (userData: {
  email: string;
  password: string;
}) => {
  // const response = await axios.post(`${API_URL}/login`, userData);
  // return response.data;

  // Hardcoded response for now
  const access_token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFjY2VzcyIsImVtYWlsIjoiYWNjZXNzQG1haWwuY29tIiwibmFtZSI6IkFjY2VzcyIsImlhdCI6MTYyMzUwNjMwMH0.1";
  return access_token;
};
