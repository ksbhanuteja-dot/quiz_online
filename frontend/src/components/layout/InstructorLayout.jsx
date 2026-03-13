import { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  Brain, 
  LayoutDashboard, 
  Library, 
  PlusCircle, 
  BarChart3, 
  Trophy, 
  LogOut,
  Menu
} from 'lucide-react';
import { useState } from 'react';

export default function InstructorLayout() {
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Quizzes', path: '/dashboard/quizzes', icon: Library },
    { name: 'Create Quiz', path: '/dashboard/create-quiz', icon: PlusCircle },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Leaderboard', path: '/dashboard/leaderboard', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-20 bg-slate-900/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-3 px-6 py-8 border-b border-slate-100">
            <Brain size={32} className="text-primary-600" />
            <span className="text-2xl font-bold text-slate-900">Instructor</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/dashboard'} // Dashboard is exact match
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <Icon size={20} className={({ isActive }) => isActive ? 'text-primary-600' : 'text-slate-400'} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200">
            <div className="px-4 py-3 mb-2">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'Instructor'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 transition-opacity">
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={24} className="text-primary-600" />
            <span className="font-bold text-slate-900">QuizOnline</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
