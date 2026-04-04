import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import toast from 'react-hot-toast';
import { Search, Zap, MapPin, Clock, Star, Users, Filter, X, ChevronRight } from 'lucide-react';

function CompatibilityBadge({ score }) {
  const color = score >= 70 ? '#34D399' : score >= 40 ? '#38BDF8' : '#818CF8';
  const label = score >= 70 ? 'Perfect Match' : score >= 40 ? 'Good Match' : 'Potential';
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {score}% · {label}
    </div>
  );
}

function UserCard({ user, myProfile, onConnect }) {
  const [requested, setRequested] = useState(false);

  async function handleConnect() {
    if (requested) return;
    try {
      const matchId = [myProfile.uid, user.uid].sort().join('_');
      await setDoc(doc(db, 'matches', matchId), {
        user1: myProfile.uid,
        user2: user.uid,
        user1Name: myProfile.name,
        user2Name: user.name,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setRequested(true);
      toast.success(`Match request sent to ${user.name}! 🎉`);
      onConnect(user.uid);
    } catch {
      toast.error('Failed to send request');
    }
  }

  return (
    <div className="p-5 rounded-2xl card-hover"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative shrink-0">
          <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
            alt={user.name} className="w-12 h-12 rounded-xl"
            style={{ border: '2px solid rgba(56,189,248,0.2)', background: '#151F30' }} />
          <div className="status-dot absolute -bottom-0.5 -right-0.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold truncate" style={{ fontFamily: 'Bricolage Grotesque' }}>{user.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="skill-badge skill-badge-amber" style={{ fontSize: '0.65rem', padding: '2px 7px' }}>
              {user.level || 'Beginner'}
            </span>
            {user.location && (
              <span className="text-xs flex items-center gap-0.5" style={{ color: 'var(--text-secondary)' }}>
                <MapPin size={10} /> {user.location}
              </span>
            )}
          </div>
        </div>
        <CompatibilityBadge score={user.matchScore} />
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-xs mb-4 leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{user.bio}</p>
      )}

      {/* Skills */}
      <div className="space-y-2 mb-4">
        {(user.skillsOffered || []).length > 0 && (
          <div>
            <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>Teaches</p>
            <div className="flex flex-wrap gap-1">
              {(user.skillsOffered || []).slice(0, 4).map(s => {
                const isMatch = (myProfile?.skillsWanted || []).includes(s);
                return (
                  <span key={s} className={`skill-badge ${isMatch ? 'skill-badge-offered' : ''}`}
                    style={!isMatch ? {
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.7rem',
                      padding: '2px 9px',
                    } : { fontSize: '0.7rem', padding: '2px 9px' }}>
                    {isMatch && <Zap size={9} />} {s}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        {(user.skillsWanted || []).length > 0 && (
          <div>
            <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>Wants to Learn</p>
            <div className="flex flex-wrap gap-1">
              {(user.skillsWanted || []).slice(0, 4).map(s => {
                const isMatch = (myProfile?.skillsOffered || []).includes(s);
                return (
                  <span key={s} className={`skill-badge ${isMatch ? 'skill-badge-wanted' : ''}`}
                    style={!isMatch ? {
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.7rem',
                      padding: '2px 9px',
                    } : { fontSize: '0.7rem', padding: '2px 9px' }}>
                    {isMatch && <Zap size={9} />} {s}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          {user.availability && (
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              <Clock size={10} /> {user.availability}
            </span>
          )}
          {user.rating > 0 && (
            <span className="text-xs flex items-center gap-1" style={{ color: '#FBBF24' }}>
              <Star size={10} fill="#FBBF24" /> {user.rating.toFixed(1)}
            </span>
          )}
        </div>
        <button onClick={handleConnect} disabled={requested}
          className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: requested ? 'rgba(52,211,153,0.1)' : 'rgba(56,189,248,0.12)',
            border: `1px solid ${requested ? 'rgba(52,211,153,0.3)' : 'rgba(56,189,248,0.25)'}`,
            color: requested ? '#34D399' : '#38BDF8',
            cursor: requested ? 'default' : 'pointer',
          }}>
          {requested ? '✓ Requested' : <><Zap size={11} /> Connect</>}
        </button>
      </div>
    </div>
  );
}

export default function Matches() {
  const { currentUser, userProfile } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [sortBy, setSortBy] = useState('match');
  const [connectedIds, setConnectedIds] = useState(new Set());

  useEffect(() => {
    async function fetchUsers() {
      const snap = await getDocs(collection(db, 'users'));
      const users = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.uid !== currentUser.uid);

      const scored = users.map(u => {
        const myWanted = userProfile?.skillsWanted || [];
        const myOffered = userProfile?.skillsOffered || [];
        const theirOffered = u.skillsOffered || [];
        const theirWanted = u.skillsWanted || [];
        const canLearn = myWanted.filter(s => theirOffered.includes(s)).length;
        const canTeach = myOffered.filter(s => theirWanted.includes(s)).length;
        const total = Math.max(myWanted.length + myOffered.length, 1);
        const score = Math.round(((canLearn + canTeach) / total) * 100);
        return { ...u, matchScore: Math.min(score, 99) };
      });

      setAllUsers(scored);
      setLoading(false);
    }
    if (userProfile) fetchUsers();
  }, [userProfile]);

  const displayed = allUsers
    .filter(u => {
      if (search) {
        const q = search.toLowerCase();
        return u.name?.toLowerCase().includes(q) ||
          (u.skillsOffered || []).some(s => s.toLowerCase().includes(q)) ||
          (u.skillsWanted || []).some(s => s.toLowerCase().includes(q));
      }
      if (filterSkill) {
        return (u.skillsOffered || []).includes(filterSkill) || (u.skillsWanted || []).includes(filterSkill);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (a.name || '').localeCompare(b.name || '');
    });

  const allSkillsInPool = [...new Set(allUsers.flatMap(u => [...(u.skillsOffered || []), ...(u.skillsWanted || [])]))].sort();

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'Bricolage Grotesque' }}>Find Matches</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Discover people who have what you need — and need what you have.</p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
            <input className="input-dark pl-11" placeholder="Search by name or skill..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
            <select className="input-dark pl-9 pr-8 appearance-none cursor-pointer w-48"
              value={filterSkill} onChange={e => setFilterSkill(e.target.value)}>
              <option value="">All skills</option>
              {allSkillsInPool.slice(0, 30).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <select className="input-dark w-40 cursor-pointer"
            value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="match">Best Match</option>
            <option value="rating">Top Rated</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {/* Active filters */}
        {(search || filterSkill) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Filters:</span>
            {search && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', color: '#38BDF8' }}>
                "{search}" <X size={10} className="cursor-pointer" onClick={() => setSearch('')} />
              </span>
            )}
            {filterSkill && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', color: '#818CF8' }}>
                {filterSkill} <X size={10} className="cursor-pointer" onClick={() => setFilterSkill('')} />
              </span>
            )}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          {loading ? 'Loading...' : `${displayed.length} ${displayed.length === 1 ? 'person' : 'people'} found`}
          {displayed.filter(u => u.matchScore > 0).length > 0 && !loading && (
            <span style={{ color: '#34D399' }}> · {displayed.filter(u => u.matchScore > 0).length} skill matches</span>
          )}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: 'var(--bg-card)' }} />
            ))}
          </div>
        ) : displayed.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayed.map(u => (
              <UserCard key={u.id} user={u} myProfile={userProfile}
                onConnect={id => setConnectedIds(s => new Set([...s, id]))} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Users size={40} className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque' }}>No matches found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Try different search terms or clear your filters</p>
            <button onClick={() => { setSearch(''); setFilterSkill(''); }}
              className="btn-primary mt-4 text-sm py-2 px-5">Clear filters</button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
