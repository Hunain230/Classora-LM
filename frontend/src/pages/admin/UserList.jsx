import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";

export default function UserList({ instituteId }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState("");

  useEffect(() => {
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
        if (err.response && err.response.status === 403) {
          setError("You do not have permission to view users.");
        } else {
          setError("Failed to load users.");
        }
      });
  }, [instituteId, search, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ marginBottom: 8 }}>Users</h3>
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      <div style={{ marginBottom: 8, display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 6,
            border: "1px solid #d1d5db",
            fontSize: 14,
          }}
        />
      </div>

      {users.length === 0 ? (
        <p>No users found for this institute.</p>
      ) : (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #e5e7eb",
            }}
          >
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ padding: 8, borderBottom: "1px solid #e5e7eb" }}>
                  Name
                </th>
                <th style={{ padding: 8, borderBottom: "1px solid #e5e7eb" }}>
                  Email
                </th>
                <th style={{ padding: 8, borderBottom: "1px solid #e5e7eb" }}>
                  Role
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>
                    {u.full_name}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>
                    {u.email}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>
                    {u.role}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              marginTop: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 14,
            }}
          >
            <span>
              Page {page} of {totalPages} (total {total} users)
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: 4,
                  border: "1px solid #d1d5db",
                  backgroundColor: page <= 1 ? "#f9fafb" : "#ffffff",
                  cursor: page <= 1 ? "default" : "pointer",
                }}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: 4,
                  border: "1px solid #d1d5db",
                  backgroundColor: page >= totalPages ? "#f9fafb" : "#ffffff",
                  cursor: page >= totalPages ? "default" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

