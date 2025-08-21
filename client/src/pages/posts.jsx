import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard.jsx';

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, event, lostfound, announcement
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching posts from server...');
      const response = await fetch('http://localhost:4000/api/posts?limit=50', {
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      console.log('Fetched data:', data);
      console.log('Posts count:', data.items?.length || 0);
      
      setPosts(data.items || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      // Instead of showing error, automatically seed example data
      console.log('Failed to load posts, seeding example data...');
      await seedExamplePosts();
    } finally {
      setLoading(false);
    }
  };

  const seedExamplePosts = async () => {
    try {
      setSeeding(true);
      const response = await fetch('http://localhost:4000/api/posts/seed', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to seed posts');
      }
      
      const data = await response.json();
      console.log('Seeded posts:', data);
      
      // Set the seeded posts directly
      setPosts(data.posts || []);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error seeding posts:', err);
      setError('Failed to load or seed posts. Please try refreshing the page.');
    } finally {
      setSeeding(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.type === filter;
  });

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  if (loading || seeding) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">
              {seeding ? '🌱 Loading example posts...' : 'Loading posts...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">❌ {error}</p>
            <button 
              onClick={fetchPosts}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Campus Feed</h1>
            <div className="flex gap-2">
              <button
                onClick={seedExamplePosts}
                disabled={seeding}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {seeding ? '🔄 Adding Examples...' : '🌱 Add Example Posts'}
              </button>
              <button
                onClick={fetchPosts}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          
          {/* Debug Info */}
          <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
            <p><strong>Posts loaded:</strong> {posts.length}</p>
            <p><strong>Filter:</strong> {filter}</p>
            <p><strong>Filtered posts:</strong> {filteredPosts.length}</p>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Posts ({posts.length})
            </button>
            <button
              onClick={() => setFilter('event')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'event' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Events ({posts.filter(p => p.type === 'event').length})
            </button>
            <button
              onClick={() => setFilter('lostfound')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'lostfound' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Lost & Found ({posts.filter(p => p.type === 'lostfound').length})
            </button>
            <button
              onClick={() => setFilter('announcement')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'announcement' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Announcements ({posts.filter(p => p.type === 'announcement').length})
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-4">
                {filter === 'all' 
                  ? 'Be the first to create a post or add some examples!' 
                  : `No ${filter} posts found.`
                }
              </p>
              {filter === 'all' && posts.length === 0 && (
                <button
                  onClick={seedExamplePosts}
                  disabled={seeding}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {seeding ? '🔄 Adding Examples...' : '🌱 Add Example Posts'}
                </button>
              )}
            </div>
          ) : (
            filteredPosts.map(post => (
              <PostCard 
                key={post._id} 
                post={post} 
                onPostUpdated={fetchPosts}
              />
            ))
          )}
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchPosts}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🔄 Refresh Feed
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostsPage;
