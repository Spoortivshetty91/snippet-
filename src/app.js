import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import snippetRoutes from "./routes/snippetRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Snippet Hub API is running");
});

app.use("/api/auth", authRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/snippets", snippetRoutes);

export default app;