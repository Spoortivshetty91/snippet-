import express from "express";
import {
  createSnippet, getSnippets, getMySnippets, getSnippet,
  updateSnippet, deleteSnippet, getVersions,
} from "../controllers/snippetController.js";
import { protect, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getSnippets);
router.post("/", protect, createSnippet);
router.get("/mine", protect, getMySnippets);
router.get("/:id", optionalAuth, getSnippet);
router.put("/:id", protect, updateSnippet);
router.delete("/:id", protect, deleteSnippet);
router.get("/:id/versions", optionalAuth, getVersions);

export default router;