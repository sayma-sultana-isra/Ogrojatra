import axios from 'axios'

const instance = axios.create({
    baseURL:'http://localhost:8080',

    headers:{
        'Content-Type': 'application/json'
    },
    withCredentials:true
})

export const get = (url, params) => instance.get(url, { params });
export const post = (url, data) => instance.post(url, data);
export const put = (url, data) => instance.put(url, data);
export const deleteUser = (url) => instance.delete(url);


  instance.interceptors.request.use(function (config) {
<<<<<<< HEAD
    // Do something before request is sent
=======
    // Add token to request headers
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
>>>>>>> e292f5c00bf45c011f5b610d8f82558887377977
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

// Add a response interceptor
instance.interceptors.response.use(function (response) {
        console.log('intercpert response',response)
    return response;
  }, function (error) {
    console.log('intercpert response',error)
    return Promise.reject(error);
  });