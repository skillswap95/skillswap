import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Zap, User, Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, Plus, X, Check } from 'lucide-react';

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

export default function Signup() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [level, setLevel] = useState('Beginner');
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [searchOffered, setSearchOffered] = useState('');
  const [searchWanted, setSearchWanted] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const filteredOffered = ALL_SKILLS.filter(s =>
    s.toLowerCase().includes(searchOffered.toLowerCase()) && !skillsOffered.includes(s)
  ).slice(0, 8);

  const filteredWanted = ALL_SKILLS.filter(s =>
    s.toLowerCase().includes(searchWanted.toLowerCase()) && !skillsWanted.includes(s)
  ).slice(0, 8);

  function toggleSkill(skill, list, setList) {
    if (list.includes(skill)) setList(list.filter(s => s !== skill));
    else if (list.length < 6) setList([...list, skill]);
    else toast.error('Max 6 skills');
  }

  async function handleSubmit() {
    if (!name || !email || !password) return toast.error('Please fill all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (skillsOffered.length === 0) return toast.error('Add at least one skill you can teach');
    if (skillsWanted.length === 0) return toast.error('Add at least one skill you want to learn');
    setLoading(true);
    try {
      await signup(email, password, name);
      // Update profile with skills
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        skillsOffered, skillsWanted, level,
      });
      toast.success('Welcome to SkillSwap AI! 🎉');
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') toast.error('Email already registered');
      else toast.error('Failed to create account');
    }
    setLoading(false);
  }

  const steps = [
    { num: 1, label: 'Account' },
    { num: 2, label: 'Skills You Offer' },
    { num: 3, label: 'Skills You Want' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 grid-bg" style={{ background: 'var(--bg-deep)' }}>
      <div className="w-full max-w-lg fade-in-up">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #38BDF8, #818CF8)' }}>
            <Zap size={16} color="#07090F" fill="#07090F" />
          </div>
          <span className="font-bold text-lg" style={{ fontFamily: 'Bricolage Grotesque' }}>
            Skill<span className="gradient-text">Swap</span> AI
          </span>
        </Link>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {steps.map(({ num, label }, i) => (
            <div key={num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all`}
                  style={{
                    background: step > num ? '#34D399' : step === num ? 'linear-gradient(135deg, #38BDF8, #818CF8)' : 'rgba(255,255,255,0.06)',
                    color: step >= num ? '#07090F' : 'var(--text-secondary)',
                    fontFamily: 'Bricolage Grotesque',
                    border: step < num ? '1px solid var(--border)' : 'none',
                  }}>
                  {step > num ? <Check size={16} /> : num}
                </div>
                <span className="text-xs mt-1.5 whitespace-nowrap"
                  style={{ color: step === num ? '#38BDF8' : 'var(--text-secondary)', fontFamily: 'Lexend' }}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-24 h-px mx-2 mb-5"
                  style={{ background: step > num + 1 ? '#34D399' : 'var(--border)' }} />
              )}
            </div>
          ))}
        </div>

        <div className="p-8 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {/* STEP 1: Account */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-black mb-1" style={{ fontFamily: 'Bricolage Grotesque' }}>Create your account</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Free forever. No credit card needed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                  <input className="input-dark pl-10" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                  <input type="email" className="input-dark pl-10" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                  <input type={showPw ? 'text' : 'password'} className="input-dark pl-10 pr-10" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Your Level</label>
                <div className="flex gap-2">
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => setLevel(l)}
                      className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: level === l ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${level === l ? 'rgba(56,189,248,0.4)' : 'var(--border)'}`,
                        color: level === l ? '#38BDF8' : 'var(--text-secondary)',
                        fontFamily: 'Lexend',
                      }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => {
                if (!name || !email || !password) return toast.error('Fill all fields');
                if (password.length < 6) return toast.error('Password min 6 chars');
                setStep(2);
              }} className="btn-primary w-full justify-center py-3">
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: Skills Offered */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-black mb-1" style={{ fontFamily: 'Bricolage Grotesque' }}>What can you teach?</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Select up to 6 skills you can offer others.</p>
              </div>

              <input className="input-dark" placeholder="Search skills..." value={searchOffered} onChange={e => setSearchOffered(e.target.value)} />

              {skillsOffered.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skillsOffered.map(s => (
                    <span key={s} className="skill-badge skill-badge-offered flex items-center gap-1.5 cursor-pointer"
                      onClick={() => toggleSkill(s, skillsOffered, setSkillsOffered)}>
                      {s} <X size={10} />
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {filteredOffered.map(s => (
                  <button key={s} onClick={() => toggleSkill(s, skillsOffered, setSkillsOffered)}
                    className="text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center justify-between"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontFamily: 'Lexend',
                    }}>
                    {s}
                    <Plus size={13} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2 py-3 px-5">
                  <ArrowLeft size={15} /> Back
                </button>
                <button onClick={() => {
                  if (skillsOffered.length === 0) return toast.error('Add at least one skill');
                  setStep(3);
                }} className="btn-primary flex-1 justify-center py-3">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Skills Wanted */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-black mb-1" style={{ fontFamily: 'Bricolage Grotesque' }}>What do you want to learn?</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Select up to 6 skills you want to acquire.</p>
              </div>

              <input className="input-dark" placeholder="Search skills..." value={searchWanted} onChange={e => setSearchWanted(e.target.value)} />

              {skillsWanted.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skillsWanted.map(s => (
                    <span key={s} className="skill-badge skill-badge-wanted flex items-center gap-1.5 cursor-pointer"
                      onClick={() => toggleSkill(s, skillsWanted, setSkillsWanted)}>
                      {s} <X size={10} />
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {filteredWanted.map(s => (
                  <button key={s} onClick={() => toggleSkill(s, skillsWanted, setSkillsWanted)}
                    className="text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center justify-between"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontFamily: 'Lexend',
                    }}>
                    {s}
                    <Plus size={13} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex items-center gap-2 py-3 px-5">
                  <ArrowLeft size={15} /> Back
                </button>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center py-3"
                  style={{ opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Creating account...' : 'Launch my profile 🚀'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#38BDF8', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
