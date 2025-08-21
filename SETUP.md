# IIIT-Una Feed - AI Enhanced Setup

## Features Added

✅ **AI Image Generation** - Generate images for posts using OpenAI's GPT Image model  
✅ **AI Text Enhancement** - Automatically enhance post text with AI  
✅ **Post Creation with ImageGenerator** - Create posts with AI-generated images  
✅ **Social Media Feed** - View all posts with filtering and reactions  
✅ **MongoDB Storage** - Posts stored with images and metadata  
✅ **Multer File Upload** - Local image storage for posts  

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the `client` directory:

```bash
# OpenAI API Key for AI features
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Install Dependencies

```bash
# Server dependencies
cd server
npm install

# Client dependencies  
cd ../client
npm install
```

### 3. Start the Application

```bash
# Start server (from server directory)
npm start

# Start client (from client directory)
npm run dev
```

### 4. Seed Example Data (Optional)

To add example posts to the database, make a POST request to:
```
POST http://localhost:4000/api/posts/seed
```

Or visit the posts page and click "Seed Example Posts" if available.

## How to Use

### Creating Posts
1. **Click "✨ Create Post"** in the navigation
2. **Type your post description** in natural language
3. **Click "✨ Generate Image"** to create AI-generated images
4. **Select an image** from the generated options
5. **Fill in post details** (title, description, location, date)
6. **Click "📝 Create Post"** to publish

### Viewing Posts
1. **Click "📱 View Feed"** to see all posts
2. **Use filter tabs** to view specific post types:
   - All Posts
   - Events
   - Lost & Found
   - Announcements
3. **React to posts** with emojis
4. **RSVP to events** (Going/Interested/Not Going)

## Post Types Supported

- **Events**: Workshops, meetings, parties, hackathons
  - Required: Description, Location, Date
  - Features: RSVP system, reactions
- **Lost & Found**: Lost or found items with images
  - Required: Item description, Location
  - Features: Image upload, reactions
- **Announcements**: Official notices with attachments
  - Required: Department, Description
  - Features: PDF/image attachments, reactions

## AI Features

- **Smart Post Detection**: Automatically detects post type from text
- **Professional Image Generation**: Creates campus-appropriate images
- **Text Enhancement**: Improves post descriptions and titles
- **Fallback Support**: Works without API keys using local detection

## Example Posts Included

The seed data includes:
- Python Workshop (Event)
- Lost iPhone 15 (Lost & Found)
- Final Exam Schedule (Announcement)
- Hackathon 2024 (Event)
- Found MacBook Pro (Lost & Found)
- Holiday Schedule (Announcement)

## File Structure

```
iiituna-feed/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageGenerator.jsx    # Post creation with AI
│   │   │   └── PostCard.jsx          # Post display component
│   │   ├── pages/
│   │   │   └── posts.jsx             # Posts feed page
│   │   └── utils/
│   │       ├── imageGenerator.js     # AI image generation
│   │       └── promptAnalyzer.js     # AI text analysis
│   └── .env                          # OpenAI API key
└── server/
    ├── src/
    │   ├── models/
    │   │   └── Post.js               # MongoDB post model
    │   ├── routes/
    │   │   ├── posts.js              # Post CRUD operations
    │   │   └── upload.js             # File upload with multer
    │   └── seedData.js               # Example posts data
    └── uploads/                      # Local image storage
```
