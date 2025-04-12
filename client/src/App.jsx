import './App.css';
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes
} from "react-router-dom";

// Import necessary components from React-Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

// Import your custom components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import ResidentPosts from './components/ResidentPosts';
import CreatePost from './components/CreatePost';

function App() {
  // Check if user is authenticated by looking for token in localStorage
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('token'));
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  return (
    <Router>
      {/* Navbar integrated directly in App.jsx */}
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="/">Community App</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              {/* Always show Home link */}
              <Nav.Link as={Link} to="/">Home</Nav.Link>

              {/* Show Login and Register if not authenticated */}
              {!isAuthenticated ? (
                <>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                  <Nav.Link as={Link} to="/" onClick={handleLogout}>Logout</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Routes for different pages */}
      <div>
        <Routes>
          <Route index element={<Home />} /> {/* Home route */}
          <Route path="home" element={<Home />} /> {/* Home route */}
          <Route path="login" element={<Login />} /> {/* Login route */}
          <Route path="register" element={<Register />} /> {/* Register route */}
          <Route path="dashboard" element={<Dashboard />} /> {/* Dashboard route */}
          <Route path="posts" element={<ResidentPosts />} /> {/* Posts route */}
          <Route path="create-post" element={<CreatePost />} /> {/* Create post route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
