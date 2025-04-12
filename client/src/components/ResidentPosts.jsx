import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_POSTS, GET_POSTS_BY_CATEGORY } from '../graphql/queries';

function ResidentPosts() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();
  
  // Check auth on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== 'Resident') {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);
  
  // Query selection based on category filter
  const query = selectedCategory === 'All' ? GET_POSTS : GET_POSTS_BY_CATEGORY;
  const variables = selectedCategory === 'All' ? {} : { category: selectedCategory };
  
  // Use Apollo query
  const { loading, error, data } = useQuery(query, {
    variables,
    fetchPolicy: 'network-only', // Don't use cache for this query
  });
  
  // Get posts from query result
  const posts = data?.getPosts || data?.getPostsByCategory || [];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Community Posts</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/create-post')}
        >
          Create New Post
        </button>
      </div>
      
      {/* Category filter */}
      <div className="mb-4">
        <label className="form-label">Filter by Category:</label>
        <select 
          className="form-select" 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="News/Discussion">News & Discussion</option>
          <option value="Help Request">Help Request</option>
          <option value="Emergency Alert">Emergency Alert</option>
        </select>
      </div>
      
      {loading ? (
        <p>Loading posts...</p>
      ) : error ? (
        <div className="alert alert-danger">{error.message}</div>
      ) : posts.length === 0 ? (
        <p>No posts found. Be the first to create a post!</p>
      ) : (
        <div className="row">
          {posts.map(post => (
            <div className="col-md-6 mb-4" key={post.id}>
              <div className={`card ${getCategoryCardClass(post.category)}`}>
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{post.title}</h5>
                  <span className="badge bg-secondary">{post.category}</span>
                </div>
                <div className="card-body">
                  <p className="card-text">{post.content}</p>
                  
                  {/* Show emergency-specific info */}
                  {post.category === 'Emergency Alert' && post.emergency && (
                    <div className="alert alert-danger mt-2">
                      <strong>Severity: {post.emergency.severity || 'Medium'}</strong>
                      <p className="mb-0">
                        Status: {post.emergency.resolved ? 'Resolved' : 'Active'}
                      </p>
                    </div>
                  )}
                  
                  {/* Show help request-specific info */}
                  {post.category === 'Help Request' && post.helpRequest && (
                    <div className="alert alert-info mt-2">
                      <strong>Status: {post.helpRequest.status || 'Open'}</strong>
                      <p className="mb-0">
                        Volunteers: {post.helpRequest.volunteers?.length || 0}
                      </p>
                    </div>
                  )}
                </div>
                <div className="card-footer text-muted">
                  <small>Posted by {post.authorName} on {new Date(post.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to get card class based on category
function getCategoryCardClass(category) {
  switch (category) {
    case 'Emergency Alert':
      return 'border-danger';
    case 'Help Request':
      return 'border-info';
    case 'News/Discussion':
      return 'border-primary';
    default:
      return '';
  }
}

export default ResidentPosts;