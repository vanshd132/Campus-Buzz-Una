// Image Generator using OpenAI API
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/images/generations';

// Import the prompt analyzer
import { analyzePrompt } from './promptAnalyzer.js';

/**
 * Detect post type from user input
 * @param {string} prompt - User's input text
 * @returns {string} - Post type: 'event', 'lost_found', 'announcement', or 'general'
 */
function detectPostType(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Event keywords
  const eventKeywords = ['workshop', 'event', 'fest', 'festival', 'meeting', 'seminar', 'conference', 'party', 'celebration', 'competition', 'hackathon', 'tomorrow', 'today', 'pm', 'am', 'o\'clock', 'at', 'in', 'room', 'lab', 'auditorium', 'hall'];
  
  // Lost & Found keywords
  const lostFoundKeywords = ['lost', 'found', 'missing', 'wallet', 'phone', 'laptop', 'keys', 'bag', 'book', 'card', 'id', 'yesterday', 'morning', 'evening', 'night', 'near', 'around', 'between', 'library', 'cafeteria', 'classroom'];
  
  // Announcement keywords
  const announcementKeywords = ['announcement', 'notice', 'important', 'urgent', 'official', 'department', 'university', 'college', 'academic', 'exam', 'holiday', 'schedule', 'timetable', 'deadline', 'registration', 'enrollment'];
  
  // Count matches for each type
  const eventMatches = eventKeywords.filter(keyword => lowerPrompt.includes(keyword)).length;
  const lostFoundMatches = lostFoundKeywords.filter(keyword => lowerPrompt.includes(keyword)).length;
  const announcementMatches = announcementKeywords.filter(keyword => lowerPrompt.includes(keyword)).length;
  
  // Return the type with most matches
  if (eventMatches > lostFoundMatches && eventMatches > announcementMatches) {
    return 'event';
  } else if (lostFoundMatches > eventMatches && lostFoundMatches > announcementMatches) {
    return 'lost_found';
  } else if (announcementMatches > eventMatches && announcementMatches > lostFoundMatches) {
    return 'announcement';
  }
  
  // Default to general if no clear match
  return 'general';
}

/**
 * Enhance prompt based on post type
 * @param {string} prompt - Original user prompt
 * @param {string} postType - Detected post type
 * @returns {string} - Enhanced prompt for professional design
 */
function enhancePromptForPostType(prompt, postType) {
  const basePrompt = prompt.trim();
  
  switch (postType) {
    case 'event':
      return `Create a professional, modern event poster with the following details: "${basePrompt}". Design should include: Clean typography with bold headlines, modern color scheme (blues, whites, or vibrant colors), professional layout with clear hierarchy, event details prominently displayed, modern graphic elements or icons, high-quality design suitable for social media and printing. Style: Contemporary, professional, eye-catching, suitable for university campus events.`;
    
    case 'lost_found':
      return `Create a clean, professional lost and found notice with the following details: "${basePrompt}". Design should include: Clear, readable typography, simple and clean layout, emphasis on the lost/found item, contact information prominently displayed, professional color scheme (blues, grays, or neutral colors), modern design elements, high contrast for readability. Style: Clean, professional, easy to read, suitable for campus notice boards.`;
    
    case 'announcement':
      return `Create an official university announcement poster with the following details: "${basePrompt}". Design should include: Professional typography with official appearance, university-style color scheme (blues, whites, or institutional colors), formal layout with clear sections, official header or branding elements, professional design suitable for official communications, clean and authoritative appearance. Style: Official, professional, authoritative, suitable for university announcements.`;
    
    default:
      return `Create a professional, modern design with the following content: "${basePrompt}". Design should include: Clean typography, modern color scheme, professional layout, high-quality graphics, suitable for digital and print use. Style: Contemporary, professional, clean, modern.`;
  }
}

/**
 * Generate an image based on a text prompt using OpenAI's GPT Image model
 * @param {string} prompt - The text description for the image to generate
 * @param {string} size - Image size (1024x1024, 1792x1024, or 1024x1792)
 * @param {boolean} enhancePrompt - Whether to enhance the prompt automatically
 * @returns {Promise<Object>} - Response containing the generated image URL
 */
export async function generateImage(prompt, size = '1024x1024', enhancePrompt = true) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found. Please check your environment variables.');
    }

    // Analyze and enhance prompt if requested
    let finalPrompt = prompt;
    let analysisResult = null;
    
    if (enhancePrompt) {
      console.log('Analyzing prompt with AI...');
      analysisResult = await analyzePrompt(prompt);
      
      if (analysisResult.success) {
        finalPrompt = analysisResult.enhancedPrompt;
        console.log('AI Analysis Result:', analysisResult);
        console.log('Enhanced prompt for generation:', finalPrompt);
      } else {
        console.log('AI analysis failed, using fallback...');
        // Fallback to old method
        const postType = detectPostType(prompt);
        finalPrompt = enhancePromptForPostType(prompt, postType);
      }
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: finalPrompt,
        n: 1,
        size: size
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', data); // Debug log
    
    if (!data.data || !data.data[0]) {
      throw new Error('No image data received from API');
    }
    
    // Handle base64 response
    if (data.data[0].b64_json) {
      const imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
      return {
        success: true,
        imageUrl: imageUrl,
        revisedPrompt: data.data[0].revised_prompt || 'Image generated successfully',
        analysisResult: analysisResult // Include the analysis result
      };
    }
    
    // Handle URL response (fallback)
    if (data.data[0].url) {
      return {
        success: true,
        imageUrl: data.data[0].url,
        revisedPrompt: data.data[0].revised_prompt,
        analysisResult: analysisResult // Include the analysis result
      };
    }
    
    throw new Error('No image URL or base64 data received from API');
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate multiple images with different variations
 * @param {string} prompt - The base prompt
 * @param {number} count - Number of images to generate (max 4)
 * @returns {Promise<Array>} - Array of generated image URLs
 */
export async function generateMultipleImages(prompt, count = 2) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found. Please check your environment variables.');
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: Math.min(count, 4), // OpenAI allows max 4 images
        size: '1024x1024'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      images: data.data.map(img => {
        if (img.b64_json) {
          return {
            url: `data:image/png;base64,${img.b64_json}`,
            revisedPrompt: img.revised_prompt || 'Image generated successfully'
          };
        }
        return {
          url: img.url,
          revisedPrompt: img.revised_prompt
        };
      })
    };
  } catch (error) {
    console.error('Error generating multiple images:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate an image with intelligent post type detection and enhancement
 * @param {string} prompt - The description of what to generate
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Generated image result
 */
export async function generateCampusImage(prompt, options = {}) {
  const defaultOptions = {
    size: '1024x1024',
    enhancePrompt: true
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  // Detect post type and enhance prompt
  const postType = detectPostType(prompt);
  console.log('Detected post type:', postType);
  
  let enhancedPrompt = prompt;
  if (finalOptions.enhancePrompt) {
    enhancedPrompt = enhancePromptForPostType(prompt, postType);
    console.log('Enhanced prompt:', enhancedPrompt);
  }

  return await generateImage(enhancedPrompt, finalOptions.size);
}
