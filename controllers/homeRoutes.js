const router = require("express").Router();
const { Note, User } = require("../models");

router.get("/", async (req, res) => {
  if (!req.session.user_id) {
    res.status(403).json({ message: "not logged in" });
    return;
  }
  try {
    const userData = await User.findByPk(req.session.user_id, {
      include: [{ model: Note }],
    });

    const user = userData.get({ plain: true });

    if (!user) {
      res.status(404).json({ message: "No user found with this id!" });
      return;
    }

    const { name, email, notes } = user;
    res.json({ name, email, notes });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
