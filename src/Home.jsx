import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import axios from 'axios';

function Home() {
  const [stories, setStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({});
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const API_URL ='https://novascript-backend-3.onrender.com/api';

  

  useEffect(() => {
    fetchStories();
    fetchProgress();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await axios.get(`${API_URL}/stories`);
      setStories(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await axios.get(`${API_URL}/progress/${user.id}`);
      const progressMap = {};
      res.data.forEach(p => {
        progressMap[p.storyId] = p.progress;
      });
      setProgressData(progressMap);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">📚 NovaScript</h1>
          <div className="header-actions">
            <button onClick={toggleTheme} className="theme-btn">
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>
            <input
              type="text"
              placeholder="Search stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="write-btn" onClick={() => navigate('/create')}>
              ✍️ Write Story
            </button>
            <button className="profile-btn" onClick={() => navigate('/profile')}>
              👤 {user?.username}
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="stories-grid">
          {loading ? (
            <p>Loading stories...</p>
          ) : filteredStories.length === 0 ? (
            <p>No stories found. Be the first to write one!</p>
          ) : (
            filteredStories.map(story => {
              const progress = progressData[story._id] || 0;
              const isCompleted = progress >= 100;
              
              return (
                <div key={story._id} className="story-card">
                  <div className="story-header">
                    <h3>{story.title}</h3>
                    <span className="mature-badge">18+</span>
                  </div>
                  <p className="author">by {story.author}</p>
                  <p className="genre">{story.genre}</p>
                  <p className="preview">{story.content.substring(0, 100)}...</p>
                  
                  {/* Progress Bar */}
                  {progress > 0 && (
                    <div className="story-progress">
                      <div className="progress-bar-small">
                        <div 
                          className="progress-fill-small" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-label">
                        {isCompleted ? '✅ Completed' : `${progress}% read`}
                      </span>
                    </div>
                  )}
                  
                  <div className="story-footer">
                    <span>❤️ {story.likes || 0}</span>
                    <button 
                      className="read-btn"
                      onClick={() => navigate(`/story/${story._id}`)}
                    >
                      {progress > 0 && progress < 100 ? '📖 Continue Reading' : '📚 Read Story'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;