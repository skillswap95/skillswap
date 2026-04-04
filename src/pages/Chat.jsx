import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, push, onValue, serverTimestamp } from 'firebase/database';
import { db, rtdb } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import { Send, Search, MessageCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(typeof ts === 'number' ? ts : ts.seconds * 1000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Chat() {
  const { currentUser, userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load all users to chat with
  useEffect(() => {
    async function fetchUsers() {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.uid !== currentUser.uid);
      setUsers(list);
      if (list.length > 0) setActiveChat(list[0]);
    }
    fetchUsers();
  }, []);

  // Subscribe to messages for active chat
  useEffect(() => {
    if (!activeChat) return;
    const chatId = [currentUser.uid, activeChat.uid].sort().join('_');
    const msgRef = ref(rtdb, `chats/${chatId}/messages`);
    const unsub = onValue(msgRef, snap => {
      const data = snap.val();
      if (!data) { setMessages([]); return; }
      const list = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
      setMessages(list);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
    return () => unsub();
  }, [activeChat]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMsg.trim() || !activeChat || sending) return;
    setSending(true);
    const chatId = [currentUser.uid, activeChat.uid].sort().join('_');
    try {
      await push(ref(rtdb, `chats/${chatId}/messages`), {
        text: newMsg.trim(),
        senderId: currentUser.uid,
        senderName: userProfile?.name || currentUser.displayName,
        timestamp: Date.now(),
      });
      setNewMsg('');
      inputRef.current?.focus();
    } catch {
      toast.error('Failed to send message');
    }
    setSending(false);
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    (u.skillsOffered || []).some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="flex h-screen" style={{ height: 'calc(100vh)' }}>
        {/* Sidebar: conversation list */}
        <div className="w-72 flex flex-col shrink-0"
          style={{ borderRight: '1px solid var(--border)', background: 'rgba(10,14,24,0.6)' }}>
          <div className="p-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-lg font-black mb-3" style={{ fontFamily: 'Bricolage Grotesque' }}>Messages</h2>
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
                <button key={u.id} onClick={() => setActiveChat(u)}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left"
                  style={{
                    background: activeChat?.uid === u.uid ? 'rgba(56,189,248,0.08)' : 'transparent',
                    borderLeft: activeChat?.uid === u.uid ? '2px solid #38BDF8' : '2px solid transparent',
                  }}>
                  <div className="relative shrink-0">
                    <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                      alt={u.name} className="w-10 h-10 rounded-full"
                      style={{ border: '2px solid var(--border)', background: '#151F30' }} />
                    <div className="status-dot absolute -bottom-0.5 -right-0.5" style={{ width: 7, height: 7 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ fontFamily: 'Bricolage Grotesque' }}>{u.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      {(u.skillsOffered || []).slice(0, 2).join(', ') || 'No skills listed'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(10,14,24,0.4)' }}>
                <div className="relative">
                  <img src={activeChat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat.name}`}
                    alt={activeChat.name} className="w-10 h-10 rounded-full"
                    style={{ border: '2px solid rgba(56,189,248,0.3)', background: '#151F30' }} />
                  <div className="status-dot absolute -bottom-0.5 -right-0.5" style={{ width: 8, height: 8 }} />
                </div>
                <div>
                  <h3 className="font-bold" style={{ fontFamily: 'Bricolage Grotesque' }}>{activeChat.name}</h3>
                  <p className="text-xs" style={{ color: '#34D399' }}>● Online</p>
                </div>
                <div className="ml-auto flex gap-2">
                  {(activeChat.skillsOffered || []).slice(0, 2).map(s => (
                    <span key={s} className="skill-badge skill-badge-offered" style={{ fontSize: '0.65rem' }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                      style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)' }}>
                      <MessageCircle size={24} color="#38BDF8" />
                    </div>
                    <h3 className="font-bold mb-1" style={{ fontFamily: 'Bricolage Grotesque' }}>Start the conversation</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Say hello to {activeChat.name} — maybe propose a skill swap! 👋
                    </p>
                    <div className="flex gap-2 mt-4 flex-wrap justify-center">
                      {["Hi! Want to swap skills? 👋", "I can teach you " + (userProfile?.skillsOffered?.[0] || 'a skill') + "!", "Are you available this weekend?"].map(s => (
                        <button key={s} onClick={() => setNewMsg(s)}
                          className="px-3 py-1.5 rounded-xl text-sm transition-all"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isMine = msg.senderId === currentUser.uid;
                  return (
                    <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'} gap-2`}>
                      {!isMine && (
                        <img src={activeChat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat.name}`}
                          alt="" className="w-7 h-7 rounded-full shrink-0 mt-1"
                          style={{ background: '#151F30' }} />
                      )}
                      <div className={`max-w-xs lg:max-w-md`}>
                        <div className={`px-4 py-2.5 ${isMine ? 'msg-sent' : 'msg-received'}`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
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

              {/* Input */}
              <form onSubmit={sendMessage}
                className="flex items-end gap-3 px-6 py-4"
                style={{ borderTop: '1px solid var(--border)', background: 'rgba(10,14,24,0.4)' }}>
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
                <button type="submit" disabled={!newMsg.trim() || sending}
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background: newMsg.trim() ? 'linear-gradient(135deg, #38BDF8, #818CF8)' : 'rgba(255,255,255,0.06)',
                    border: newMsg.trim() ? 'none' : '1px solid var(--border)',
                    cursor: newMsg.trim() ? 'pointer' : 'not-allowed',
                  }}>
                  <Send size={16} color={newMsg.trim() ? '#07090F' : '#475569'} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 rounded-2xl mb-6 flex items-center justify-center"
                style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.12)' }}>
                <MessageCircle size={32} color="#38BDF8" />
              </div>
              <h2 className="text-2xl font-black mb-2" style={{ fontFamily: 'Bricolage Grotesque' }}>No conversations yet</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Connect with people from the Matches page to start chatting!
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
