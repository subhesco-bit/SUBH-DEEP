// REDUNDANT STUB: superseded by frontend/src/pages/GovernmentDashboardPage.jsx
// (routed at /government-dashboard), whose "Announcements" and "Weather
// Alerts" tabs already cover government-to-farmer notifications via
// governmentSchemeAPI.getAnnouncements/getWeatherAlerts. Left in place,
// unrouted, per merge-not-delete policy — do not route this file.
import React, { useState } from 'react';

const GovernmentNotificationCenter = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Government Notification Center</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white rounded-lg shadow p-6">
        {/* Page content */}
        <p className="text-gray-600">Content for GovernmentNotificationCenter</p>
      </div>
    </div>
  );
};

export default GovernmentNotificationCenter;
