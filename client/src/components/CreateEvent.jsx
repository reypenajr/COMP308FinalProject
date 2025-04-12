import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { CREATE_EVENT } from "../graphql/mutations";
import { GET_EVENTS } from "../graphql/queries";
import { predictEventDate } from "../utils/predictDate"; // Adjust path if needed
import { suggestVolunteers } from "../utils/aiHelpers";

function CreateEvent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState("");

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
    e.preventDefault(); // Prevent default form submission

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
        throw new Error(
          "Invalid date format. Please use the correct date/time format."
        );
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
        date: validDate.toISOString(), // Ensure the date is in ISO string format
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

  const handleSuggestDate = async () => {
    try {
      if (!title || !description) {
        setError(
          "Please enter title and description for AI to suggest a date."
        );
        return;
      }

      const aiDate = await predictEventDate(title, description);

      // Optional: validate format
      const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
      if (!datePattern.test(aiDate)) {
        throw new Error("AI returned an invalid date format.");
      }

      setDate(aiDate);
      setError(""); // Clear error
    } catch (err) {
      setError(err.message || "Failed to suggest date using AI.");
    }
  };

  const handleSuggestVolunteers = async () => {
    try {
      if (!title || !description) {
        setError(
          "Please enter title and description for AI to suggest volunteers."
        );
        return;
      }

      const suggested = await suggestVolunteers(title, description);
      setVolunteers(suggested);
      setError(""); // Clear any previous errors
    } catch (err) {
      setError(err.message || "Failed to suggest volunteers using AI.");
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
          <button
            type="button"
            className="btn btn-info me-2"
            onClick={handleSuggestDate}
          >
            Suggest Date with AI
          </button>

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
        <div className="mb-3">
          <label className="form-label">Suggested Volunteers</label>
          <textarea
            className="form-control"
            rows="2"
            value={volunteers}
            onChange={(e) => setVolunteers(e.target.value)}
            placeholder="AI suggested roles will appear here"
            disabled
          />
          <button
            type="button"
            className="btn btn-outline-success mt-2"
            onClick={handleSuggestVolunteers}
          >
            Add Volunteers using AI
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEvent;
