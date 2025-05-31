import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import '../style/AdminFeedback.css';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const feedbackTypeOptions = [
  'Всички',
  'Доклад за грешка',
  'Предложение',
  'Жалба',
  'Обща обратна връзка',
  'Помощ и въпроси'
];

const AdminFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [selectAll, setSelectAll] = useState(false); 
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterType, setFilterType] = useState('Всички');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const fetchFeedback = async () => {
    try {
      const res = await axios.get(`${backendUrl}/feedback/getAllFeedback`);
      setFeedbackList(res.data.feedback);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const confirmDelete = async () => {
    try {
      if (Array.isArray(deleteTargetId)) {
        const filteredSelectedIds = selectedIds.filter((id) => {
          const feedback = feedbackList.find((f) => f._id === id);
          return filterType === 'Всички' || feedback.feedbackType === filterType;
        });
    
        if (filteredSelectedIds.length > 0) {
          if (Array.isArray(filteredSelectedIds)) {
            await axios.post(`${backendUrl}/feedback/deleteMultipleFeedback`, {
              ids: filteredSelectedIds,
            });
          }
          setSelectedIds([]); 
          setSelectAll(false);  
        }
      } else {
        await axios.delete(`${backendUrl}/feedback/deleteFeedbackById/${deleteTargetId}`);
      }
      fetchFeedback();
    } catch (err) {
      console.error('Error deleting feedback:', err);
    } finally {
      closeDeleteModal();
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]); 
    } else {
      // Маркира всички редове, които съвпадат с текущия филтър
      const filteredIds = feedbackList
        .filter(fb => filterType === 'Всички' || fb.feedbackType === filterType)
        .map(fb => fb._id);
      setSelectedIds(filteredIds); // Маркира само записите от активната категория
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

  const filtered = feedbackList
    .filter((f) => filterType === 'Всички' || f.feedbackType === filterType)
    .sort((a, b) => {
      const factor = sortOrder === 'asc' ? 1 : -1;
      if (sortKey === 'rating') return factor * (a.rating - b.rating);
      if (sortKey === 'feedbackType') return factor * a.feedbackType.localeCompare(b.feedbackType);
      return factor * (new Date(a.createdAt) - new Date(b.createdAt));
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
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          {feedbackTypeOptions.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
          <option value="createdAt">Дата</option>
          <option value="rating">Оценка</option>
          <option value="feedbackType">Тип</option>
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
              <th>Тип</th>
              <th>Съобщение</th>
              <th>Оценка</th>
              <th>Дата</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((fb) => (
              <tr key={fb._id}>
                <td><input type="checkbox" checked={selectedIds.includes(fb._id)} onChange={() => toggleSelect(fb._id)} /></td>
                <td>{fb.user?.email}</td>
                <td>{fb.feedbackType}</td>
                <td>{fb.message || '-'}</td>
                <td>{fb.rating}</td>
                <td>{new Date(fb.createdAt).toLocaleString()}</td>
                <td><FaTrash
                                className="icon delete-icon"
                                title="Изтрий"
                                onClick={() => openDeleteModal(fb._id)}
                              />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : (
        <div className="feedback-card-list">
          {filtered.map((fb) => (
            <div key={fb._id} className="feedback-card">
              <div><strong>Потребител:</strong> {fb.user?.email}</div>
              <div><strong>Тип:</strong> {fb.feedbackType}</div>
              <div><strong>Съобщение:</strong> {fb.message || '-'}</div>
              <div><strong>Оценка:</strong> {fb.rating}</div>
              <div><strong>Дата:</strong> {new Date(fb.createdAt).toLocaleString()}</div>
              <FaTrash
                                className="icon delete-icon"
                                title="Изтрий"
                                onClick={() => openDeleteModal(fb._id)}
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

export default AdminFeedback;
