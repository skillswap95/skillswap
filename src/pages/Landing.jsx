import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Zap, ArrowRight, Users, Brain, MessageCircle, TrendingUp, Star, ChevronRight, Code, Palette, Music, Camera, Globe, BookOpen } from 'lucide-react';

const FLOATING_SKILLS = [
  { label: 'React', color: '#38BDF8', x: 8, y: 15, delay: 0 },
  { label: 'Photoshop', color: '#818CF8', x: 80, y: 20, delay: 1 },
  { label: 'Guitar', color: '#34D399', x: 15, y: 65, delay: 2 },
  { label: 'Python', color: '#FBBF24', x: 75, y: 70, delay: 0.5 },
  { label: 'Spanish', color: '#F472B6', x: 50, y: 10, delay: 1.5 },
  { label: 'UI Design', color: '#818CF8', x: 88, y: 45, delay: 2.5 },
  { label: 'Video Edit', color: '#38BDF8', x: 5, y: 40, delay: 3 },
  { label: 'Marketing', color: '#34D399', x: 60, y: 80, delay: 0.8 },
];

const FEATURES = [
  {
    icon: Users,
    title: 'Smart Matching',
    desc: 'Our algorithm finds your perfect skill-swap partner based on what you offer and what you want to learn.',
    color: '#38BDF8',
    bg: 'rgba(56,189,248,0.08)',
  },
  {
    icon: Brain,
    title: 'AI Learning Paths',
    desc: 'Get personalized roadmaps for any skill. Know exactly what to learn next and how to get there.',
    color: '#818CF8',
    bg: 'rgba(129,140,248,0.08)',
  },
  {
    icon: MessageCircle,
    title: 'Real-time Chat',
    desc: 'Connect instantly with your matches. Schedule sessions, share resources, and grow together.',
    color: '#34D399',
    bg: 'rgba(52,211,153,0.08)',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracker',
    desc: 'Visualize your learning journey. Track hours, completed lessons, and celebrate milestones.',
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.08)',
  },
];

const HOW_STEPS = [
  { num: '01', title: 'Create your profile', desc: 'List the skills you can teach and the ones you want to learn.' },
  { num: '02', title: 'Get matched', desc: 'Our system finds users who have what you want and want what you have.' },
  { num: '03', title: 'Start swapping', desc: 'Chat, schedule sessions, and grow together — zero cost, pure value.' },
];

const TESTIMONIALS = [
  { name: 'Sofia R.', skill: 'Taught: Italian · Learned: Web Dev', text: 'I swapped Italian lessons for React tutorials. Within 2 months I landed my first freelance project. This platform is magic.', rating: 5, avatar: 'Sofia' },
  { name: 'Marcus T.', skill: 'Taught: Guitar · Learned: Graphic Design', text: 'The matching was spot on. Found someone within an hour who needed guitar lessons and knew Figma inside out.', rating: 5, avatar: 'Marcus' },
  { name: 'Priya K.', skill: 'Taught: Python · Learned: Photography', text: 'As a developer I never thought I could afford photography lessons. SkillSwap changed that completely.', rating: 5, avatar: 'Priya' },
];

const SKILL_CATEGORIES = [
  { icon: Code, label: 'Technology', count: '2.4k learners' },
  { icon: Palette, label: 'Design', count: '1.8k learners' },
  { icon: Music, label: 'Music', count: '3.1k learners' },
  { icon: Camera, label: 'Photography', count: '980 learners' },
  { icon: Globe, label: 'Languages', count: '4.2k learners' },
  { icon: BookOpen, label: 'Academics', count: '1.5k learners' },
];

