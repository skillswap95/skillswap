import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import toast from 'react-hot-toast';
import { Camera, Edit3, Plus, X, Save, Star, MapPin, Clock, Award } from 'lucide-react';

const ALL_SKILLS = [
  'JavaScript','React','Python','Node.js','Java','PHP','Swift','Kotlin','Flutter',
  'Photoshop','Illustrator','Figma','UI/UX Design','3D Modeling','Video Editing',
  'Spanish','French','German','Italian','Mandarin','Japanese','Arabic','Portuguese',
  'Guitar','Piano','Drums','Singing','Music Production',
  'Photography','Videography','Drawing','Painting','Sculpture',
  'Digital Marketing','SEO','Content Writing','Copywriting','Social Media',
  'Excel','Data Analysis','Machine Learning','SQL','Tableau',
  'Yoga','Cooking','Public Speaking','Chess','Financial Planning'
];

const LEVELS = ['Beginner', 'Intermediate', 'Expert'];
const AVAILABILITY = ['Weekdays', 'Weekends', 'Evenings', 'Flexible', 'Weekday Evenings'];

export default function Profile() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', bio: '', location: '', level: 'Beginner', availability: 'Weekends',
    skillsOffered: [], skillsWanted: [],
  });
  const [skillSearch, setSkillSearch] = useState({ offered: '', wanted: '' });

  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        level: userProfile.level || 'Beginner',
        availability: userProfile.availability || 'Weekends',
        skillsOffered: userProfile.skillsOffered || [],
        skillsWanted: userProfile.skillsWanted || [],
      });
    }
  }, [userProfile]);

  function toggleSkill(skill, type) {
    const key = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    const arr = form[key];
    if (arr.includes(skill)) {
      setForm(f => ({ ...f, [key]: arr.filter(s => s !== skill) }));
    } else if (arr.length < 8) {
      setForm(f => ({ ...f, [key]: [...arr, skill] }));
    } else {
      toast.error('Max 8 skills');
    }
  }

  async function handleSave() {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: form.name,
        bio: form.bio,
        location: form.location,
        level: form.level,
        availability: form.availability,
        skillsOffered: form.skillsOffered,
        skillsWanted: form.skillsWanted,
      });
      await refreshProfile();
      setEditing(false);
      toast.success('Profile saved!');
    } catch {
      toast.error('Failed to save');
    }
    setSaving(false);
  }

  const profile = userProfile || {};
  const avatar = profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`;
  const completionItems = ['name', 'bio', 'location', 'skillsOffered', 'skillsWanted'];
  const completion = Math.round(
    completionItems.filter(k => {
      const v = profile[k];
      return Array.isArray(v) ? v.length > 0 : !!v;
    }).length / completionItems.length * 100
  );

  const filteredOffered = ALL_SKILLS.filter(s =>
    s.toLowerCase().includes(skillSearch.offered.toLowerCase()) && !form.skillsOffered.includes(s)
  ).slice(0, 10);

  const filteredWanted = ALL_SKILLS.filter(s =>
    s.toLowerCase().includes(skillSearch.wanted.toLowerCase()) && !form.skillsWanted.includes(s)
  ).slice(0, 10);

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black" style={{ fontFamily: 'Bricolage Grotesque' }}>My Profile</h1>
          {editing ? (
            <div className="flex gap-3">
              <button onClick={() => setEditing(false)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2 px-4">
                <Save size={14} /> {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-primary text-sm py-2 px-4">
              <Edit3 size={14} /> Edit Profile
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            {/* Avatar + basic info */}
            <div className="p-6 rounded-2xl text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="relative inline-block mb-4">
                <img src={avatar} alt="avatar"
                  className="w-24 h-24 rounded-full mx-auto"
                  style={{ border: '3px solid rgba(56,189,248,0.3)', background: '#151F30' }} />
                <div className="status-dot absolute bottom-1 right-1" />
              </div>

              {editing ? (
                <input className="input-dark text-center mb-2 font-bold" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
              ) : (
                <h2 className="text-xl font-black mb-1" style={{ fontFamily: 'Bricolage Grotesque' }}>{profile.name}</h2>
              )}

              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} color="#FBBF24" fill={i < Math.round(profile.rating || 0) ? '#FBBF24' : 'none'} />
                ))}
                <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>
                  ({profile.ratingCount || 0} reviews)
                </span>
              </div>

              {editing ? (
                <div className="flex gap-1 mt-3">
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => setForm(f => ({ ...f, level: l }))}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: form.level === l ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${form.level === l ? 'rgba(56,189,248,0.4)' : 'var(--border)'}`,
                        color: form.level === l ? '#38BDF8' : 'var(--text-secondary)',
                      }}>{l}</button>
                  ))}
                </div>
              ) : (
                <span className="skill-badge skill-badge-amber text-xs">{profile.level || 'Beginner'}</span>
              )}
            </div>

            {/* Profile completion */}
            <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ fontFamily: 'Bricolage Grotesque' }}>Profile Strength</h3>
                <span className="text-sm font-bold" style={{ color: completion > 70 ? '#34D399' : '#FBBF24' }}>{completion}%</span>
              </div>
              <div className="progress-bar mb-3">
                <div className="progress-fill" style={{ width: `${completion}%` }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {completion === 100 ? '✅ Profile complete!' : 'Complete your profile for better matches'}
              </p>
            </div>

            {/* Location & availability */}
            <div className="p-5 rounded-2xl space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} color="#38BDF8" />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Location</span>
                </div>
                {editing ? (
                  <input className="input-dark text-sm" value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City, Country" />
                ) : (
                  <p className="text-sm">{profile.location || <span style={{ color: 'var(--text-secondary)' }}>Not set</span>}</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} color="#818CF8" />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Availability</span>
                </div>
                {editing ? (
                  <div className="flex flex-wrap gap-1">
                    {AVAILABILITY.map(a => (
                      <button key={a} onClick={() => setForm(f => ({ ...f, availability: a }))}
                        className="px-2.5 py-1 rounded-lg text-xs transition-all"
                        style={{
                          background: form.availability === a ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${form.availability === a ? 'rgba(129,140,248,0.4)' : 'var(--border)'}`,
                          color: form.availability === a ? '#818CF8' : 'var(--text-secondary)',
                        }}>{a}</button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm">{profile.availability || 'Not set'}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'Bricolage Grotesque' }}>Stats</h3>
              <div className="space-y-3">
                {[
                  { icon: Award, label: 'Matches', value: profile.matchesCount || 0, color: '#38BDF8' },
                  { icon: Clock, label: 'Sessions Done', value: profile.sessionsCompleted || 0, color: '#818CF8' },
                  { icon: Star, label: 'Rating', value: profile.rating ? `${profile.rating.toFixed(1)}★` : 'No ratings', color: '#FBBF24' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={14} color={color} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ fontFamily: 'Bricolage Grotesque' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Bio */}
            <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold mb-3" style={{ fontFamily: 'Bricolage Grotesque' }}>About Me</h3>
              {editing ? (
                <textarea
                  className="input-dark resize-none"
                  rows={4}
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell others about yourself, your background, and what you love to teach..."
                />
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: profile.bio ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {profile.bio || 'No bio yet. Click "Edit Profile" to add one.'}
                </p>
              )}
            </div>

            {/* Skills Offered */}
            <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold mb-4" style={{ fontFamily: 'Bricolage Grotesque' }}>
                Skills I Can Teach
                <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>
                  ({form.skillsOffered.length}/8)
                </span>
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {form.skillsOffered.map(s => (
                  <span key={s} className="skill-badge skill-badge-offered flex items-center gap-1.5">
                    {s}
                    {editing && (
                      <X size={10} className="cursor-pointer" onClick={() => toggleSkill(s, 'offered')} />
                    )}
                  </span>
                ))}
                {form.skillsOffered.length === 0 && (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No skills added yet</p>
                )}
              </div>
              {editing && (
                <>
                  <input className="input-dark text-sm mb-3" placeholder="Search to add skill..."
                    value={skillSearch.offered} onChange={e => setSkillSearch(s => ({ ...s, offered: e.target.value }))} />
                  <div className="flex flex-wrap gap-1.5">
                    {filteredOffered.map(s => (
                      <button key={s} onClick={() => { toggleSkill(s, 'offered'); }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                        <Plus size={11} /> {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Skills Wanted */}
            <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold mb-4" style={{ fontFamily: 'Bricolage Grotesque' }}>
                Skills I Want to Learn
                <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>
                  ({form.skillsWanted.length}/8)
                </span>
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {form.skillsWanted.map(s => (
                  <span key={s} className="skill-badge skill-badge-wanted flex items-center gap-1.5">
                    {s}
                    {editing && (
                      <X size={10} className="cursor-pointer" onClick={() => toggleSkill(s, 'wanted')} />
                    )}
                  </span>
                ))}
                {form.skillsWanted.length === 0 && (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No skills added yet</p>
                )}
              </div>
              {editing && (
                <>
                  <input className="input-dark text-sm mb-3" placeholder="Search to add skill..."
                    value={skillSearch.wanted} onChange={e => setSkillSearch(s => ({ ...s, wanted: e.target.value }))} />
                  <div className="flex flex-wrap gap-1.5">
                    {filteredWanted.map(s => (
                      <button key={s} onClick={() => toggleSkill(s, 'wanted')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                        <Plus size={11} /> {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
