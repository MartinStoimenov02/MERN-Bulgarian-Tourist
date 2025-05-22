import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import '../style/AdminFeedback.css';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false)
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const host = process.env.REACT_APP_HOST;
  const port = process.env.REACT_APP_PORT;

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`http://${host}:${port}/logs/getAllLogs`);
      setLogs(res.data.logs);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const confirmDelete = async () => {
    try {
      if (Array.isArray(deleteTargetId)) {
        await axios.post(`http://${host}:${port}/logs/deleteMultipleLogs`, {
          ids: deleteTargetId,
        });
        setSelectedIds([]);
        setSelectAll (false);
      } else {
        await axios.delete(`http://${host}:${port}/logs/deleteLogById/${deleteTargetId}`);
      }
      fetchLogs();
    } catch (err) {
      console.error('Error deleting logs:', err);
    } finally {
      closeDeleteModal();
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]); 
    } else {
      setSelectedIds(logs.map(log => log._id)); 
    }
    setSelectAll(!selectAll); 
  };  

  const openDeleteModal = (idOrIds) => {
    setDeleteTargetId(idOrIds);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filtered = logs
    .sort((a, b) => {
      const factor = sortOrder === 'asc' ? 1 : -1;
      if (sortKey === 'createdAt') return factor * (new Date(a.createdAt) - new Date(b.createdAt));
      return 0;
    });

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  window.addEventListener("resize", () => {
    setIsMobile(window.innerWidth <= 768);
  });

  return (
    <div className="admin-feedback-wrapper">
      <div className="admin-feedback-container">
        <div className="controls">
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
            <option value="createdAt">Дата</option>
          </select>

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Най-нови</option>
            <option value="asc">Най-стари</option>
          </select>

          {!isMobile && selectedIds.length > 0 && (
            <button className="delete-selected-btn" onClick={() => openDeleteModal(selectedIds)}>Изтрий избраните</button>
          )}
        </div>

        {!isMobile ? (
          <div className="table-wrapper">
            <table className="feedback-table">
              <thead>
                <tr>
                <th>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Потребител</th>
                  <th>Статус на грешката</th>
                  <th>Сообщение</th>
                  <th>Клас</th>
                  <th>Функция</th>
                  <th>Дата</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log._id}>
                    <td><input type="checkbox" checked={selectedIds.includes(log._id)} onChange={() => toggleSelect(log._id)} /></td>
                    <td>{log.user?.email}</td>
                    <td>{log.errorStatus}</td>
                    <td>{log.errorMessage}</td>
                    <td>{log.className}</td>
                    <td>{log.functionName}</td>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td><FaTrash
                      className="icon delete-icon"
                      title="Изтрий"
                      onClick={() => openDeleteModal(log._id)}
                    />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="feedback-card-list">
            {filtered.map((log) => (
              <div key={log._id} className="feedback-card">
                <div><strong>Потребител:</strong> {log.user?.email}</div>
                <div><strong>Статус на грешката:</strong> {log.errorStatus}</div>
                <div><strong>Сообщение:</strong> {log.errorMessage}</div>
                <div><strong>Клас:</strong> {log.className}</div>
                <div><strong>Функция:</strong> {log.functionName}</div>
                <div><strong>Дата:</strong> {new Date(log.createdAt).toLocaleString()}</div>
                <FaTrash
                  className="icon delete-icon"
                  title="Изтрий"
                  onClick={() => openDeleteModal(log._id)}
                />
              </div>
            ))}
          </div>
        )}

        {showDeleteModal && (
          <ConfirmDeleteModal
            onConfirm={confirmDelete}
            onCancel={closeDeleteModal}
          />
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
