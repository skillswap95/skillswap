import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import { Users, MessageCircle, TrendingUp, Zap, ArrowRight, Star, Clock, BookOpen } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <p className="text-3xl font-black mb-1" style={{ fontFamily: 'Bricolage Grotesque', color }}>{value}</p>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    </div>
  );
}

function MatchCard({ user }) {
  const score = user.matchScore || 0;
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl card-hover"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
      <div className="relative shrink-0">
        <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
          alt={user.name} className="w-11 h-11 rounded-full"
          style={{ border: '2px solid var(--border)', background: '#151F30' }} />
        <div className="status-dot absolute -bottom-0.5 -right-0.5" style={{ width: 8, height: 8 }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ fontFamily: 'Bricolage Grotesque' }}>{user.name}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {(user.skillsOffered || []).slice(0, 2).map(s => (
            <span key={s} className="skill-badge skill-badge-offered" style={{ fontSize: '0.65rem', padding: '2px 7px' }}>{s}</span>
          ))}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-bold" style={{ color: score > 70 ? '#34D399' : '#38BDF8' }}>{score}%</p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>match</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      if (!userProfile) return;
      try {
        const q = query(collection(db, 'users'), limit(20));
        const snap = await getDocs(q);
        const users = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => u.uid !== currentUser.uid);

        const scored = users.map(u => {
          const myWanted = userProfile.skillsWanted || [];
          const myOffered = userProfile.skillsOffered || [];
          const theirOffered = u.skillsOffered || [];
          const theirWanted = u.skillsWanted || [];
          const canLearnFromThem = myWanted.filter(s => theirOffered.includes(s)).length;
          const canTeachThem = myOffered.filter(s => theirWanted.includes(s)).length;
          const total = Math.max(myWanted.length + myOffered.length, 1);
          const score = Math.round(((canLearnFromThem + canTeachThem) / total) * 100);
          return { ...u, matchScore: Math.min(score, 99) };
        }).filter(u => u.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);

        setMatches(scored.slice(0, 5));
      } catch (e) {
        console.error(e);
      }
      setLoadingMatches(false);
    }
    fetchMatches();
  }, [userProfile]);

  const name = userProfile?.name || currentUser?.displayName || 'there';
  const firstName = name.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { icon: Users, label: 'Potential Matches', value: matches.length > 0 ? `${matches.length}+` : '0', color: '#38BDF8', bg: 'rgba(56,189,248,0.1)' },
    { icon: BookOpen, label: 'Skills Offered', value: (userProfile?.skillsOffered || []).length, color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
    { icon: Star, label: 'Skills Wanted', value: (userProfile?.skillsWanted || []).length, color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
    { icon: Clock, label: 'Sessions Done', value: userProfile?.sessionsCompleted || 0, color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  ];

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 fade-in-up">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Bricolage Grotesque' }}>
                {greeting}, {firstName} 👋
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Here's what's happening in your SkillSwap world today.
              </p>
            </div>
            <Link to="/profile" className="btn-secondary text-sm py-2 px-4 hidden md:flex items-center gap-2">
              Complete profile <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Profile completion banner */}
        {(!userProfile?.bio || !userProfile?.location) && (
          <div className="mb-6 p-4 rounded-xl flex items-center gap-4 fade-in-up"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(251,191,36,0.15)' }}>
              <Zap size={16} color="#FBBF24" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: '#FBBF24' }}>Complete your profile to get better matches</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Add your bio, location and availability</p>
            </div>
            <Link to="/profile" className="text-sm font-medium shrink-0" style={{ color: '#FBBF24' }}>
              Complete →
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <StatCard {...s} />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Best Matches */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Bricolage Grotesque' }}>Your Best Matches</h2>
              <Link to="/matches" className="text-sm" style={{ color: '#38BDF8' }}>See all →</Link>
            </div>
            <div className="space-y-3">
              {loadingMatches ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--bg-card)' }} />
                ))
              ) : matches.length > 0 ? (
                matches.map(u => <MatchCard key={u.id} user={u} />)
              ) : (
                <div className="p-8 rounded-2xl text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <Users size={32} className="mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
                  <p className="font-medium mb-1" style={{ fontFamily: 'Bricolage Grotesque' }}>No matches yet</p>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    More users join every day. Invite others to grow your matches!
                  </p>
                  <Link to="/matches" className="btn-primary text-sm py-2 px-5">Browse all users</Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar cards */}
          <div className="space-y-4">
            {/* My Skills */}
            <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold mb-4" style={{ fontFamily: 'Bricolage Grotesque' }}>My Skills</h3>
              <div className="space-y-3">
                {(userProfile?.skillsOffered || []).length > 0 ? (
                  <>
                    <div>
                      <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>I can teach</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(userProfile?.skillsOffered || []).slice(0, 4).map(s => (
                          <span key={s} className="skill-badge skill-badge-offered">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>I want to learn</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(userProfile?.skillsWanted || []).slice(0, 4).map(s => (
                          <span key={s} className="skill-badge skill-badge-wanted">{s}</span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No skills added yet</p>
                )}
                <Link to="/profile" className="btn-secondary w-full text-center text-sm py-2 block">Edit skills</Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold mb-4" style={{ fontFamily: 'Bricolage Grotesque' }}>Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { to: '/matches', icon: Users, label: 'Find skill partners', color: '#38BDF8' },
                  { to: '/chat', icon: MessageCircle, label: 'Open messages', color: '#818CF8' },
                  { to: '/progress', icon: TrendingUp, label: 'Update progress', color: '#34D399' },
                ].map(({ to, icon: Icon, label, color }) => (
                  <Link key={to} to={to}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5"
                    style={{ color: 'var(--text-secondary)' }}>
                    <Icon size={16} color={color} />
                    <span className="text-sm" style={{ fontFamily: 'Lexend' }}>{label}</span>
                    <ArrowRight size={13} className="ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
