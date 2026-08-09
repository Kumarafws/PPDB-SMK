import "dotenv/config"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { corsOriginOption } from "./config/env.js"
import { healthRouter } from "./routes/health.js"
import { apiRouter } from "./routes/index.js"
import { errorHandler } from "./middleware/error-handler.js"

const app = express()

app.set("trust proxy", 1)
app.use(helmet())
app.use(cors({ origin: corsOriginOption(), credentials: true }))
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"))
}
app.use(express.json({ limit: "2mb" }))

app.use(healthRouter)
app.use("/api", apiRouter)

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" })
})

app.use(errorHandler)

export { app }
