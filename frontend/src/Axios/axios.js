import axios from "axios"
const instance = axios.create({
    baseURL:"http://44.203.139.24:8000/api"
})
export default instance