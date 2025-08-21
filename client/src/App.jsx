import React, { useState } from "react";
import ImageGenerator from "./components/ImageGenerator.jsx";
import PostsPage from "./pages/posts.jsx";

export default function App() {
  const [currentPage, setCurrentPage] = useState('posts'); // 'posts' or 'create'
  const [refreshPosts, setRefreshPosts] = useState(0);

  const handlePostCreated = (newPost) => {
    // Switch to posts page and refresh
    setCurrentPage('posts');
    setRefreshPosts(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">IIIT-Una Feed</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => setCurrentPage('posts')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'posts' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                📱 View Feed
              </button>
              <button
                onClick={() => setCurrentPage('create')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'create' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                ✨ Create Post
              </button>
            </nav>
            <span className="text-sm text-gray-500">No-login • Cookie-based identity</span>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main>
        {currentPage === 'create' ? (
          <div className="py-8">
            <ImageGenerator onPostCreated={handlePostCreated} />
          </div>
        ) : (
          <PostsPage key={refreshPosts} />
        )}
      </main>
    </div>
  );
}
