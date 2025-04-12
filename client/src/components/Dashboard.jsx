import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
    } catch (err) {
      console.error('Error parsing user data:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);
  
  if (!user) {
    return <div className="container mt-5">Loading...</div>;
  }
  
  return (
    <div className="container mt-5">
      <h1>Your Dashboard</h1>
      <p>Welcome, {user.firstName} {user.lastName}!</p>
      
      <div className="card mt-4">
        <div className="card-header">
          <h3>User Information</h3>
        </div>
        <div className="card-body">
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>User ID:</strong> {user.id}</p>
        </div>
      </div>
      
      {/* Role-specific content */}
      {user.role === 'Resident' && (
        <div className="card mt-4">
          <div className="card-header">
            <h3>Resident Dashboard</h3>
          </div>
          <div className="card-body">
            <p>This is the Resident-specific dashboard area.</p>
            <div className="mt-3">
              <button 
                className="btn btn-primary me-2"
                onClick={() => navigate('/posts')}
              >
                View Community Posts
              </button>
              <button 
                className="btn btn-success"
                onClick={() => navigate('/create-post')}
              >
                Create New Post
              </button>
            </div>
          </div>
        </div>
      )}
      
      {user.role === 'BusinessOwner' && (
        <div className="card mt-4">
          <div className="card-header">
            <h3>Business Owner Dashboard</h3>
          </div>
          <div className="card-body">
            <p>This is the Business Owner-specific dashboard area.</p>
            {/* Add business owner-specific features here */}
          </div>
        </div>
      )}
      
      {user.role === 'CommunityOrganizer' && (
        <div className="card mt-4">
          <div className="card-header">
            <h3>Community Organizer Dashboard</h3>
          </div>
          <div className="card-body">
            <p>This is the Community Organizer-specific dashboard area.</p>
            {/* Add community organizer-specific features here */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