export default function Landing() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 transition-all"
        style={{
          background: scrollY > 20 ? 'rgba(7,9,15,0.9)' : 'transparent',
          backdropFilter: scrollY > 20 ? 'blur(20px)' : 'none',
          borderBottom: scrollY > 20 ? '1px solid var(--border)' : 'none',
        }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #38BDF8, #818CF8)' }}>
            <Zap size={16} color="#07090F" fill="#07090F" />
          </div>
          <span className="text-lg font-bold" style={{ fontFamily: 'Bricolage Grotesque' }}>
            Skill<span className="gradient-text">Swap</span> AI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How it works', 'Categories'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g,'-')}`}
              className="text-sm transition-colors hover:text-white"
              style={{ color: 'var(--text-secondary)', fontFamily: 'Lexend' }}>
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm py-2 px-5">Sign in</Link>
          <Link to="/signup" className="btn-primary text-sm py-2 px-5">Get started <ArrowRight size={15} /></Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-6 grid-bg overflow-hidden">
        {/* Orbs */}
        <div className="orb w-96 h-96 -top-20 -left-20" style={{ background: '#38BDF8' }} />
        <div className="orb w-80 h-80 -bottom-10 -right-10" style={{ background: '#818CF8' }} />
        <div className="orb w-64 h-64 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ background: '#34D399', opacity: 0.08 }} />

        {/* Floating skill pills */}
        {FLOATING_SKILLS.map((s, i) => (
          <div key={i}
            className="absolute hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold animate-float"
            style={{
              left: `${s.x}%`, top: `${s.y}%`,
              background: `${s.color}15`,
              border: `1px solid ${s.color}30`,
              color: s.color,
              animationDelay: `${s.delay}s`,
              animationDuration: `${4 + s.delay}s`,
              fontFamily: 'Lexend',
            }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
            {s.label}
          </div>
        ))}

        <div className="relative z-10 max-w-4xl mx-auto fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', color: '#38BDF8', fontFamily: 'Lexend' }}>
            <Zap size={12} fill="#38BDF8" color="#38BDF8" />
            No money needed — exchange skills
            <ChevronRight size={12} />
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight mb-6"
            style={{ fontFamily: 'Bricolage Grotesque' }}>
            Learn anything.
            <br />
            <span className="gradient-text">Teach what you know.</span>
          </h1>

          <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontFamily: 'Lexend', fontWeight: 300 }}>
            SkillSwap AI matches you with people who have what you want to learn — and want to learn what you know. Free. Forever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup" className="btn-primary text-base px-8 py-3.5">
              Start swapping skills <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
              I have an account
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 pt-8"
            style={{ borderTop: '1px solid var(--border)' }}>
            {[
              { num: '12,400+', label: 'Active Learners' },
              { num: '340+', label: 'Skills Available' },
              { num: '98%', label: 'Match Rate' },
              { num: '0 €', label: 'Always Free' },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black gradient-text" style={{ fontFamily: 'Bricolage Grotesque' }}>{num}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)', fontFamily: 'Lexend' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium mb-3" style={{ color: '#38BDF8', fontFamily: 'Lexend', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Why SkillSwap AI
            </p>
            <h2 className="text-5xl font-black mb-4" style={{ fontFamily: 'Bricolage Grotesque' }}>
              Everything you need to<br /><span className="gradient-text">grow</span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              We've built the tools to make skill exchange effortless, effective, and enjoyable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="p-8 rounded-2xl card-hover"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: bg }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Bricolage Grotesque' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium mb-3" style={{ color: '#818CF8', fontFamily: 'Lexend', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Simple process
            </p>
            <h2 className="text-5xl font-black" style={{ fontFamily: 'Bricolage Grotesque' }}>
              How it <span style={{ background: 'linear-gradient(135deg, #818CF8, #F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>works</span>
            </h2>
          </div>

          <div className="space-y-6">
            {HOW_STEPS.map(({ num, title, desc }, i) => (
              <div key={num} className="flex gap-6 p-6 rounded-2xl card-hover items-start"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="text-4xl font-black shrink-0 w-16" style={{
                  fontFamily: 'Bricolage Grotesque',
                  background: i === 0 ? 'linear-gradient(135deg, #38BDF8, #818CF8)' : i === 1 ? 'linear-gradient(135deg, #818CF8, #F472B6)' : 'linear-gradient(135deg, #34D399, #38BDF8)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>{num}</div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque' }}>{title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black mb-4" style={{ fontFamily: 'Bricolage Grotesque' }}>
              Explore <span className="gradient-text-amber">categories</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>Hundreds of skills waiting to be exchanged</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SKILL_CATEGORIES.map(({ icon: Icon, label, count }) => (
              <div key={label} className="p-6 rounded-2xl card-hover text-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(56,189,248,0.08)' }}>
                  <Icon size={22} color="#38BDF8" />
                </div>
                <h3 className="font-bold mb-1" style={{ fontFamily: 'Bricolage Grotesque' }}>{label}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black mb-4" style={{ fontFamily: 'Bricolage Grotesque' }}>
              Real people, <span className="gradient-text">real growth</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, skill, text, rating, avatar }) => (
              <div key={name} className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex mb-4">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} size={14} color="#FBBF24" fill="#FBBF24" />
                  ))}
                </div>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>"{text}"</p>
                <div className="flex items-center gap-3">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar}`}
                    alt={name} className="w-10 h-10 rounded-full"
                    style={{ border: '2px solid var(--border)', background: '#151F30' }} />
                  <div>
                    <p className="font-semibold text-sm" style={{ fontFamily: 'Bricolage Grotesque' }}>{name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{skill}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-3xl relative overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid rgba(56,189,248,0.15)' }}>
            <div className="orb w-64 h-64 -top-20 -left-20" style={{ background: '#38BDF8', opacity: 0.15 }} />
            <div className="orb w-64 h-64 -bottom-20 -right-20" style={{ background: '#818CF8', opacity: 0.15 }} />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #38BDF8, #818CF8)' }}>
                <Zap size={28} color="#07090F" fill="#07090F" />
              </div>
              <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Bricolage Grotesque' }}>
                Ready to start swapping?
              </h2>
              <p className="mb-8 text-lg" style={{ color: 'var(--text-secondary)' }}>
                Join thousands of learners who are growing through the power of skill exchange.
              </p>
              <Link to="/signup" className="btn-primary text-base px-10 py-4">
                Create your free account <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #38BDF8, #818CF8)' }}>
            <Zap size={12} color="#07090F" fill="#07090F" />
          </div>
          <span className="font-bold" style={{ fontFamily: 'Bricolage Grotesque' }}>SkillSwap AI</span>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          © 2025 SkillSwap AI — Exchange skills, not money.
        </p>
      </footer>
    </div>
  );
}
