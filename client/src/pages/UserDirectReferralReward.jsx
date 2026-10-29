import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Sidebar from "../components/user/UserSidebar";
import Topbar from "../components/user/UserTopbar";
import { formatDateTimeIST } from "../utils/dateFormat";

const UserDirectReferralReward = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const token = localStorage.getItem("token");

  // ✅ FETCH DATA
  const fetchDirectReferrals = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/users/my-direct-income`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const formattedData = (res.data || []).map((item) => ({
        id: `D-${item.id}`,
        from: item.from || "-",
        fromId: item.fromId || "-",
        to: item.to || "-",
        toId: item.toId || "-",
        type: item.type || "Direct Referral Reward",
        amount: `$${Number(item.amount || 0).toFixed(2)}`,
        date: item.date || item.created_at,
      }));

      // Sort by newest date first
      const sorted = formattedData.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setData(sorted);
    } catch (err) {
      console.error("Direct referral reward fetch error:", err);
    }
  };

  useEffect(() => {
    fetchDirectReferrals();
  }, []);

  // ✅ FILTER
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      Object.values(item)
        .join("")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search, data]);

  // ✅ PAGINATION
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const getPagination = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(page - 2, 1);
    let end = Math.min(start + maxVisible - 1, totalPages);

    if (end - start < maxVisible - 1) {
      start = Math.max(end - maxVisible + 1, 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="utxLayout">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="main">
        <Topbar isOpen={isOpen} setIsOpen={setIsOpen} />

        <div className="utxContent">
          <div className="utxFirstContent">
            <h2 className="utxTitle">Direct Referral Rewards</h2>

            <div className="utxSearch">
              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="utxTableWrapper">
            <table className="utxTable">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>FROM USER</th>
                  <th>TO USER</th>
                  <th>TYPE</th>
                  <th>AMOUNT</th>
                  <th>CREATED AT</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No direct referral rewards found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr key={item.id}>
                      <td>{(page - 1) * rowsPerPage + index + 1}</td>
                      <td>
                        <p>{item.from}</p>
                        <span>{item.fromId}</span>
                      </td>
                      <td>
                        <p>{item.to}</p>
                        <span>{item.toId}</span>
                      </td>
                      <td>{item.type}</td>
                      <td className="utxAmount">{item.amount}</td>
                      <td>{formatDateTimeIST(item.date)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ CLEAN PAGINATION */}
          <div className="usrDeposit__footer">
            <div className="usrDeposit__rows">
              Rows:
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="usrDeposit__pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {"<"}
              </button>

              {getPagination().map((p, i) =>
                p === "..." ? (
                  <span key={i}>...</span>
                ) : (
                  <button
                    key={i}
                    className={page === p ? "active" : ""}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                {">"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDirectReferralReward;