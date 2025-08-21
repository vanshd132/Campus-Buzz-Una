# IIIT Una Feed 🏫

A modern campus social feed application for IIIT Una, built with React, Node.js, and AI-powered features.

## 🌟 Features

### 📱 Core Features
- **Social Feed**: Share posts, events, announcements, and lost & found items
- **AI Image Generation**: Create custom images for your posts using AI
- **Smart Post Classification**: Automatically categorizes posts based on content
- **Real-time Comments**: Interactive commenting system with reactions
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🎨 AI-Powered Features
- **Image Generation**: Generate custom images from text descriptions
- **Prompt Analysis**: AI analyzes your post content and suggests categories
- **Enhanced Prompts**: Automatically improves your image generation prompts
- **Multiple Generation Modes**: Single, multiple, and campus-optimized image generation

### 📊 Post Types
- **Events**: Share campus events with RSVP functionality
- **Lost & Found**: Report lost items or share found belongings
- **Announcements**: Department and general announcements
- **General Posts**: Regular social media-style posts

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iiituna-feed
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**
   Create a `.env` file in the server directory:
   ```env
   PORT=4000
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   OPENAI_API_KEY=your_openai_api_key
   ```

5. **Start the development servers**

   **Terminal 1 - Start the server:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Start the client:**
   ```bash
   cd client
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173` to access the application

## 📁 Project Structure

```
iiituna-feed/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS styles
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Express middleware
│   │   └── services/      # Business logic
│   ├── uploads/           # Uploaded files
│   └── package.json
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Multer** - File upload handling

### AI Integration
- **OpenAI API** - Image generation and text analysis
- **DALL-E** - AI image generation
- **GPT-4** - Text analysis and prompt enhancement

## 🎯 How to Use

### Creating Posts

1. **Navigate to the Image Generator**
   - Click on "Create Post" or navigate to the image generator page

2. **Write Your Post Description**
   - Enter a detailed description of what you want to post
   - Use the preset examples for inspiration

3. **Choose Generation Options**
   - Select generation mode (Single, Multiple, or Campus Optimized)
   - Choose image size (Square, Landscape, or Portrait)

4. **Generate and Select Image**
   - Click "Generate Image" to create AI-generated images
   - Select your preferred image from the results

5. **Fill Post Details**
   - Add a title and description
   - Include location and date (if applicable)
   - The AI will automatically categorize your post

6. **Publish**
   - Click "Create Post" to publish to the feed

### Interacting with Posts

- **Reactions**: Click emoji reactions to interact with posts
- **Comments**: Add comments and replies to posts
- **RSVP**: For events, you can RSVP as "Going", "Interested", or "Not Going"
- **Download**: Download generated images for personal use

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/iiituna-feed

# Session
SESSION_SECRET=your-super-secret-session-key

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### AI Configuration

The AI features can be configured in the following files:
- `client/src/utils/imageGenerator.js` - Image generation settings
- `client/src/utils/promptAnalyzer.js` - Prompt analysis configuration
- `server/src/services/ai.js` - Server-side AI services

## 🚀 Deployment

### Production Build

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Set up production environment**
   ```bash
   cd ../server
   NODE_ENV=production npm start
   ```

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t iiituna-feed .
   ```

2. **Run the container**
   ```bash
   docker run -p 4000:4000 iiituna-feed
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/iiituna-feed/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- OpenAI for providing the AI APIs
- The IIIT Una community for feedback and testing
- All contributors who helped build this platform

---

**Made with ❤️ for IIIT Una**
