import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { CREATE_EVENT } from "../graphql/mutations";
import { GET_EVENTS } from "../graphql/queries";

function CreateEvent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== "CommunityOrganizer") {
      navigate("/dashboard");
      return;
    }
  }, [navigate]);

  const [createEvent, { loading }] = useMutation(CREATE_EVENT, {
    onCompleted: () => {
      // Redirect to posts page after successful creation
      navigate("/events");
    },
    onError: (error) => {
      setError(error.message || "Failed to create event");
      console.error("Error creating event:", error);
    },
    refetchQueries: [{ query: GET_EVENTS }], // Refresh posts list
    awaitRefetchQueries: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent default form submission
  
    setError(""); // Reset any previous errors
  
    try {
      // Log the value of the date before processing
      console.log("Date value:", date);
  
      // Check if date is empty
      if (!date) {
        throw new Error("Please select a date.");
      }
  
      // Check if the date is in a valid format
      const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
      if (!datePattern.test(date)) {
        throw new Error("Invalid date format. Please use the correct date/time format.");
      }
  
      // Try to create a Date object
      const validDate = new Date(date);
      if (isNaN(validDate)) {
        throw new Error("Invalid date format");
      }
  
      const eventData = {
        title,
        description,
        location,
        date: validDate.toISOString(),  // Ensure the date is in ISO string format
      };
  
      // Call your GraphQL mutation here and pass eventData
      await createEvent({
        variables: { input: eventData },
      });
  
    } catch (err) {
      setError(err.message || "Failed to create event");
      console.error("Error creating event:", err);
    }
  };
  
  
  

  return (
    <div className="container mt-4">
      <h2>Create New Event</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Location</label>
          <input
            type="text"
            className="form-control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Date</label>
          <input
            type="datetime-local"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <button type="submit" className="btn btn-primary">
            Create Event
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => navigate("/events")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEvent;
