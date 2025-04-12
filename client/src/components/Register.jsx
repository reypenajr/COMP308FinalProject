import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { REGISTER_USER } from '../graphql/mutations';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Resident');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [register, { loading }] = useMutation(REGISTER_USER, {
    onCompleted: () => {
      // Redirect to login page after successful registration
      navigate('/login');
    },
    onError: (error) => {
      setError(error.message || 'Registration failed');
      console.error('Registration error:', error);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await register({ 
        variables: { 
          input: {
            firstName,
            lastName,
            email,
            password,
            role
          } 
        } 
      });
    } catch (err) {
      // Error is handled in onError callback
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Register</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">First Name</label>
          <input
            type="text"
            className="form-control"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            className="form-control"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Role</label>
          <select 
            className="form-select" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="Resident">Resident</option>
            <option value="BusinessOwner">Business Owner</option>
            <option value="CommunityOrganizer">Community Organizer</option>
          </select>
        </div>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export default Register;