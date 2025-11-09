import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_URL } from "../../constants/api";
import "./NewsSection.css";

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

  const fetchNews = async (force = false) => {
    try {
      setLoading(true);
      setError(null);

      if (!force) {
        const cachedData = localStorage.getItem("cybersage_news_cache");
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          setNews(parsed);
          setLoading(false);
          return;
        }
      }

      const response = await axios.get(`${API_URL}/news`);
      if (response.data.cybersecurity_news) {
        const latest = response.data.cybersecurity_news.slice(0, 3);
        setNews(latest);
        localStorage.setItem("cybersage_news_cache", JSON.stringify(latest));
      } else {
        setError("No news available");
      }
    } catch (err) {
      setError("Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  const refreshNews = () => {
    localStorage.removeItem("cybersage_news_cache");
    fetchNews(true); // force API fetch
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: "#FF6B6B",
      high: "#FFA726",
      medium: "#42A5F5",
      low: "#66BB6A",
    };
    return colors[severity?.toLowerCase()] || "#42A5F5";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="news-section">
      <div className="news-header">
        <div className="header-content">
          <h2 className="section-title font-title">Latest Threats</h2>
          <p className="section-subtitle font-body">
            Recent cybersecurity updates
          </p>
        </div>
        <button
          className="refresh-btn"
          onClick={refreshNews}
          disabled={loading}
        >
          {loading ? "⟳" : "↻"}
        </button>
      </div>

      <div className="news-content">
        {loading && (
          <div className="loading-state">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Loading threats...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={refreshNews} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && news.length === 0 && (
          <div className="empty-state">
            <p>No active threats reported</p>
          </div>
        )}

        {!loading && !error && news.length > 0 && (
          <div className="news-list">
            {news.map((item, index) => (
              <div key={`${item.title}-${index}`} className="news-item">
                <div className="item-header">
                  <div
                    className="severity-indicator"
                    style={{
                      backgroundColor: getSeverityColor(item.severity_level),
                    }}
                  ></div>
                  <div className="item-meta">
                    <span className="item-date">{formatDate(item.date)}</span>
                    <span className="item-source">{item.source}</span>
                  </div>
                </div>

                <h3 className="item-title">{item.title}</h3>
                <p className="item-description">{item.description}</p>

                <div className="item-tags">
                  {item.severity_level && (
                    <span
                      className="severity-tag"
                      style={{
                        color: getSeverityColor(item.severity_level),
                        borderColor: getSeverityColor(item.severity_level),
                      }}
                    >
                      {item.severity_level}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsSection;
