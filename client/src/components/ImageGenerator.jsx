import React, { useState } from 'react';
import { generateImage, generateMultipleImages, generateCampusImage } from '../utils/imageGenerator.js';

const ImageGenerator = ({ onPostCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [generationMode, setGenerationMode] = useState('single');
  const [detectedPostType, setDetectedPostType] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [postDate, setPostDate] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image');
      return;
    }

    setIsAnalyzing(true);
    setIsLoading(false);
    setError('');
    setGeneratedImages([]);
    setSelectedImage(null);

    try {
      // First, analyze the prompt to get post type and description
      const { analyzePrompt } = await import('../utils/promptAnalyzer.js');
      const analysisResult = await analyzePrompt(prompt);
      
      if (analysisResult.success) {
        // Show analysis results immediately
        setAnalysisResult(analysisResult);
        setDetectedPostType(analysisResult.postType);
        console.log('Analysis completed:', analysisResult);
        console.log('Post Description:', analysisResult.postDescription);
        
        // Auto-fill post details based on analysis
        setPostTitle(analysisResult.enhancedPrompt.split('.')[0].slice(0, 60));
        setPostDescription(analysisResult.postDescription || prompt);
      }

      setIsAnalyzing(false);
      setIsLoading(true);

      // Then generate the image
      let result;
      
      if (generationMode === 'single') {
        result = await generateImage(prompt, imageSize);
      } else if (generationMode === 'multiple') {
        result = await generateMultipleImages(prompt, 2);
      } else if (generationMode === 'campus') {
        result = await generateCampusImage(prompt, {
          size: imageSize
        });
      }
      
      console.log('Generation result:', result);
      
      if (result.success) {
        if (generationMode === 'multiple') {
          setGeneratedImages(result.images);
        } else {
          setGeneratedImages([{
            url: result.imageUrl,
            revisedPrompt: result.revisedPrompt
          }]);
        }
        
        console.log('Images set:', result.imageUrl || result.images);
      } else {
        setError(result.error || 'Failed to generate image');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  const handleDownloadImage = async (imageUrl, index) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileExtension = blob.type.includes('jpeg') ? 'jpg' : 'png';
      a.download = `generated-image-${index + 1}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading image:', err);
      setError('Failed to download image');
    }
  };

  const handleCreatePost = async () => {
    if (!selectedImage || !postTitle.trim()) {
      setError('Please select an image and enter a title');
      return;
    }

    setCreatingPost(true);
    try {
      console.log('Starting post creation...');
      
      // Convert base64 image to file and upload
      let imageUrl = selectedImage.url;
      if (selectedImage.url.startsWith('data:')) {
        console.log('Converting base64 image to file...');
        const response = await fetch(selectedImage.url);
        const blob = await response.blob();
        const file = new File([blob], 'generated-image.png', { type: 'image/png' });
        
        const formData = new FormData();
        formData.append('file', file);
        
        console.log('Uploading image to server...');
        const uploadResponse = await fetch('http://localhost:4000/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('Upload failed:', errorText);
          throw new Error(`Failed to upload image: ${errorText}`);
        }
        
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
        console.log('Image uploaded successfully:', imageUrl);
      }

      // Create post data
      const postData = {
        type: detectedPostType || 'general',
        title: postTitle,
        description: postDescription || prompt,
        location: postLocation,
        eventDate: postDate,
        imageUrl: imageUrl,
        lostFoundType: detectedPostType === 'lost_found' ? 'lost' : undefined,
        item: detectedPostType === 'lost_found' ? postTitle : undefined,
        department: detectedPostType === 'announcement' ? 'General' : undefined
      };

      console.log('Creating post with data:', postData);

      // Send post to server
      const postResponse = await fetch('http://localhost:4000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData),
        credentials: 'include'
      });

      if (!postResponse.ok) {
        const errorText = await postResponse.text();
        console.error('Post creation failed:', errorText);
        throw new Error(`Failed to create post: ${errorText}`);
      }

      const newPost = await postResponse.json();
      console.log('Post created successfully:', newPost);
      
      // Reset form
      setPrompt('');
      setGeneratedImages([]);
      setSelectedImage(null);
      setPostTitle('');
      setPostDescription('');
      setPostLocation('');
      setPostDate('');
      setAnalysisResult(null);
      setDetectedPostType('');
      
      // Notify parent component
      if (onPostCreated) {
        console.log('Notifying parent component of new post');
        onPostCreated(newPost);
      }
      
      alert('Post created successfully!');
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post: ' + err.message);
    } finally {
      setCreatingPost(false);
    }
  };

  const presetPrompts = [
    'Lost iPhone 15 with blue case near the main library entrance yesterday evening',
    'Python coding workshop tomorrow 3pm in Computer Science Lab 101',
    'Found silver MacBook Pro in the cafeteria this morning',
    'Important announcement from Computer Science Department about final exam schedule',
    'Hackathon event this weekend with amazing prizes',
    'Lost student ID card near the gym yesterday afternoon'
  ];

  const handlePresetClick = (presetPrompt) => {
    setPrompt(presetPrompt);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🎨 Create Post with AI</h1>
        <p className="text-gray-600">Generate images and create posts for the campus feed</p>
      </div>

      <div className="space-y-8">
        {/* Input Section */}
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your post... (e.g., 'Lost my black wallet near the library yesterday evening')"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="4"
          />
          
          {/* Preset Prompts */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Quick Examples:</h4>
            <div className="flex flex-wrap gap-2">
              {presetPrompts.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetClick(preset)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  {preset.length > 40 ? preset.substring(0, 40) + '...' : preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Options Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Generation Mode:</label>
            <select 
              value={generationMode} 
              onChange={(e) => setGenerationMode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="single">Single Image</option>
              <option value="multiple">Multiple Images (2)</option>
              <option value="campus">Campus Optimized</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Image Size:</label>
            <select 
              value={imageSize} 
              onChange={(e) => setImageSize(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1024x1024">1024x1024 (Square)</option>
              <option value="1792x1024">1792x1024 (Landscape)</option>
              <option value="1024x1792">1024x1792 (Portrait)</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button 
          onClick={handleGenerateImage}
          disabled={isLoading || !prompt.trim()}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
        >
          {isLoading ? '🔄 Generating...' : '✨ Generate Image'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

                 {/* Analysis Result */}
         {analysisResult && (
           <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
             <div className="font-semibold text-purple-800 mb-3 text-lg">
               🎯 AI Analysis Results:
             </div>
             <div className="text-sm text-purple-700 space-y-2">
               <div><strong>Post Type:</strong> <span className="capitalize bg-purple-100 px-2 py-1 rounded">{analysisResult.postType.replace('_', ' ')}</span></div>
               <div><strong>Confidence:</strong> <span className="bg-purple-100 px-2 py-1 rounded">{(analysisResult.confidence * 100).toFixed(0)}%</span></div>
               <div><strong>Reasoning:</strong> {analysisResult.reasoning}</div>
             </div>
             {analysisResult.postDescription && (
               <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                 <div className="font-semibold text-purple-800 mb-2">
                   📝 Generated Post Description:
                 </div>
                 <div className="text-sm text-gray-700 leading-relaxed">
                   {analysisResult.postDescription}
                 </div>
               </div>
             )}
           </div>
         )}

        {/* Loading Section */}
        {isAnalyzing && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Analyzing your prompt...</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Generating your image... This may take a few moments.</p>
          </div>
        )}

        {/* Results Section */}
        {generatedImages.length > 0 && (
          <div className="space-y-8">
            <h3 className="text-2xl font-semibold text-gray-800 text-center">Generated Images - Select One for Your Post</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {generatedImages.map((image, index) => (
                <div 
                  key={index} 
                  className={`bg-gray-50 rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all ${
                    selectedImage === image ? 'ring-4 ring-blue-500 scale-105' : 'hover:shadow-xl hover:scale-102'
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative">
                    <img 
                      src={image.url} 
                      alt={`Generated image ${index + 1}`}
                      className="w-full h-auto object-contain"
                      onError={(e) => {
                        console.error('Image failed to load:', image.url);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden p-8 text-center text-gray-500">
                      <p>⚠️ Image failed to load</p>
                      <p className="text-xs mt-2">URL: {image.url}</p>
                    </div>
                    {selectedImage === image && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        ✓ Selected
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadImage(image.url, index);
                        }}
                        className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        📥 Download
                      </button>
                      <a 
                        href={image.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors text-center cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        👁️ View Full
                      </a>
                    </div>
                    {image.revisedPrompt && (
                      <div className="text-xs text-gray-600 bg-white p-3 rounded-lg border">
                        <strong>AI Enhanced:</strong> {image.revisedPrompt}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post Creation Form */}
        {selectedImage && (
          <div className="border-2 border-gray-200 rounded-2xl p-8 bg-gradient-to-br from-gray-50 to-blue-50">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">✨ Create Your Post</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📝 Post Title *</label>
                <textarea
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg resize-none"
                  placeholder="Enter a catchy title for your post"
                  rows="2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📄 Description</label>
                <textarea
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                  rows="4"
                  placeholder="Add more details about your post"
                />
              </div>

              {detectedPostType !== 'announcement' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📍 Location</label>
                  <input
                    type="text"
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter location (e.g., Library, CSE Lab, Cafeteria)"
                  />
                </div>
              )}

              {detectedPostType === 'event' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📅 Event Date & Time</label>
                  <input
                    type="datetime-local"
                    value={postDate}
                    onChange={(e) => setPostDate(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <button
                onClick={handleCreatePost}
                disabled={creatingPost || !postTitle.trim()}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all text-lg shadow-lg hover:shadow-xl"
              >
                {creatingPost ? '🔄 Creating Post...' : '🚀 Create Post'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
