const express = require("express");
const { generateLetter } = require("../controllers/letterController");
const router = express.Router();

router.post("/generate", generateLetter);

module.exports = router;
