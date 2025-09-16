import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

//dev
const baseURL = 'https://6cf21e7a7265.ngrok-free.app/api/v1/';

//prod
// const baseURL = 'http://34.47.150.57:8080/api/v1/';

const apiService = async ({
  endpoint = '',
  method = 'GET',
  body = null,
  params = {},
  headers = {},
  isMultipart = false,
}) => {
  try {
    const token = await AsyncStorage.getItem('jwtToken');
    const config = {
      baseURL,
      url: endpoint,
      method: method.toLowerCase(),
      headers: {
        ...(isMultipart
          ? { 'Content-Type': 'multipart/form-data' }
          : { 'Content-Type': 'application/json' }),
        Authorization: token ? `Bearer ${token}` : '',
        ...headers,
      },
      params,
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.data = body;
    }

    const response = await axios(config);
    console.log(response.data);

    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

export default apiService;