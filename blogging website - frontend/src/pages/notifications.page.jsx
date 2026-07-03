import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import NotificationCard from "../components/notification-card.component";

const FILTERS = ["all", "like", "comment", "reply"];

const Notifications = () => {
  const { userAuth } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async (type = "all") => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/notifications`,
        {
          params: { type },
          headers: { Authorization: `Bearer ${userAuth.access_token}` },
        }
      );
      setNotifications(data.notifications);

      // Mark all as seen after fetching
      await axios.patch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/notifications/seen`,
        {},
        { headers: { Authorization: `Bearer ${userAuth.access_token}` } }
      );
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(filter);
  }, [filter]);

  return (
    <AnimationWrapper>
      <Toaster />
      <div>
        <h1 className="text-2xl font-medium mb-6">Recent Notifications</h1>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full capitalize text-sm transition-all ${
                filter === f
                  ? "bg-black text-white"
                  : "bg-grey text-dark-grey hover:bg-black/10"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="border border-grey rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-dark-grey animate-pulse">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-dark-grey">
              Nothing available
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationCard key={n._id} notification={n} />
            ))
          )}
        </div>
      </div>
    </AnimationWrapper>
  );
};

export default Notifications;