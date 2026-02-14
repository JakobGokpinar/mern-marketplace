import axios from "axios";

const serverURL = process.env.REACT_APP_API_URL || "http://localhost:3080";

const instanceAxs = axios.create({
    baseURL: serverURL,
    withCredentials: true
});

export { instanceAxs };
