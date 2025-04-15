import axios from "axios"
import { getUserData} from './Storage'

axios.defaults.baseURL = "https://backend.genbook.site";
// axios.defaults.baseURL = "http://localhost:3002";
const API_KEY = "%YOUR_FIREBASE_API_KEY%"
const REGISTER_URL = `/user`;
const LOGIN_URL = `/login`;
const USER_DETAILS_URL = `/accounts:lookup?key=${API_KEY}`;

export const RegisterApi = (inputs)=>{
    let data  = {displayName:inputs.name,email:inputs.email,password:inputs.password }
    return axios.post('user',data)
}
export const LoginApi = (inputs)=>{
    let data  = {email:inputs.email,password:inputs.password }
    return axios.post('login',data)
}
export const UserDetailsApi = ()=> {
    const accessToken = getUserData(); // Lấy token từ localStorage
    const storedToken = localStorage.getItem("idToken");
    console.log(storedToken);
    if (!accessToken) {
        throw new Error("User not authenticated");
    }

    return axios.post(`/user/my-info`, {}, { // Dữ liệu body là {}, headers truyền vào config
        headers: {
            "Authorization": `Bearer ${storedToken}`,
            "Accept": "application/json",
        },
    });
    
}

export const UserSheetInfoApi = ()=> {
    const accessToken = getUserData(); // Lấy token từ localStorage
    
    console.log("accessToken:", accessToken);
    if (!accessToken) {
        throw new Error("User not authenticated");
    }

    return axios.post(`/user/my-sheet`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Accept": "application/json",
        },
    });
}