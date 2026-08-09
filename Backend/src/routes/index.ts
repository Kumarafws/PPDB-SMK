import { Router } from "express"
import { authRouter } from "./auth.js"
import { studentsRouter } from "./students.js"
import { documentsRouter } from "./documents.js"
import { settingsRouter } from "./settings.js"
import { adminRouter } from "./admin.js"
import { profilesRouter } from "./profiles.js"

export const apiRouter = Router()

apiRouter.get("/", (_req, res) => {
  res.json({
    name: "PPDB API",
    version: "0.2.0",
    docs: "Lihat komentar di routes/index.ts",
  })
})

apiRouter.use("/auth", authRouter)
apiRouter.use("/students", studentsRouter)
apiRouter.use("/documents", documentsRouter)
apiRouter.use("/settings", settingsRouter)
apiRouter.use("/admin", adminRouter)
apiRouter.use("/profiles", profilesRouter)
