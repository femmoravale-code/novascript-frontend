import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';

function CreateStory() {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [content, setContent] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const API_URL = 'https://novascript-backend-3.onrender.com/api';


  const warningOptions = [
    'Graphic Violence',
    'Explicit Content',
    'Gore',
    'Psychological Trauma',
    'Drug/Alcohol Use'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert('Please fill in title and content');
      return;
    }

    setLoading(true);
    try {
      const newStory = {
        title,
        author: user.username,
        authorId: user.id,
        genre: genre || 'General',
        content,
        warnings,
        likes: 0,
        likedBy: []
      };

      const res = await axios.post(`${API_URL}/stories`, newStory);
      navigate(`/story/${res.data._id}`);
    } catch (error) {
      console.error('Error creating story:', error);
      alert('Failed to create story. Please try again.');
    }
    setLoading(false);
  };

  const toggleWarning = (warning) => {
    if (warnings.includes(warning)) {
      setWarnings(warnings.filter(w => w !== warning));
    } else {
      setWarnings([...warnings, warning]);
    }
  };

  return (
    <div className="create-story">
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
      <div className="create-card">
        <h2>✍️ Write Your Story</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Story Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            required
          />
          
          <input
            type="text"
            placeholder="Genre (e.g., Horror, Romance)"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="form-input"
          />

          <div className="warnings-section">
            <p className="warnings-label">Content Warnings (18+):</p>
            <div className="warning-tags">
              {warningOptions.map(warning => (
                <label key={warning} className="warning-tag">
                  <input
                    type="checkbox"
                    checked={warnings.includes(warning)}
                    onChange={() => toggleWarning(warning)}
                  />
                  {warning}
                </label>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Write your story here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-textarea"
            rows="10"
            required
          />

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="publish-btn" disabled={loading}>
              {loading ? 'Publishing...' : '📖 Publish Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateStory;