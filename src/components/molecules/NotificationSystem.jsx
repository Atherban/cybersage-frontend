import React, { useEffect } from "react";
import { useUIStore } from "../../stores/use.store.js";
import "./NotificationSystem.css";

const NotificationSystem = () => {
  const { notifications, removeNotification } = useUIStore();

  useEffect(() => {
    // Auto-remove notifications after 5 seconds
    const timers = notifications.map((notif) =>
      setTimeout(() => {
        removeNotification(notif.id);
      }, 4000)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification ${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
            <button className="notification-close">×</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
