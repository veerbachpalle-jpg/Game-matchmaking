import cors from 'cors'
import cookieParser from 'cookie-parser'
import fs from 'fs'

fs.mkdirSync("./Public/temp",{recursive:true})

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN==="*"?true:process.env.CORS_ORIGIN,
  credentials:true
}))

app.use(express.json({limit:"16 kb"}))

app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import router from './routes/userRoutes.router'

app.use("/user",router)

import { ApiError } from './utils/Apierrors'
app.use(ApiError)

export default app;