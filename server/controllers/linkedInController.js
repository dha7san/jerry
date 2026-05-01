const { linkedinAI, imageAI } = require('../services/ai/providers/gemini');
const DailyLog = require('../models/DailyLog');
const LinkedInPost = require('../models/LinkedInPost');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

exports.generatePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyLog = await DailyLog.findOne({ 
      userId, 
      date: { $gte: today } 
    });

    if (!dailyLog) {
      return res.status(404).json({ error: 'No daily tasks found for today yet.' });
    }

    res.json({ tasksSnapshot: dailyLog });
  } catch (err) {
    console.error('LinkedIn fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};

exports.generateV2 = async (req, res) => {
  try {
    const { stats, templateUrl, isPublic, customPrompt } = req.body;
    const userId = req.user.id;

    // 1. Get image name and path for the reference template
    const fileName = templateUrl.split('/').pop();
    const templatePath = path.join(__dirname, '..', 'assets', 'linkedin', fileName);

    if (!fs.existsSync(templatePath)) {
      throw new Error('Template style reference not found');
    }

    // 2. Read template as Base64 for the AI to "see" its style
    const templateBase64 = fs.readFileSync(templatePath, { encoding: 'base64' });

    // 3. Prepare Multimodal Prompt for Image Generation
    const imagePromptParts = [
      { text: `
        ROLE: Expert Visual Designer & Growth Hacker.
        TASK: Generate a high-impact LinkedIn achievement image.
        STYLE REFERENCE: Mimic the attached image's color palette, typography style, and futuristic aesthetic.
        
        USER DIRECTIVE: ${customPrompt || 'Create a clean, motivational achievement card.'}
        
        DATA TO INCLUDE IN IMAGE:
        - DSA: ${stats.dsaProblems} Solved (${stats.dsaTopics})
        - Dev: ${stats.devMinutes} Mins (${stats.devProject})
        - Efficiency: ${stats.overallScore}%
        - Aptitude: ${stats.appsTopic}
        
        OUTPUT: Return the generated image data (or a high-fidelity visual representation if the model is multimodal).
      `},
      {
        inlineData: {
          mimeType: "image/png",
          data: templateBase64
        }
      }
    ];

    // Generate the professional image via AI
    // NOTE: This assumes the IMAGE_GEMINI_MODEL in .env is multimodal-capable (like gemini-1.5-pro or flash)
    const generatedImageResult = await imageAI(imagePromptParts);

    // 4. Generate AI Caption (Text)
    const textPrompt = `
      Instructions: ${customPrompt || 'Write a standard high-impact LinkedIn post text.'}
      Context: This post accompanies a newly generated achievement visual.
      
      Achievement Data:
      - DSA: ${stats.dsaProblems} (${stats.dsaTopics})
      - Dev: ${stats.devMinutes} mins
      - English/Aptitude: ${stats.englishTopic} / ${stats.appsTopic}
      - Score: ${stats.overallScore}%
    `;
    const aiCaption = await linkedinAI(textPrompt);

    // 5. Handle Image Storage (Since we're simulating the pixel-generation here for the MVP)
    // In a real Imagen implementation, this would save the actual byte stream.
    // We'll use a unique identifier for this generated run.
    const outputFileName = `synthesized_${userId}_${Date.now()}.png`;
    const outputPath = path.join(__dirname, '..', 'assets', 'generated_posts', outputFileName);
    
    // For now, let's "Synthesize" the final card by using the reference style + stats
    // This maintains the sharp-overlay logic as a fallback/compositor if the AI returns text-instructions,
    // OR we use the AI's "vision" to guide a new sharp render.
    
    const svgOverlay = `
      <svg width="1200" height="627">
        <rect x="0" y="450" width="1200" height="177" fill="black" fill-opacity="0.8" />
        <text x="50" y="520" font-family="Arial" font-size="50" fill="#0077b5" font-weight="900">SYNTHESIZED BROADCAST</text>
        <text x="50" y="570" font-family="Arial" font-size="24" fill="white">${stats.dsaProblems} DSA • ${stats.devMinutes}M DEV • GOAL: ${stats.devProject}</text>
        <text x="1100" y="580" font-family="Arial" font-size="40" fill="#0077b5" font-weight="900" text-anchor="end">${stats.overallScore}%</text>
      </svg>
    `;

    await sharp(templatePath)
      .resize(1200, 627)
      .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
      .toFile(outputPath);

    const publicUrl = `http://localhost:5000/assets/generated_posts/${outputFileName}`;

    const newPost = new LinkedInPost({
      userId,
      content: aiCaption,
      imageUrl: publicUrl,
      tasksSnapshot: stats,
      isPublic
    });
    await newPost.save();

    res.json({ imageUrl: publicUrl, content: aiCaption });

  } catch (err) {
    console.error('LinkedIn Style Synthesis Error:', err);
    res.status(500).json({ error: 'AI failed to interpret style reference.' });
  }
};

exports.savePost = async (req, res) => {
  try {
    const { content, imageUrl, tasksSnapshot, isPublic } = req.body;
    const userId = req.user.id;
    const newPost = new LinkedInPost({ userId, content, imageUrl, tasksSnapshot, isPublic });
    await newPost.save();
    res.status(201).json({ message: 'Success', post: newPost });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
};

exports.getCommunityPosts = async (req, res) => {
  try {
    const posts = await LinkedInPost.find({ isPublic: true }).populate('userId', 'name').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
};

exports.getTemplates = async (req, res) => {
  try {
    const assetsDir = path.join(__dirname, '..', 'assets', 'linkedin');
    if (!fs.existsSync(assetsDir)) return res.json([]);
    const files = fs.readdirSync(assetsDir);
    const templates = files.map(file => {
      const nameWithoutExt = file.split('.').slice(0, -1).join('.');
      return { id: file, url: `http://localhost:5000/assets/linkedin/${file}`, label: nameWithoutExt };
    });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
};
