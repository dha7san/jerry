const express = require('express');
const router = express.Router();
const { generatePost, generateV2, savePost, getCommunityPosts, getTemplates } = require('../controllers/linkedInController');
const authMiddleware = require('../middleware/auth');

// All LinkedIn routes require authentication
router.use(authMiddleware);

// GET /api/linkedin/templates - Fetches available template images
router.get('/templates', getTemplates);

// GET /api/linkedin/generate - Generates post from today's tasks
router.get('/generate', generatePost);

// POST /api/linkedin/generate-v2 - Synthesizes an achievement card with editable stats
router.post('/generate-v2', generateV2);

// POST /api/linkedin/save - Saves the final generated post and selected image
router.post('/save', savePost);

// GET /api/linkedin/community - Fetches all posts for the community page
router.get('/community', getCommunityPosts);

module.exports = router;
