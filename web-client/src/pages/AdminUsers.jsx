import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import DeleteAccountModal from "../components/DeleteAccountModal";
import SendMessageModal from '../components/SendMessageModal';
import '../style/AdminFeedback.css'; // Използваме същите стилове

const AdminUsers = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [sortOption, setSortOption] = useState('name');
  const [isMessageMode, setIsMessageMode] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const host = process.env.REACT_APP_HOST;
  const port = process.env.REACT_APP_PORT;

  useEffect(() => {
      setUserFromSession();
    }, []);
  
    const setUserFromSession = () => {
      const session = localStorage.getItem("userSession");
      if (session) {
        const parsed = JSON.parse(session);
        setCurrentUser(parsed);
      }
    };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://${host}:${port}/users/getAllUsers`);
      setUsers(res.data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleEditClick = (user) => {
    setEditUserId(user._id);
    setEditedUser({ ...user });
  };

  const handleCancelEdit = () => {
    setEditUserId(null);
    setEditedUser({});
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://${host}:${port}/users/updateUser/${editUserId}`, editedUser);
      setEditUserId(null);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteClick = (user) => {
    user.id=user._id;
    user.hasPassword = user.password!=undefined ? true : false;
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteSuccess = () => {
    // Обнови списъка с потребители тук
    fetchUsers(); // или друга твоя функция
    setIsDeleteModalOpen(false);
  };

  const handleChange = (field, value) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
  };

  const toggleUserSelection = (id) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleOpenMessageMode = () => {
    setIsMessageMode(true);
    setSelectedUserIds([]);
  };

  const handleCancelMessageMode = () => {
    setIsMessageMode(false);
    setSelectedUserIds([]);
  };

  const handleConfirmSendMessage = () => {
    if (selectedUserIds.length === 0) {
      setMessage("Моля, изберете поне един потребител!");
      setSuccess(false); // или false, ако е грешка
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    setIsSendModalOpen(true);
  };

  const handleCloseSendModal = () => {
    setIsSendModalOpen(false);
  };

  const handleSendMessageSuccess = () => {
    setMessage("Съобщението е изпратено успешно!");
    setSuccess(true);
    setIsMessageMode(false);
    setSelectedUserIds([]);
    setTimeout(() => setMessage(""), 3000);
  };  

  const toggleSelectAll = () => {
    const filteredIds = filteredAndSortedUsers.map((u) => u._id);
    if (selectedUserIds.length === filteredIds.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredIds);
    }
  };  

  const filteredAndSortedUsers = users
  .filter(user => {
    if (filterOption === 'admins' && !user.isAdmin) return false;
    if (filterOption === 'regular' && user.isAdmin) return false;
    if (filterOption === 'google' && !user.isGoogleAuth) return false;
    if (filterOption === 'nogoogle' && user.isGoogleAuth) return false;
    return true;
  })
  .filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phoneNumber?.toLowerCase().includes(query)
    );
  })
  .sort((a, b) => {
    const aValue = a[sortOption];
    const bValue = b[sortOption];
    if (typeof aValue === 'string') return aValue.localeCompare(bValue);
    return (bValue || 0) - (aValue || 0); // points, boolean
  });


  return (
    <div className="admin-feedback-wrapper">
      <div className="admin-feedback-container">
      <div className="admin-controls">
        <input
          type="text"
          placeholder="Търси по име, имейл или телефон"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
          <option value="all">Всички</option>
          <option value="admins">Само админи</option>
          <option value="regular">Само обикновени потребители</option>
          <option value="google">Само с Google</option>
          <option value="nogoogle">Без Google</option>
        </select>

        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="name">Име</option>
          <option value="email">Имейл</option>
          <option value="points">Точки</option>
          <option value="admin">Админ</option>
          <option value="googleAuth">Google Auth</option>
        </select>

        {!isMessageMode ? (
          <button class="message-btn" title="Изпрати съобщение" onClick={handleOpenMessageMode}>✉️</button>
        ) : (
          <>
            <button className="confirm-button" onClick={handleConfirmSendMessage}>✓</button>
            <button className="cancel-button" onClick={handleCancelMessageMode}>✕</button>
          </>
        )}
      </div>

        <div className="table-wrapper">
        <div className="desktop-view">
          <table className="feedback-table">
            <thead>
              <tr>
                {isMessageMode && (
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        filteredAndSortedUsers.length > 0 &&
                        filteredAndSortedUsers.every((user) => selectedUserIds.includes(user._id))
                      }                      
                      onChange={() => toggleSelectAll()}
                    />
                  </th>
                )}
                <th>Име</th>
                <th>Телефон</th>
                <th>Точки</th>
                <th>Email</th>
                <th>Google</th>
                <th>Админ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUsers.map((user) => {
                const isEditing = editUserId === user._id;
                return (
                  <tr key={user._id} className={isEditing ? 'editing-row' : ''}>
                    {isMessageMode && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user._id)}
                          onChange={() => toggleUserSelection(user._id)}
                        />
                      </td>
                    )}
                    <td>
                      {isEditing ? (
                        <input
                          value={editedUser.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                        />
                      ) : (
                        <div className='name-cell'>{user.name}</div>
                        
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          value={editedUser.phoneNumber}
                          onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        />
                      ) : (
                        user.phoneNumber || '-'
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedUser.points}
                          onChange={(e) => handleChange('points', e.target.value)}
                        />
                      ) : (
                        user.points
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          value={editedUser.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={editedUser.isGoogleAuth}
                          onChange={(e) => handleChange('isGoogleAuth', e.target.checked)}
                        />
                      ) : (
                        <input type="checkbox" checked={user.isGoogleAuth} disabled />
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={editedUser.isAdmin}
                          onChange={(e) => handleChange('isAdmin', e.target.checked)}
                        />
                      ) : (
                        <input type="checkbox" checked={user.isAdmin} disabled />
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="action-buttons">
                          <FaCheck className="icon" onClick={handleSaveEdit} title="Запази" />
                          <FaTimes className="icon" onClick={handleCancelEdit} title="Отказ" />
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <FaEdit className="icon" onClick={() => handleEditClick(user)} title="Редактирай" />
                          <FaTrash
                            className="icon delete-icon"
                            onClick={() => handleDeleteClick(user)} // Запазва избрания потребител и отваря модала
                            title="Изтрий"
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          <div className="mobile-view">
    {filteredAndSortedUsers.map(user => {
      const isEditing = editUserId === user._id;
      return (
        <div className="user-card" key={user._id}>
          <div className="card-field">
            <strong>Име:</strong>{' '}
            {isEditing ? (
              <input value={editedUser.name} onChange={(e) => handleChange('name', e.target.value)} />
            ) : (
              user.name
            )}
          </div>

          <div className="card-field">
            <strong>Телефон:</strong>{' '}
            {isEditing ? (
              <input value={editedUser.phoneNumber} onChange={(e) => handleChange('phoneNumber', e.target.value)} />
            ) : (
              user.phoneNumber || '-'
            )}
          </div>

          <div className="card-field">
            <strong>Точки:</strong>{' '}
            {isEditing ? (
              <input type="number" value={editedUser.points} onChange={(e) => handleChange('points', e.target.value)} />
            ) : (
              user.points
            )}
          </div>

          <div className="card-field">
            <strong>Email:</strong>{' '}
            {isEditing ? (
              <input value={editedUser.email} onChange={(e) => handleChange('email', e.target.value)} />
            ) : (
              user.email
            )}
          </div>

          <div className="card-field">
            <strong>Google:</strong>{' '}
            {isEditing ? (
              <input type="checkbox" checked={editedUser.isGoogleAuth} onChange={(e) => handleChange('isGoogleAuth', e.target.checked)} />
            ) : (
              <input type="checkbox" checked={user.isGoogleAuth} disabled />
            )}
          </div>

          <div className="card-field">
            <strong>Админ:</strong>{' '}
            {isEditing ? (
              <input type="checkbox" checked={editedUser.isAdmin} onChange={(e) => handleChange('isAdmin', e.target.checked)} />
            ) : (
              <input type="checkbox" checked={user.isAdmin} disabled />
            )}
          </div>

          <div className="card-field action-buttons">
            {isEditing ? (
              <>
                <FaCheck className="icon" onClick={handleSaveEdit} title="Запази" />
                <FaTimes className="icon" onClick={handleCancelEdit} title="Отказ" />
              </>
            ) : (
              <>
                <FaEdit className="icon" onClick={() => handleEditClick(user)} title="Редактирай" />
                <FaTrash
                  className="icon delete-icon"
                  onClick={() => handleDeleteClick(user)}
                  title="Изтрий"
                />
              </>
            )}
          </div>
        </div>
      );
    })}
  </div>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
        user={selectedUser}
      />

      {isSendModalOpen && (
        <SendMessageModal
          selectedUserIds={selectedUserIds}
          onClose={handleCloseSendModal}
          onSuccess={handleSendMessageSuccess}
          currentUser={currentUser}
        />
      )}

      {message && (
        <p className={success ? "success-message" : "error-message"}>
          {message}
        </p>
      )}

    </div>
  );
};

export default AdminUsers;
