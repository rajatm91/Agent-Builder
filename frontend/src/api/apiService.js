// src/services/apiService.js
import axios from "axios";

// Base URL Configuration
const BASE_URL = "http://localhost:8081/api";

// Create an Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Common API service with dynamic methods
const apiService = {
  get: async (endpoint, params = {}) => {
    try {
      const response = await apiClient.get(endpoint, { params });
      if (response.data?.status) {
        return response.data.data; // Extract actual data
      } else {
        throw new Error(response.data?.message || "API Request Failed");
      }
    } catch (error) {
      console.error(`GET ${endpoint} Error:`, error);
      return [];
    }
  },

  post: async (endpoint, data = {}) => {
    try {
      const response = await apiClient.post(endpoint, data);
      if (response.data?.status) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || "API Request Failed");
      }
    } catch (error) {
      console.error(`POST ${endpoint} Error:`, error);
      return null;
    }
  },

  put: async (endpoint, data = {}) => {
    try {
      const response = await apiClient.put(endpoint, data);
      if (response.data?.status) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || "API Request Failed");
      }
    } catch (error) {
      console.error(`PUT ${endpoint} Error:`, error);
      return null;
    }
  },

  delete: async (endpoint, params = {}) => {
    try {
      const response = await apiClient.delete(endpoint, { params });
      if (response.data?.status) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || "API Request Failed");
      }
    } catch (error) {
      console.error(`DELETE ${endpoint} Error:`, error);
      return null;
    }
  },

  getWorkflows: async (userId) => {
    return await apiService.get("/models", { user_id: userId });
  }
};

export default apiService;
