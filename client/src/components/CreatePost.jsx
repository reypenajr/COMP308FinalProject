import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { CREATE_POST } from '../graphql/mutations';
import { GET_POSTS } from '../graphql/queries';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('News/Discussion');
  const [severity, setSeverity] = useState('Medium');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [businessDeals, setBusinessDeals] = useState('');
  const [businessImage, setBusinessImage] = useState('');
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userData);
    setUser(user);
    
    // Redirect if user role is not valid for posting
    if (user.role !== 'Resident' && user.role !== 'BusinessOwner') {
      navigate('/dashboard');
      return;
    }
    
    // Set default category based on role
    if (user.role === 'BusinessOwner') {
      setCategory('Business');
    }
  }, [navigate]);
  
  const [createPost, { loading }] = useMutation(CREATE_POST, {
    onCompleted: () => {
      // Redirect to posts page after successful creation
      navigate('/posts');
    },
    onError: (error) => {
      setError(error.message || 'Failed to create post');
      console.error('Error creating post:', error);
    },
    refetchQueries: [{ query: GET_POSTS }], // Refresh posts list
    awaitRefetchQueries: true
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const postInput = {
        title,
        content,
        category
      };
      
      // Add category-specific data
      if (category === 'Emergency Alert') {
        postInput.severity = severity;
      }
      
      // Add business-specific data for business owners
      if (category === 'Business') {
        postInput.businessName = businessName;
        postInput.businessDescription = businessDescription;
        postInput.businessDeals = businessDeals.split(',').map(deal => deal.trim()).filter(deal => deal);
        postInput.businessImage = businessImage;
      }
      
      await createPost({
        variables: { input: postInput }
      });
    } catch (err) {
      // Error is handled in onError callback
    }
  };
  
  return (
    <div className="container mt-4">
      <h2>Create New Post</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Post Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            disabled={user?.role === 'BusinessOwner'}
          >
            {user?.role === 'Resident' ? (
              <>
                <option value="News/Discussion">News & Discussion</option>
                <option value="Help Request">Help Request</option>
                <option value="Emergency Alert">Emergency Alert</option>
              </>
            ) : (
              <option value="Business">Business Post</option>
            )}
          </select>
        </div>
        
        {/* Show severity field only for Emergency Alerts */}
        {category === 'Emergency Alert' && (
          <div className="mb-3">
            <label className="form-label">Emergency Severity</label>
            <select
              className="form-select"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        )}
        
        {/* Show business fields only for Business Owners */}
        {category === 'Business' && (
          <>
            <div className="mb-3">
              <label className="form-label">Business Name</label>
              <input
                type="text"
                className="form-control"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Business Description</label>
              <textarea
                className="form-control"
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                rows="3"
                required
              ></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label">Special Deals (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                value={businessDeals}
                onChange={(e) => setBusinessDeals(e.target.value)}
                placeholder="e.g., 10% off for community members, Free coffee on Mondays"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Image URL (optional)</label>
              <input
                type="text"
                className="form-control"
                value={businessImage}
                onChange={(e) => setBusinessImage(e.target.value)}
                placeholder="Enter an image URL for your business"
              />
            </div>
          </>
        )}
        
        <div className="mb-3">
          <label className="form-label">Content</label>
          <textarea
            className="form-control"
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        
        <div className="mb-3">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary ms-2"
            onClick={() => navigate('/posts')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;