// Prompt Analyzer using OpenAI API
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Analyze user prompt and return structured response with post type and enhanced prompt
 * @param {string} userPrompt - The user's original prompt
 * @returns {Promise<Object>} - Structured response with post type and enhanced prompt
 */
export async function analyzePrompt(userPrompt) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found. Please check your environment variables.');
    }

    const systemPrompt = `You are an expert at analyzing campus-related posts and creating professional design prompts. 

Your task is to:
1. Determine the post type (event, lost_found, announcement, or general)
2. Create a detailed, professional design prompt for image generation
3. Generate a compelling post description for the campus feed

Available post types:
- event: Workshops, meetings, parties, festivals, competitions, hackathons, seminars, conferences
- lost_found: Lost or found items, missing belongings, items left behind
- announcement: Official notices, academic updates, department announcements, schedules, deadlines
- general: Any other type of post

You must respond in this EXACT JSON format:
{
  "post_type": "event|lost_found|announcement|general",
  "confidence": "confidence score between 0 and 1",
  "enhanced_prompt": "Detailed design prompt for professional image generation",
  "post_description": "Compelling description for the campus feed post",
  "reasoning": "Brief explanation of why this post type was chosen"
}

The enhanced_prompt should be detailed and include:
- Professional design requirements
- Color schemes and typography
- Layout specifications
- Style guidelines
- Target audience considerations

 Example enhanced_prompt for an event:
 "Create a stunning, professional event poster with dramatic lighting and modern design. Features: Elegant typography with bold, eye-catching headlines, vibrant color palette with gradients (blues, purples, oranges), dynamic layout with visual hierarchy, event details prominently displayed with modern icons, sophisticated graphic elements, professional photography-style composition, cinematic lighting effects, high-quality design suitable for social media and printing. Style: Contemporary, professional, visually striking, suitable for university campus events with artistic flair."

 Example enhanced_prompt for lost_found:
 "Create a beautiful, professional lost and found poster with elegant design and emotional appeal. Features: Sophisticated typography with clear hierarchy, warm and inviting color scheme (soft blues, warm grays, gentle earth tones), artistic layout with visual storytelling elements, emphasis on the lost/found item with professional photography style, contact information elegantly integrated, modern design elements with subtle shadows and depth, high contrast for readability while maintaining aesthetic appeal, emotional connection through visual design. Style: Elegant, professional, visually appealing, suitable for campus notice boards with artistic quality."

 Example enhanced_prompt for announcement:
 "Create a prestigious, official university announcement poster with sophisticated design and authority. Features: Professional typography with official yet modern appearance, institutional color scheme (deep blues, gold accents, crisp whites), formal layout with clear sections and visual hierarchy, official header with university branding elements, elegant design suitable for official communications, clean and authoritative appearance with artistic touches, professional composition with balanced elements. Style: Official, professional, authoritative, suitable for university announcements with visual excellence."

The post_description should be:
- Engaging and informative
- Written in a friendly, campus-appropriate tone
- Include relevant details like location, time, contact info if applicable
- Be 2-4 sentences long
- Encourage engagement from other students

Example post_description for an event:
"Join us for an exciting Python programming workshop! Learn the basics of Python, data structures, and build your first project. Perfect for beginners and intermediate programmers. We'll cover everything from basic syntax to building a simple web application."

Example post_description for lost_found:
"Lost my iPhone 15 with a blue case near the main library entrance yesterday evening around 6 PM. It has a cracked screen protector and my contact info on the lock screen. Please contact if found! Reward offered."

Example post_description for announcement:
"The Computer Science Department has released the final exam schedule for the current semester. All exams will be held in the main auditorium. Please check your student portal for specific dates and times. Study materials are available in the library."

Respond ONLY with the JSON object, no additional text.`;

    const userMessage = `Analyze this user prompt: "${userPrompt}"`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Prompt Analysis Response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('No response received from OpenAI');
    }

    const responseText = data.choices[0].message.content.trim();
    console.log('Raw response text:', responseText);

    // Try to parse the JSON response
    try {
      const parsedResponse = JSON.parse(responseText);
      
      // Validate the response structure
      if (!parsedResponse.post_type || !parsedResponse.enhanced_prompt) {
        throw new Error('Invalid response structure from OpenAI');
      }

      return {
        success: true,
        postType: parsedResponse.post_type,
        confidence: parsedResponse.confidence || 0.8,
        enhancedPrompt: parsedResponse.enhanced_prompt,
        postDescription: parsedResponse.post_description || 'Post description generated by AI',
        reasoning: parsedResponse.reasoning || 'Post type determined by AI analysis',
        originalPrompt: userPrompt
      };
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Response text:', responseText);
      
      // Fallback to keyword-based detection
      return fallbackAnalysis(userPrompt);
    }

  } catch (error) {
    console.error('Error analyzing prompt:', error);
    
    // Fallback to keyword-based detection
    return fallbackAnalysis(userPrompt);
  }
}

