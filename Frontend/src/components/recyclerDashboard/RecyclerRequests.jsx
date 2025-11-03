// RecyclerRequests.jsx
import { useEffect, useState } from "react";
import { recyclerAPI } from "../../services/authService";

const RecyclerRequests = () => {
  const [requests, setRequests] = useState([]);

  const recyclerId = localStorage.getItem("recyclerId");

  const fetchRequests = async () => {
    try {
      const data = await recyclerAPI.getRecyclerRequests(recyclerId);
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div>
      <h2>Pending Requests</h2>

      {requests.length === 0 ? (
        <p>No new requests available.</p>
      ) : (
        requests.map((post) => (
          <div key={post._id} className="card">
            <h3>{post.productName}</h3>
            <p>Brand: {post.brand}</p>
            <p>Condition: {post.condition}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default RecyclerRequests;