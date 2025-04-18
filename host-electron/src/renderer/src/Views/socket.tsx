import { io } from 'socket.io-client'

const socket = io(`http://${import.meta.env.VITE_BACKEND_PATH}`)
export default socket
