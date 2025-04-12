import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_POSTS, GET_POSTS_BY_CATEGORY, GET_ALL_POSTS } from '../graphql/queries';
import { ADD_REVIEW, ANALYZE_SENTIMENT } from '../graphql/mutations';

function CommunityPosts() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [user, setUser] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [sentimentMap, setSentimentMap] = useState({});
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
    setUser(user);
    
    // Modified to allow any authenticated user to view posts
    if (!['Resident', 'BusinessOwner', 'CommunityOrganizer'].includes(user.role)) {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);
  
  // Query selection based on category filter and user role
  // Use GET_ALL_POSTS to ensure all users can see all post types
  const query = selectedCategory === 'All' ? GET_ALL_POSTS : GET_POSTS_BY_CATEGORY;
  const variables = selectedCategory === 'All' ? {} : { category: selectedCategory };
  
  // Use Apollo query
  const { loading, error, data, refetch } = useQuery(query, {
    variables,
    fetchPolicy: 'network-only', // Don't use cache for this query
  });
  
  const [addReview] = useMutation(ADD_REVIEW);
  const [analyzeSentiment] = useMutation(ANALYZE_SENTIMENT);
  
  // Get posts from query result
  const posts = data?.getAllPosts || data?.getPostsByCategory || [];

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPost || !reviewText) return;
    
    try {
      await addReview({
        variables: {
          input: {
            postId: selectedPost,
            text: reviewText,
            rating: parseInt(reviewRating)
          }
        }
      });
      
      // Reset form
      setSelectedPost(null);
      setReviewText('');
      setReviewRating(5);
      
      // Refresh posts to show new review
      refetch();
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  const handleAnalyzeSentiment = async (reviewId, text) => {
    try {
      const { data } = await analyzeSentiment({ variables: { text } });
      setSentimentMap((prev) => ({ ...prev, [reviewId]: data.analyzeSentiment }));
    } catch (err) {
      console.error('Sentiment analysis error:', err);
    }
  };
  
  // Helper function to format dates safely
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Recent';
      
      // Check if it's a valid date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recent';
      
      return date.toLocaleDateString();
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Recent';
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Community Posts</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/create-post')}
        >
          Create New {user?.role === 'BusinessOwner' ? 'Business ' : ''}Post
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
          <option value="Business">Business Posts</option>
        </select>
      </div>
      
      {/* Review Form */}
      {selectedPost && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h4>Write a Review</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-3">
                <label className="form-label">Rating</label>
                <select 
                  className="form-select"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(e.target.value)}
                  required
                >
                  <option value="5">5 Stars - Excellent</option>
                  <option value="4">4 Stars - Very Good</option>
                  <option value="3">3 Stars - Good</option>
                  <option value="2">2 Stars - Fair</option>
                  <option value="1">1 Star - Poor</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Your Review</label>
                <textarea 
                  className="form-control"
                  rows="3"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                  placeholder="Share your experience with this business..."
                ></textarea>
              </div>
              <div className="d-flex justify-content-between">
                <button type="submit" className="btn btn-primary">Submit Review</button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setSelectedPost(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
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
                  
                  {/* Show business post specific info */}
                  {post.category === 'Business' && post.businessInfo && (
                    <div className="card border-success mt-2">
                      <div className="card-header bg-success text-white">
                        <strong>{post.businessInfo.name || post.title}</strong>
                      </div>
                      <div className="card-body">
                        <p>{post.businessInfo.description || post.content}</p>
                        
                        {post.businessInfo.image && (
                          <img 
                            src={post.businessInfo.image} 
                            alt="Business" 
                            className="img-fluid mb-2" 
                            style={{ maxHeight: '200px' }}
                          />
                        )}
                        
                        {post.businessInfo.deals && post.businessInfo.deals.length > 0 && (
                          <div className="alert alert-info mt-3">
                            <strong>Current Deals:</strong>
                            <ul className="mb-0">
                              {post.businessInfo.deals.map((deal, idx) => (
                                <li key={idx}>{deal}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Reviews section */}
                        <div className="mt-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">Customer Reviews</h6>
                            {user && user.role !== 'BusinessOwner' && (
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setSelectedPost(post.id)}
                              >
                                Write a Review
                              </button>
                            )}
                          </div>
                          
                          {!post.businessInfo.reviews || post.businessInfo.reviews.length === 0 ? (
                            <p className="text-muted small">No reviews yet. Be the first to review!</p>
                          ) : (
                            <div className="list-group">
                              {post.businessInfo.reviews.map(review => (
                                <div className="list-group-item" key={review.reviewId}>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">{review.authorName}</h6>
                                    <div>
                                      {Array.from({ length: review.rating }).map((_, i) => (
                                        <span key={i} className="text-warning">★</span>
                                      ))}
                                      {Array.from({ length: 5 - review.rating }).map((_, i) => (
                                        <span key={i} className="text-muted">★</span>
                                      ))}
                                    </div>
                                  </div>
                                  <p className="mb-1 mt-1">{review.text}</p>
                                  <div className="d-flex justify-content-between">
                                    <small className="text-muted">
                                      {formatDate(review.createdAt)}
                                    </small>
                                    {user && user.role === 'BusinessOwner' && (
                                      <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => handleAnalyzeSentiment(review.reviewId, review.text)}
                                      >
                                        Analyze Sentiment
                                      </button>
                                    )}
                                  </div>
                                  {sentimentMap[review.reviewId] && (
                                    <div className="mt-1">
                                      <span className={`badge ${
                                        sentimentMap[review.reviewId] === 'Positive' 
                                          ? 'bg-success' 
                                          : sentimentMap[review.reviewId] === 'Negative'
                                            ? 'bg-danger'
                                            : 'bg-warning text-dark'
                                      }`}>
                                        {sentimentMap[review.reviewId]} sentiment
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="card-footer text-muted">
                  <small>
                    Posted by {post.authorName} on {
                      post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date'
                    }
                  </small>
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
    case 'Business':
      return 'border-success';
    default:
      return '';
  }
}

export default CommunityPosts;