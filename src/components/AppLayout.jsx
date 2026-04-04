import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen grid-bg" style={{ background: 'var(--bg-deep)' }}>
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
