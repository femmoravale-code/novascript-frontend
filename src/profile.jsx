import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myStories, setMyStories] = useState([]);
  const [readingList, setReadingList] = useState([]);
  const [activeTab, setActiveTab] = useState('mystories');

  const API_URL = 'https://novascript-backend-3.onrender.com/api';


  useEffect(() => {
    fetchMyStories();
    fetchReadingList();
  }, []);

  const fetchMyStories = async () => {
    try {
      const res = await axios.get(`${API_URL}/stories`);
      const userStories = res.data.filter(s => s.authorId === user.id);
      setMyStories(userStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const fetchReadingList = async () => {
    try {
      const res = await axios.get(`${API_URL}/reading-list/${user.id}`);
      setReadingList(res.data);
    } catch (error) {
      console.error('Error fetching reading list:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const removeFromReadingList = async (storyId) => {
    try {
      await axios.delete(`${API_URL}/reading-list`, {
        data: { userId: user.id, storyId }
      });
      setReadingList(readingList.filter(item => item.storyId._id !== storyId));
    } catch (error) {
      console.error('Error removing from reading list:', error);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <h1>👤 {user?.username}</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      <div className="profile-info">
        <p>📧 {user?.email}</p>
        <p>📚 {myStories.length} stories written</p>
        <p>📖 {readingList.length} stories in reading list</p>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'mystories' ? 'active' : ''}`}
          onClick={() => setActiveTab('mystories')}
        >
          My Stories
        </button>
        <button 
          className={`tab-btn ${activeTab === 'readinglist' ? 'active' : ''}`}
          onClick={() => setActiveTab('readinglist')}
        >
          Reading List
        </button>
      </div>

      {activeTab === 'mystories' && (
        <div className="my-stories">
          <h2>My Stories</h2>
          {myStories.length === 0 ? (
            <p>You haven't written any stories yet.</p>
          ) : (
            myStories.map(story => (
              <div key={story._id} className="story-card">
                <h3>{story.title}</h3>
                <p>{story.genre}</p>
                <button onClick={() => navigate(`/story/${story._id}`)}>Read</button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'readinglist' && (
        <div className="reading-list">
          <h2>📖 My Reading List</h2>
          {readingList.length === 0 ? (
            <p>No stories in your reading list. Browse stories and save them!</p>
          ) : (
            readingList.map((item) => (
              <div key={item._id} className="story-card">
                <h3>{item.storyId.title}</h3>
                <p>by {item.storyId.author}</p>
                <p className="genre">{item.storyId.genre}</p>
                <div className="reading-list-actions">
                  <button onClick={() => navigate(`/story/${item.storyId._id}`)}>
                    Read Story
                  </button>
                  <button 
                    onClick={() => removeFromReadingList(item.storyId._id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
                <small>Added: {new Date(item.addedAt).toLocaleDateString()}</small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;