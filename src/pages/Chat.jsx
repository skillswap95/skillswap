import { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { ref, push, onValue } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, rtdb, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import {
  Send, Search, MessageCircle, Paperclip,
  FileText, Music, Image as ImageIcon, X, Download, ChevronLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(typeof ts === 'number' ? ts : ts.seconds * 1000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getFileIcon(fileType) {
  if (!fileType) return FileText;
  if (fileType.startsWith('image/')) return ImageIcon;
  if (fileType.startsWith('audio/')) return Music;
  return FileText;
}

function FileMessage({ msg, isMine }) {
  const Icon = getFileIcon(msg.fileType);
  const isImage = msg.fileType?.startsWith('image/');
  const isAudio = msg.fileType?.startsWith('audio/');

  if (isImage) {
    return (
      <div className="overflow-hidden rounded-xl" style={{ maxWidth: 260 }}>
        <img
          src={msg.fileUrl}
          alt={msg.fileName}
          className="w-full rounded-xl"
          style={{ maxHeight: 220, objectFit: 'cover', display: 'block' }}
        />
        {msg.text && (
          <p className="text-sm mt-1 px-1" style={{ color: 'var(--text-secondary)' }}>{msg.text}</p>
        )}
      </div>
    );
  }

  if (isAudio) {
    return (
      <div style={{ minWidth: 220, maxWidth: 280 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: isMine ? 'rgba(56,189,248,0.2)' : 'var(--input-bg)' }}>
            <Music size={15} style={{ color: 'var(--sky)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{msg.fileName}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Audio recording</p>
          </div>
        </div>
        <audio controls src={msg.fileUrl} className="w-full" style={{ height: 32 }} />
      </div>
    );
  }

  // Generic file (PDF, notes, etc.)
  return (
    <a
      href={msg.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 no-underline"
      style={{ minWidth: 180, maxWidth: 260 }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: isMine ? 'rgba(56,189,248,0.15)' : 'var(--input-bg)' }}>
        <Icon size={18} style={{ color: 'var(--sky)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{msg.fileName}</p>
        <p className="text-xs" style={{ color: 'var(--sky)' }}>Tap to open</p>
      </div>
      <Download size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
    </a>
  );
}

export default function Chat() {
  const { currentUser, userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function fetchUsers() {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.uid !== currentUser.uid);
      setUsers(list);
      if (list.length > 0 && window.innerWidth >= 768) setActiveChat(list[0]);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!activeChat) return;
    const otherId = activeChat.uid || activeChat.id;
    const chatId = [currentUser.uid, otherId].sort().join('_');
    const msgRef = ref(rtdb, `chats/${chatId}/messages`);
    const unsub = onValue(
      msgRef,
      snap => {
        const data = snap.val();
        if (!data) { setMessages([]); return; }
        const list = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(list);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      },
      err => {
        console.error('RTDB read error:', err);
        toast.error(`Chat error: ${err.code || err.message}`);
      }
    );
    return () => unsub();
  }, [activeChat]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMsg.trim() || !activeChat || sending) return;
    setSending(true);
    const otherId = activeChat.uid || activeChat.id;
    const chatId = [currentUser.uid, otherId].sort().join('_');
    try {
      await push(ref(rtdb, `chats/${chatId}/messages`), {
        text: newMsg.trim(),
        senderId: currentUser.uid,
        senderName: userProfile?.name || currentUser.displayName,
        timestamp: Date.now(),
        type: 'text',
      });
      setNewMsg('');
      inputRef.current?.focus();
    } catch (err) {
      console.error('Send message error:', err);
      toast.error(err.code === 'PERMISSION_DENIED'
        ? 'Permission denied — check Firebase RTDB rules'
        : `Failed to send: ${err.message || err.code}`
      );
    }
    setSending(false);
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      toast.error('File too large. Max 20MB.');
      return;
    }

    if (!storage) {
      toast.error('Storage not configured — add VITE_FIREBASE_STORAGE_BUCKET to Vercel env vars');
      return;
    }
    setUploading(true);
    const otherId = activeChat.uid || activeChat.id;
    const chatId = [currentUser.uid, otherId].sort().join('_');
    const path = `chats/${chatId}/${Date.now()}_${file.name}`;

    try {
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, file);
      const downloadUrl = await getDownloadURL(sRef);

      await push(ref(rtdb, `chats/${chatId}/messages`), {
        text: '',
        fileUrl: downloadUrl,
        fileName: file.name,
        fileType: file.type,
        senderId: currentUser.uid,
        senderName: userProfile?.name || currentUser.displayName,
        timestamp: Date.now(),
        type: 'file',
      });
      toast.success('File sent!');
    } catch (err) {
      console.error('File upload error:', err);
      toast.error(`Upload failed: ${err.message || err.code}`);
    }
    setUploading(false);
    e.target.value = '';
  }

  function openChat(user) {
    setActiveChat(user);
    setShowSidebar(false); // on mobile, hide sidebar when chat opens
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    (u.skillsOffered || []).some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout>
      {/*
        Mobile: subtract header (57px) + bottom nav (64px) = 121px
        Desktop (md+): full 100vh, no fixed header or bottom nav padding
      */}
      <div className="flex h-[calc(100vh-121px)] md:h-screen">
        {/* Conversation list — hidden on mobile when a chat is open */}
        <div
          className={`${
            activeChat && !showSidebar ? 'hidden md:flex' : 'flex'
          } w-full md:w-72 flex-col shrink-0`}
          style={{
            borderRight: '1px solid var(--border)',
            background: 'var(--bg-card)',
            maxWidth: activeChat ? undefined : '100%',
          }}
        >
          <div className="p-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-lg font-black mb-3" style={{ fontFamily: 'Bricolage Grotesque', color: 'var(--text-primary)' }}>
              Messages
            </h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
              <input className="input-dark pl-9 py-2 text-sm" placeholder="Search people..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {filteredUsers.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {users.length === 0 ? 'No other users yet' : 'No results'}
                </p>
              </div>
            ) : (
              filteredUsers.map(u => (
                <button key={u.id} onClick={() => openChat(u)}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left"
                  style={{
                    background: activeChat?.uid === u.uid ? 'var(--nav-active-bg)' : 'transparent',
                    borderLeft: activeChat?.uid === u.uid ? '2px solid var(--sky)' : '2px solid transparent',
                  }}>
                  <div className="relative shrink-0">
                    <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                      alt={u.name} className="w-10 h-10 rounded-full"
                      style={{ border: '2px solid var(--border)', background: 'var(--bg-elevated)' }} />
                    <div className="status-dot absolute -bottom-0.5 -right-0.5" style={{ width: 7, height: 7 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ fontFamily: 'Bricolage Grotesque', color: 'var(--text-primary)' }}>
                      {u.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      {(u.skillsOffered || []).slice(0, 2).join(', ') || 'No skills listed'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area — hidden on mobile until a chat is selected */}
        <div
          className={`${
            showSidebar && !activeChat ? 'hidden md:flex' : 'flex'
          } flex-1 flex-col`}
          style={{ minWidth: 0 }}
        >
          {activeChat ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                {/* Mobile back button */}
                <button
                  className="md:hidden p-1.5 rounded-lg mr-1"
                  style={{ background: 'var(--input-bg)', color: 'var(--text-primary)' }}
                  onClick={() => setShowSidebar(true)}
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="relative">
                  <img src={activeChat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat.name}`}
                    alt={activeChat.name} className="w-9 h-9 rounded-full"
                    style={{ border: '2px solid rgba(56,189,248,0.3)', background: 'var(--bg-elevated)' }} />
                  <div className="status-dot absolute -bottom-0.5 -right-0.5" style={{ width: 8, height: 8 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm" style={{ fontFamily: 'Bricolage Grotesque', color: 'var(--text-primary)' }}>
                    {activeChat.name}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--emerald)' }}>● Online</p>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {(activeChat.skillsOffered || []).slice(0, 2).map(s => (
                    <span key={s} className="skill-badge skill-badge-offered hidden sm:inline-flex" style={{ fontSize: '0.65rem' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4" style={{ background: 'var(--bg-deep)' }}>
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                      style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)' }}>
                      <MessageCircle size={24} color="var(--sky)" />
                    </div>
                    <h3 className="font-bold mb-1" style={{ fontFamily: 'Bricolage Grotesque', color: 'var(--text-primary)' }}>
                      Start the conversation
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Say hello to {activeChat.name} — propose a skill swap or share a resource!
                    </p>
                    <div className="flex gap-2 mt-4 flex-wrap justify-center">
                      {[
                        "Hi! Want to swap skills? 👋",
                        `I can teach you ${userProfile?.skillsOffered?.[0] || 'a skill'}!`,
                        "Are you available this weekend?",
                      ].map(s => (
                        <button key={s} onClick={() => setNewMsg(s)}
                          className="px-3 py-1.5 rounded-xl text-sm transition-all"
                          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isMine = msg.senderId === currentUser.uid;
                  const isFile = msg.type === 'file' && msg.fileUrl;

                  return (
                    <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'} gap-2`}>
                      {!isMine && (
                        <img
                          src={activeChat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat.name}`}
                          alt="" className="w-7 h-7 rounded-full shrink-0 mt-1"
                          style={{ background: 'var(--bg-elevated)' }}
                        />
                      )}
                      <div className="max-w-[75%] md:max-w-md">
                        {isFile ? (
                          <div className={`px-3 py-2.5 ${isMine ? 'msg-sent' : 'msg-received'}`}>
                            <FileMessage msg={msg} isMine={isMine} />
                          </div>
                        ) : (
                          <div className={`px-4 py-2.5 ${isMine ? 'msg-sent' : 'msg-received'}`}>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{msg.text}</p>
                          </div>
                        )}
                        <p className="text-xs mt-1 px-1"
                          style={{ color: 'var(--text-secondary)', textAlign: isMine ? 'right' : 'left' }}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input area */}
              <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                {/* Upload hint */}
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Share:</p>
                  {[
                    { label: 'Image', accept: 'image/*', icon: '🖼️' },
                    { label: 'Audio', accept: 'audio/*', icon: '🎵' },
                    { label: 'PDF / Notes', accept: '.pdf,.doc,.docx,.txt,.png,.jpg', icon: '📄' },
                  ].map(({ label, accept, icon }) => (
                    <button
                      key={label}
                      onClick={() => {
                        fileInputRef.current.accept = accept;
                        fileInputRef.current.click();
                      }}
                      disabled={uploading}
                      className="text-xs px-2.5 py-1 rounded-lg transition-all"
                      style={{
                        background: 'var(--input-bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        opacity: uploading ? 0.6 : 1,
                      }}
                    >
                      {icon} {label}
                    </button>
                  ))}
                  {uploading && (
                    <span className="text-xs" style={{ color: 'var(--sky)' }}>Uploading...</span>
                  )}
                </div>

                <form onSubmit={sendMessage} className="flex items-end gap-2">
                  {/* File attach icon */}
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current.accept = '*/*';
                      fileInputRef.current.click();
                    }}
                    disabled={uploading}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Paperclip size={17} />
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    className="input-dark flex-1"
                    placeholder={`Message ${activeChat.name}...`}
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) sendMessage(e); }}
                    style={{ borderRadius: '14px' }}
                  />

                  <button
                    type="submit"
                    disabled={!newMsg.trim() || sending}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: newMsg.trim() ? 'linear-gradient(135deg, var(--sky), var(--indigo))' : 'var(--input-bg)',
                      border: newMsg.trim() ? 'none' : '1px solid var(--border)',
                      cursor: newMsg.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <Send size={16} color={newMsg.trim() ? '#fff' : 'var(--text-secondary)'} />
                  </button>
                </form>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12"
              style={{ background: 'var(--bg-deep)' }}>
              <div className="w-20 h-20 rounded-2xl mb-6 flex items-center justify-center"
                style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.12)' }}>
                <MessageCircle size={32} color="var(--sky)" />
              </div>
              <h2 className="text-2xl font-black mb-2" style={{ fontFamily: 'Bricolage Grotesque', color: 'var(--text-primary)' }}>
                No conversation selected
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Pick someone from the list to start chatting!
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
