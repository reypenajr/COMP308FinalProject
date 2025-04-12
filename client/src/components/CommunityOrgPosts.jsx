import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ORGANIZER_EVENTS, GET_VOLUNTEERS } from "../graphql/queries";
import { PREDICT_EVENT_TIMING } from "../graphql/mutations";

function CommunityDashboard() {
  const [timingSuggestions, setTimingSuggestions] = useState({});
  const [volunteerMap, setVolunteerMap] = useState({});
  const navigate = useNavigate();

  // Auth check
  useEffect(() => {
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

  const { loading, error, data, refetch } = useQuery(GET_ORGANIZER_EVENTS, {
    fetchPolicy: "network-only",
  });

  const { data: volunteerData } = useQuery(GET_VOLUNTEERS);

  const [predictEventTiming] = useMutation(PREDICT_EVENT_TIMING);

  const events = data?.getOrganizerEvents || [];

  const handlePredictTiming = async (eventId, topic) => {
    try {
      const { data } = await predictEventTiming({ variables: { topic } });
      setTimingSuggestions((prev) => ({
        ...prev,
        [eventId]: data.predictEventTiming,
      }));
    } catch (err) {
      console.error("Timing prediction error:", err);
    }
  };

  const matchVolunteers = (eventTopic) => {
    const allVolunteers = volunteerData?.getVolunteers || [];
    return allVolunteers.filter((vol) => vol.interests.includes(eventTopic));
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Community Events</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/create-event")}
        >
          Create New Event
        </button>
      </div>

      {loading ? (
        <p>Loading events...</p>
      ) : error ? (
        <div className="alert alert-danger">{error.message}</div>
      ) : events.length === 0 ? (
        <p>No events found. Start engaging your community!</p>
      ) : (
        <div className="row">
          {events.map((event) => (
            <div className="col-md-6 mb-4" key={event.id}>
              <div className="card border-info">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{event.title}</h5>
                  <span className="badge bg-info">Event</span>
                </div>
                <div className="card-body">
                  <p>
                    <strong>Description:</strong> {event.description}
                  </p>
                  <p>
                    <strong>Scheduled:</strong>{" "}
                    {event.date
                      ? new Date(Number(event.date)).toLocaleString()
                      : "Invalid date"}
                  </p>

                  <div className="mt-4">
                    <strong></strong>
                    <ul className="list-group">
                      {matchVolunteers(event.topic).map((vol) => (
                        <li className="list-group-item" key={vol.id}>
                          {vol.name} - Interested in: {vol.interests.join(", ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="card-footer text-muted">
                  <small>
                    Created on {new Date(event.createdAt).toLocaleDateString()}
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

export default CommunityDashboard;
