import Snippet from "../models/Snippet.js";
import Version from "../models/Version.js";

const canView = (snippet, user) =>
  snippet.visibility !== "private" ||
  (user && String(snippet.owner) === String(user._id));

export const createSnippet = async (req, res) => {
  try {
    const { title, description, language, code, tags, visibility } = req.body;

    if (!title || !language || !code) {
      return res.status(400).json({ message: "Title, language and code are required" });
    }

    const snippet = await Snippet.create({
      title, description, language, code, tags, visibility,
      owner: req.user._id,
    });

    await Version.create({
      snippet: snippet._id,
      code,
      versionNumber: 1,
      changeNote: "Initial version",
    });

    res.status(201).json(snippet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSnippets = async (req, res) => {
  try {
    const { q, lang, tag } = req.query;
    const filter = { visibility: "public" };

    if (lang) filter.language = lang.toLowerCase();
    if (tag) filter.tags = tag.toLowerCase();
    if (q) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
      ];
    }

    const snippets = await Snippet.find(filter)
      .populate("owner", "name avatar")
      .sort({ createdAt: -1 });

    res.json(snippets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMySnippets = async (req, res) => {
  try {
    const snippets = await Snippet.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(snippets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: "Snippet not found" });
    if (!canView(snippet, req.user)) {
      return res.status(403).json({ message: "This snippet is private" });
    }

    await snippet.populate("owner", "name avatar");
    res.json(snippet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: "Snippet not found" });
    if (String(snippet.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only edit your own snippets" });
    }

    const { title, description, language, tags, visibility, code, changeNote } = req.body;

    if (title !== undefined) snippet.title = title;
    if (description !== undefined) snippet.description = description;
    if (language !== undefined) snippet.language = language;
    if (tags !== undefined) snippet.tags = tags;
    if (visibility !== undefined) snippet.visibility = visibility;

    if (code !== undefined && code !== snippet.code) {
      snippet.code = code;
      snippet.currentVersion += 1;
      await Version.create({
        snippet: snippet._id,
        code,
        versionNumber: snippet.currentVersion,
        changeNote: changeNote || "",
      });
    }

    await snippet.save();
    res.json(snippet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: "Snippet not found" });
    if (String(snippet.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own snippets" });
    }

    await Version.deleteMany({ snippet: snippet._id });
    await snippet.deleteOne();
    res.json({ message: "Snippet deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVersions = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: "Snippet not found" });
    if (!canView(snippet, req.user)) {
      return res.status(403).json({ message: "This snippet is private" });
    }

    const versions = await Version.find({ snippet: snippet._id }).sort({ versionNumber: -1 });
    res.json(versions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id)
      .populate("owner", "name avatar")
      .populate("forkedFrom", "title owner");

    if (!snippet) return res.status(404).json({ message: "Snippet not found" });
    if (!canView(snippet, req.user)) {
      return res.status(403).json({ message: "This snippet is private" });
    }

    const forksCount = await Snippet.countDocuments({ forkedFrom: snippet._id });

    res.json({
      ...snippet.toObject(),
      starsCount: snippet.stars.length,
      forksCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};