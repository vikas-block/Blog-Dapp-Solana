import React from 'react';
import './model.css'; // Make sure to create this CSS file for styling

const Modal = ({ isVisible, onClose, postContent, setPostContent, handleUpdate }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Post</h2>
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="Update content here"
          rows="5"
          cols="50"
        />
        <div>
          <button onClick={handleUpdate}>Update Post</button>
          <button onClick={onClose} style={{ marginLeft: '10px' }}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
