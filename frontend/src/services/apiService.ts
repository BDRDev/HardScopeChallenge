import axios from "axios";

//request interceptor
axios.interceptors.request.use(async (config) => {
  config.baseURL = import.meta.env.VITE_API_URL;

  return config;
});

//response interceptor
axios.interceptors.response.use(
  (response) => {
    //response was successful
    return response;
  },
  (error) => {
    //response was unsuccessful
    if (error.response) {
      //the request was made and the server responded with a status code
      return Promise.reject(error.response.data.detail.message);
    } else if (error.request) {
      //the request was made but no response was received
      return Promise.reject(error.message);
    } else {
      //something happened in setting up the request that triggered the Error
      return Promise.reject(error.message);
    }
  },
);

export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
};
