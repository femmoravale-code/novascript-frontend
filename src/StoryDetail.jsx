import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';

function StoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [story, setStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inReadingList, setInReadingList] = useState(false);
  const [readingListLoading, setReadingListLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const API_URL ='https://novascript-backend-3.onrender.com/api';


  useEffect(() => {
    fetchStory();
    fetchComments();
    checkReadingList();
    fetchProgress();
  }, [id]);

  const fetchStory = async () => {
    try {
      const res = await axios.get(`${API_URL}/stories/${id}`);
      setStory(res.data);
      setLikes(res.data.likes || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching story:', error);
      navigate('/');
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/stories/${id}/comments`);
      setComments(res.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const checkReadingList = async () => {
    try {
      const res = await axios.get(`${API_URL}/reading-list/check/${user.id}/${id}`);
      setInReadingList(res.data.inList);
    } catch (error) {
      console.error('Error checking reading list:', error);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await axios.get(`${API_URL}/progress/${user.id}`);
      const progressData = res.data.find(p => p.storyId === id);
      if (progressData) {
        setProgress(progressData.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleLike = async () => {
    try {
      const res = await axios.post(`${API_URL}/stories/${id}/like`, {
        userId: user.id
      });
      setLikes(res.data.likes);
      setLiked(res.data.liked);
    } catch (error) {
      console.error('Error liking:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/comments`, {
        storyId: id,
        author: user.username,
        authorId: user.id,
        text: newComment
      });
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleReadingList = async () => {
    setReadingListLoading(true);
    try {
      if (inReadingList) {
        await axios.delete(`${API_URL}/reading-list`, {
          data: { userId: user.id, storyId: id }
        });
        setInReadingList(false);
      } else {
        await axios.post(`${API_URL}/reading-list`, {
          userId: user.id,
          storyId: id
        });
        setInReadingList(true);
      }
    } catch (error) {
      console.error('Error updating reading list:', error);
    }
    setReadingListLoading(false);
  };

  // Track progress when scrolling
  const handleScroll = () => {
    const storyElement = document.querySelector('.story-body');
    if (storyElement) {
      const scrollTop = window.scrollY - storyElement.offsetTop;
      const scrollHeight = storyElement.scrollHeight - window.innerHeight;
      const progressPercent = Math.min(100, Math.max(0, Math.round((scrollTop / scrollHeight) * 100)));
      
      if (progressPercent > progress + 5) {
        setProgress(progressPercent);
        saveProgress(progressPercent);
      }
    }
  };

  const saveProgress = async (progressPercent) => {
    try {
      await axios.post(`${API_URL}/progress`, {
        userId: user.id,
        storyId: id,
        progress: progressPercent
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (!story) return <div className="loading">Story not found</div>;

  return (
    <div className="story-detail">
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
      
      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="progress-text">{progress}% read</span>
      </div>

      <div className="story-content">
        <h1>{story.title}</h1>
        <p className="story-author">by {story.author}</p>
        <p className="story-genre">{story.genre}</p>
        <div className="story-actions">
          <button onClick={handleLike} className="like-btn">
            {liked ? '❤️' : '🤍'} {likes}
          </button>
          <button 
            onClick={handleReadingList} 
            className={`reading-list-btn ${inReadingList ? 'in-list' : ''}`}
            disabled={readingListLoading}
          >
            {inReadingList ? '📚 In Reading List' : '📖 Add to Reading List'}
          </button>
        </div>
        <div className="story-body">
          {story.content.split('\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>

      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>
        <form onSubmit={handleComment} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows="3"
          />
          <button type="submit">Post Comment</button>
        </form>
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment._id} className="comment">
              <strong>{comment.author}</strong>
              <p>{comment.text}</p>
              <small>{new Date(comment.createdAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StoryDetail;