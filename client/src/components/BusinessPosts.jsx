

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BUSINESS_POSTS } from '../graphql/queries';
import { ANALYZE_SENTIMENT } from '../graphql/mutations';


function BusinessPosts() {
  //const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [sentimentMap, setSentimentMap] = useState({});
  const navigate = useNavigate();

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'BusinessOwner') {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

  const { loading, error, data, refetch } = useQuery(GET_BUSINESS_POSTS, {
    fetchPolicy: 'network-only',
  });

  const [analyzeSentiment] = useMutation(ANALYZE_SENTIMENT);

  const businesses = data?.getBusinessPosts || [];

  const handleAnalyzeSentiment = async (reviewId, text) => {
    try {
      const { data } = await analyzeSentiment({ variables: { text } });
      setSentimentMap((prev) => ({ ...prev, [reviewId]: data.analyzeSentiment }));
    } catch (err) {
      console.error('Sentiment analysis error:', err);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Business Listings</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/create-business')}
        >
          Create Business Profile
        </button>
      </div>

      {loading ? (
        <p>Loading business posts...</p>
      ) : error ? (
        <div className="alert alert-danger">{error.message}</div>
      ) : businesses.length === 0 ? (
        <p>No business listings yet. Create your profile now!</p>
      ) : (
        <div className="row">
          {businesses.map((biz) => (
            <div className="col-md-6 mb-4" key={biz.id}>
              <div className="card border-success">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{biz.name}</h5>
                  <span className="badge bg-success">Business</span>
                </div>
                <div className="card-body">
                  <p><strong>Description:</strong> {biz.description}</p>
                  {biz.image && <img src={biz.image} alt="Business" className="img-fluid mb-2" />}
                  {biz.deals && (
                    <div className="alert alert-info mt-3">
                      <strong>Current Deals:</strong>
                      <ul className="mb-0">
                        {biz.deals.map((deal, idx) => (
                          <li key={idx}>{deal}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-3">
                    <strong>Customer Reviews:</strong>
                    {biz.reviews.length === 0 ? (
                      <p>No reviews yet.</p>
                    ) : (
                      <ul className="list-group">
                        {biz.reviews.map((review) => (
                          <li className="list-group-item" key={review.id}>
                            <p>{review.text}</p>
                            <small>By {review.authorName}</small>
                            <div className="mt-2">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleAnalyzeSentiment(review.id, review.text)}
                              >
                                Analyze Sentiment
                              </button>
                              {sentimentMap[review.id] && (
                                <div className="mt-2">
                                  <span className="badge bg-warning text-dark">
                                    {sentimentMap[review.id]}
                                  </span>
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="card-footer text-muted">
                  <small>Posted on {new Date(biz.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BusinessPosts;
