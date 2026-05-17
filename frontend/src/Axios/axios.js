import axios from "axios"
const instance = axios.create({
    baseURL:"http://3.235.60.252:8000/api"
})
export default instance