import axios from "axios"
const instance = axios.create({
    baseURL:"http://3.82.24.29:31000/api"
})
export default instance