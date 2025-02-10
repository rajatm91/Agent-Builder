import { useEffect, useState } from "react";
import apiService from "../api/apiService";

const useAPIResponse = (apiEndPoint, params) => {
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAPI = async () => {
      try {
        const data = await apiService.get(apiEndPoint, params);
        setResponse(data);        
      } catch (err) {
        setError(err.message || "Failed to fetch workflows");
      } finally {
        setLoading(false);
      }
    };

    fetchAPI();
  }, [apiEndPoint]);

  return { response, loading, error };
};

export default useAPIResponse;
