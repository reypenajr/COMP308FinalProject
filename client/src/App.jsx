// App.jsx
import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import CommunityPosts from "./components/ResidentPosts";
import CommunityOrganizerPosts from "./components/CommunityOrgPosts";
import BusinessPosts from "./components/BusinessPosts";
import CreatePost from "./components/CreatePost";
import CreateEvent from "./components/CreateEvent";

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    !!localStorage.getItem("token")
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  return (
    <Router>
<Navbar bg="primary" variant="dark" expand="lg" className="w-100 shadow-sm fixed-top">

        <Container fluid className="px-4">
          <Navbar.Brand as={Link} to="/" className="fw-bold text-white fs-4">
            Community App
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/" className="nav-item-custom text-white">
                Home
              </Nav.Link>
              {!isAuthenticated ? (
                <>
                  <Nav.Link
                    as={Link}
                    to="/login"
                    className="nav-item-custom text-white"
                  >
                    Login
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/register"
                    className="nav-item-custom text-white"
                  >
                    Register
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link
                    as={Link}
                    to="/dashboard"
                    className="nav-item-custom text-white"
                  >
                    Dashboard
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/"
                    onClick={handleLogout}
                    className="nav-item-custom text-white"
                  >
                    Logout
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div>
        <Routes>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route
            path="login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="posts" element={<CommunityPosts />} />
          <Route path="events" element={<CommunityOrganizerPosts />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="create-event" element={<CreateEvent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