/**
 * Fallback analysis using keyword matching
 * @param {string} prompt - User's input text
 * @returns {Object} - Structured response
 */
function fallbackAnalysis(prompt) {
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
  
     let postType = 'general';
   let enhancedPrompt = `Create a stunning, professional design with the following content: "${prompt}". Features: Elegant typography with modern aesthetics, sophisticated color palette with gradients, artistic layout with visual hierarchy, high-quality graphics with professional composition, cinematic lighting effects, suitable for digital and print use. Style: Contemporary, professional, visually striking, artistic excellence.`;
   let postDescription = `A campus post about: ${prompt}`;
   
   if (eventMatches > lostFoundMatches && eventMatches > announcementMatches) {
     postType = 'event';
     enhancedPrompt = `Create a stunning, professional event poster with dramatic lighting and modern design. Features: Elegant typography with bold, eye-catching headlines, vibrant color palette with gradients (blues, purples, oranges), dynamic layout with visual hierarchy, event details prominently displayed with modern icons, sophisticated graphic elements, professional photography-style composition, cinematic lighting effects, high-quality design suitable for social media and printing. Style: Contemporary, professional, visually striking, suitable for university campus events with artistic flair. Content: "${prompt}"`;
     postDescription = `Join us for an exciting event! ${prompt}. Don't miss out on this amazing opportunity to connect with fellow students and learn something new.`;
   } else if (lostFoundMatches > eventMatches && lostFoundMatches > announcementMatches) {
     postType = 'lost_found';
     enhancedPrompt = `Create a beautiful, professional lost and found poster with elegant design and emotional appeal. Features: Sophisticated typography with clear hierarchy, warm and inviting color scheme (soft blues, warm grays, gentle earth tones), artistic layout with visual storytelling elements, emphasis on the lost/found item with professional photography style, contact information elegantly integrated, modern design elements with subtle shadows and depth, high contrast for readability while maintaining aesthetic appeal, emotional connection through visual design. Style: Elegant, professional, visually appealing, suitable for campus notice boards with artistic quality. Content: "${prompt}"`;
     postDescription = `Help needed! ${prompt}. Please contact if you have any information or if you've seen this item. Your help is greatly appreciated!`;
   } else if (announcementMatches > eventMatches && announcementMatches > lostFoundMatches) {
     postType = 'announcement';
     enhancedPrompt = `Create a prestigious, official university announcement poster with sophisticated design and authority. Features: Professional typography with official yet modern appearance, institutional color scheme (deep blues, gold accents, crisp whites), formal layout with clear sections and visual hierarchy, official header with university branding elements, elegant design suitable for official communications, clean and authoritative appearance with artistic touches, professional composition with balanced elements. Style: Official, professional, authoritative, suitable for university announcements with visual excellence. Content: "${prompt}"`;
     postDescription = `Important announcement: ${prompt}. Please take note of this information and share with your classmates.`;
   }

  return {
    success: true,
    postType: postType,
    confidence: 0.6,
    enhancedPrompt: enhancedPrompt,
    postDescription: postDescription,
    reasoning: 'Post type determined by keyword matching (fallback)',
    originalPrompt: prompt
  };
}
