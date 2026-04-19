import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";

export default function UserList({ instituteId }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState("");

  const fetchUsers = () => {
    if (!instituteId) return;
    apiClient
      .get("/api/users/", {
        params: { institute: instituteId, search, page },
      })
      .then((res) => {
        setUsers(res.data.results);
        setTotal(res.data.total);
        setPageSize(res.data.page_size);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load user database.");
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [instituteId, search, page]);

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? All their data will be purged!")) return;
    try {
      await apiClient.delete(`/api/users/${userId}/delete/`);
      fetchUsers();
    } catch(err) {
      alert("Error deleting user: " + (err.response?.data?.detail || err.message));
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="dashboard-card">
      <div className="card-title">
        <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
        Member Directory
      </div>

      {error && <p className="pill-error-msg">{error}</p>}

      <div style={{ marginBottom: 20 }}>
        <div className="dashboard-pill-input" style={{ maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="dashboard-table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Email Address</th>
              <th>System Role</th>
              <th style={{ width: 80, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.full_name}</strong></td>
                <td>{u.email}</td>
                <td><span style={{ color: '#2196F3', fontWeight: 'bold' }}>{u.role}</span></td>
                <td style={{ textAlign: 'center' }}>
                  {u.role !== 'ADMIN' && (
                    <button 
                      style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: 4 }}
                      onClick={() => deleteUser(u.id)}
                      title="Permanently Delete User"
                    >
                      <span className="material-icons-round" style={{ fontSize: 20 }}>delete</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>
                  No members found in the directory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="dashboard-pagination">
        <span>
          Showing page <strong>{page}</strong> of {totalPages} ({total} members total)
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
