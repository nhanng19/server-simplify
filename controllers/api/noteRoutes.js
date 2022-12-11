const router = require("express").Router();
const { Note } = require("../../models");
const withAuth = require("../../utils/auth");
const summarize = require("../../utils/summarize");
const webscrape = require("../../utils/webscrape");

router.post("/", async (req, res) => {
  const { url, text } = req.body;

  let rawText = text;

  if (!url && !text) {
    return res.status(400).json({ error: "No inputs" });
  }

  try {
    if (url) rawText = await webscrape(url.trim());
  } catch (err) {
    return res.status(400).json(err);
  }

  let summaryData;

  try {
    summaryData = await summarize(rawText);
  } catch (err) {
    return res.status(400).json(err);
  }

  if (!summaryData.summary || !summaryData.keywords) {
    return res.status(400).json({ error: "Unable to summarize" });
  }

  res.json(summaryData);
});

router.post("/newNote", withAuth, async (req, res) => {
  try {
    const newNote = await Note.create({
      ...req.body,
      user_id: req.session.user_id,
    });
    res.status(200).json(newNote);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.patch("/:nid", withAuth, async (req, res) => {
  try {
    const updatedNote = await Note.update(
      {
        highlights: req.body.highlights,
        title: req.body.title,
        summary: req.body.summary,
      },
      {
        where: {
          id: req.params.nid,
          user_id: req.session.user_id,
        },
      }
    );

    if (!updatedNote) {
      res.status(404).json({ message: "No note found with this id!" });
      return;
    }

    res.status(200).json({ message: "Note updated" });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete("/:nid", withAuth, async (req, res) => {
  try {
    const deletedNote = await Note.destroy({
      where: {
        id: req.params.nid,
        user_id: req.session.user_id,
      },
    });

    if (!deletedNote) {
      res.status(404).json({ message: "No note found with this id!" });
      return;
    }

    res.status(200).json({ message: "Note deleted" });
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
