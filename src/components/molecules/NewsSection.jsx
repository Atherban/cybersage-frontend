import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_URL } from "../../constants/api";

const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchNews();
    }
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/news`);

      if (response.data.cybersecurity_news) {
        setNews(response.data.cybersecurity_news.slice(0, 3)); // Show only 3 latest news
      } else {
        setError("No news data available");
      }
    } catch (err) {
      setError("Failed to fetch latest threats");
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshNews = () => {
    fetchNews();
  };

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "severity-critical";
      case "high":
        return "severity-high";
      case "medium":
        return "severity-medium";
      case "low":
        return "severity-low";
      default:
        return "severity-medium";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="news-section">
      <div className="news-header">
        <h2 className="news-title">Threat Intelligence Brief</h2>
        <button
          className="refresh-button"
          onClick={refreshNews}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </div>

      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          Gathering latest intelligence...
        </div>
      )}

      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={refreshNews} className="retry-button">
            Retry Connection
          </button>
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div className="no-news">
          <p>No active threats reported at this time</p>
          <button onClick={refreshNews} className="retry-button">
            Refresh Status
          </button>
        </div>
      )}

      {!loading && !error && news.length > 0 && (
        <div className="news-list">
          {news.map((item, index) => (
            <div key={`${item.title}-${index}`} className="news-item">
              <div className="news-item-header">
                <h3 className="news-item-title">{item.title}</h3>
                {item.severity_level && (
                  <span
                    className={`severity-badge ${getSeverityClass(
                      item.severity_level
                    )}`}
                  >
                    {item.severity_level}
                  </span>
                )}
              </div>

              <p className="news-item-description">{item.description}</p>

              <div className="news-item-footer">
                <span className="news-date">{formatDate(item.date)}</span>
                <span className="news-source">{item.source}</span>
              </div>

              {item.attack_vectors && item.attack_vectors.length > 0 && (
                <div className="attack-vectors">
                  <strong>Attack Methods: </strong>
                  {item.attack_vectors.join(" • ")}
                </div>
              )}

              {item.affected_entities && item.affected_entities.length > 0 && (
                <div className="affected-entities">
                  <strong>Primary Targets: </strong>
                  {item.affected_entities.slice(0, 3).join(", ")}
                  {item.affected_entities.length > 3 && "..."}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsSection;
