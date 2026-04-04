import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import toast from 'react-hot-toast';
import { Plus, Check, X, TrendingUp, Clock, Target, Award, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const PREDEFINED_ROADMAPS = {
  'React': ['HTML & CSS Basics', 'JavaScript Fundamentals', 'React Core Concepts', 'Hooks & State Management', 'React Router', 'API Integration', 'Testing with Jest', 'Build a Portfolio Project'],
  'Python': ['Python Syntax & Variables', 'Data Types & Structures', 'Control Flow', 'Functions & Modules', 'OOP in Python', 'File Handling & I/O', 'Libraries (NumPy, Pandas)', 'Build a Python Project'],
  'UI/UX Design': ['Design Principles', 'Color Theory', 'Typography', 'Wireframing', 'Figma Basics', 'User Research', 'Prototyping', 'Design System Creation'],
  'Photoshop': ['Interface Overview', 'Layers & Masks', 'Selection Tools', 'Photo Retouching', 'Color Correction', 'Typography in Photoshop', 'Compositing', 'Export & Delivery'],
  'Guitar': ['Parts of the Guitar', 'Basic Chords (C, D, G, Am)', 'Strumming Patterns', 'Reading Tabs', 'Scales & Techniques', 'Barre Chords', 'Music Theory Basics', 'Play Your First Song'],
  'Spanish': ['Alphabet & Pronunciation', 'Basic Vocabulary (100 words)', 'Present Tense Verbs', 'Numbers & Time', 'Everyday Phrases', 'Past Tense', 'Subjunctive Mood', 'Conversational Practice'],
  'Digital Marketing': ['Marketing Fundamentals', 'SEO Basics', 'Google Analytics', 'Social Media Strategy', 'Email Marketing', 'Content Marketing', 'Paid Advertising (PPC)', 'Analytics & Reporting'],
};

const SKILL_COLORS = ['#38BDF8', '#818CF8', '#34D399', '#FBBF24', '#F472B6', '#FB923C'];

function ProgressCard({ item, onToggleTopic, onUpdateHours, onDelete, colorIdx }) {
  const [expanded, setExpanded] = useState(false);
  const [hours, setHours] = useState(item.hoursSpent || 0);
  const color = SKILL_COLORS[colorIdx % SKILL_COLORS.length];
  const completed = (item.topics || []).filter(t => t.done).length;
  const total = (item.topics || []).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {/* Top bar */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${color}, ${color}50)`, width: '100%' }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg" style={{ fontFamily: 'Bricolage Grotesque' }}>{item.skill}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{completed}/{total} topics</span>
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                <Clock size={10} /> {item.hoursSpent || 0}h logged
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black" style={{ fontFamily: 'Bricolage Grotesque', color }}>{pct}%</span>
            <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg transition-all hover:bg-red-500/10"
              style={{ color: '#475569' }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar mb-4">
          <div className="progress-fill" style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
          }} />
        </div>

        {/* Hours */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Log hours:</span>
          <div className="flex items-center gap-2">
            <button onClick={() => { const n = Math.max(0, hours - 0.5); setHours(n); onUpdateHours(item.id, n); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-lg font-bold transition-all hover:bg-white/10"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>−</button>
            <span className="text-sm font-bold w-12 text-center" style={{ fontFamily: 'Bricolage Grotesque' }}>{hours}h</span>
            <button onClick={() => { const n = hours + 0.5; setHours(n); onUpdateHours(item.id, n); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-lg font-bold transition-all hover:bg-white/10"
              style={{ border: '1px solid var(--border)', color }}>+</button>
          </div>
        </div>

        {/* Topics toggle */}
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm w-full transition-all hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Hide' : 'Show'} topics ({total})
        </button>

        {/* Topics list */}
        {expanded && (
          <div className="mt-4 space-y-2">
            {(item.topics || []).map((topic, i) => (
              <button key={i} onClick={() => onToggleTopic(item.id, i)}
                className="flex items-center gap-3 w-full p-2.5 rounded-xl transition-all text-left hover:bg-white/5"
                style={{ border: '1px solid transparent' }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background: topic.done ? `${color}25` : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${topic.done ? color : 'var(--border)'}`,
                  }}>
                  {topic.done && <Check size={11} color={color} strokeWidth={3} />}
                </div>
                <span className="text-sm" style={{
                  color: topic.done ? 'var(--text-secondary)' : 'var(--text-primary)',
                  textDecoration: topic.done ? 'line-through' : 'none',
                  fontFamily: 'Lexend',
                }}>{topic.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Progress() {
  const { currentUser, userProfile } = useAuth();
  const [trackers, setTrackers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [customTopics, setCustomTopics] = useState('');

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      if (snap.exists()) {
        setTrackers(snap.data().progressTrackers || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function save(updated) {
    setTrackers(updated);
    await updateDoc(doc(db, 'users', currentUser.uid), { progressTrackers: updated });
  }

  async function addTracker() {
    if (!newSkill.trim()) return toast.error('Enter a skill name');
    const skill = newSkill.trim();
    const roadmap = PREDEFINED_ROADMAPS[skill] || (
      customTopics.trim()
        ? customTopics.split('\n').filter(Boolean)
        : ['Getting started', 'Core concepts', 'Practice project', 'Advanced topics']
    );

    const tracker = {
      id: Date.now().toString(),
      skill,
      topics: roadmap.map(label => ({ label, done: false })),
      hoursSpent: 0,
      createdAt: new Date().toISOString(),
    };

    const updated = [...trackers, tracker];
    await save(updated);
    setNewSkill('');
    setCustomTopics('');
    setAdding(false);
    toast.success(`Started tracking ${skill}! 🚀`);
  }

  async function toggleTopic(trackerId, topicIdx) {
    const updated = trackers.map(t => {
      if (t.id !== trackerId) return t;
      const topics = t.topics.map((tp, i) => i === topicIdx ? { ...tp, done: !tp.done } : tp);
      return { ...t, topics };
    });
    await save(updated);
  }

  async function updateHours(trackerId, hours) {
    const updated = trackers.map(t => t.id === trackerId ? { ...t, hoursSpent: hours } : t);
    await save(updated);
  }

  async function deleteTracker(trackerId) {
    const updated = trackers.filter(t => t.id !== trackerId);
    await save(updated);
    toast.success('Tracker removed');
  }

  const totalHours = trackers.reduce((sum, t) => sum + (t.hoursSpent || 0), 0);
  const totalTopics = trackers.reduce((sum, t) => sum + (t.topics?.length || 0), 0);
  const completedTopics = trackers.reduce((sum, t) => sum + (t.topics?.filter(tp => tp.done).length || 0), 0);
  const avgProgress = trackers.length > 0
    ? Math.round(trackers.reduce((sum, t) => {
        const done = (t.topics || []).filter(tp => tp.done).length;
        const total = (t.topics || []).length || 1;
        return sum + (done / total) * 100;
      }, 0) / trackers.length)
    : 0;

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'Bricolage Grotesque' }}>Learning Progress</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Track your skill journey and celebrate milestones.</p>
          </div>
          <button onClick={() => setAdding(true)} className="btn-primary text-sm py-2 px-4">
            <Plus size={15} /> Track new skill
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Target, label: 'Skills Tracked', value: trackers.length, color: '#38BDF8', bg: 'rgba(56,189,248,0.1)' },
            { icon: Check, label: 'Topics Done', value: `${completedTopics}/${totalTopics}`, color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
            { icon: Clock, label: 'Total Hours', value: `${totalHours}h`, color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
            { icon: TrendingUp, label: 'Avg. Progress', value: `${avgProgress}%`, color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon size={16} color={color} />
              </div>
              <p className="text-2xl font-black mb-0.5" style={{ fontFamily: 'Bricolage Grotesque', color }}>{value}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Add new tracker modal/inline */}
        {adding && (
          <div className="mb-6 p-6 rounded-2xl fade-in-up" style={{ background: 'var(--bg-card)', border: '1px solid rgba(56,189,248,0.2)' }}>
            <h3 className="font-bold mb-4" style={{ fontFamily: 'Bricolage Grotesque' }}>Add Skill Tracker</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Skill Name</label>
                <input className="input-dark" placeholder="e.g. React, Guitar, Spanish..."
                  value={newSkill} onChange={e => setNewSkill(e.target.value)} />
                {PREDEFINED_ROADMAPS[newSkill] && (
                  <p className="text-xs mt-1.5" style={{ color: '#34D399' }}>
                    ✨ We have a pre-built roadmap for {newSkill}!
                  </p>
                )}
              </div>

              {/* Suggest from wanted skills */}
              {(userProfile?.skillsWanted || []).length > 0 && (
                <div>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>From your wanted skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {(userProfile.skillsWanted || []).map(s => (
                      <button key={s} onClick={() => setNewSkill(s)}
                        className={`skill-badge cursor-pointer transition-all ${newSkill === s ? 'skill-badge-wanted' : ''}`}
                        style={newSkill !== s ? { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-secondary)' } : {}}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!PREDEFINED_ROADMAPS[newSkill] && newSkill && (
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Custom Topics (one per line, optional)
                  </label>
                  <textarea className="input-dark resize-none" rows={4}
                    placeholder={"Topic 1\nTopic 2\nTopic 3\n..."}
                    value={customTopics} onChange={e => setCustomTopics(e.target.value)} />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setAdding(false); setNewSkill(''); setCustomTopics(''); }}
                  className="btn-secondary text-sm py-2 px-4">Cancel</button>
                <button onClick={addTracker} className="btn-primary text-sm py-2 px-4">
                  <Plus size={14} /> Start Tracking
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trackers grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: 'var(--bg-card)' }} />
            ))}
          </div>
        ) : trackers.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-5">
            {trackers.map((item, i) => (
              <ProgressCard key={item.id} item={item} colorIdx={i}
                onToggleTopic={toggleTopic} onUpdateHours={updateHours} onDelete={deleteTracker} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)' }}>
              <TrendingUp size={28} color="#38BDF8" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque' }}>No skills tracked yet</h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Start tracking your first skill and watch your progress grow!
            </p>
            <button onClick={() => setAdding(true)} className="btn-primary text-sm py-2.5 px-6">
              <Plus size={15} /> Track your first skill
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
