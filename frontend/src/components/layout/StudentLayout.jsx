import { useContext, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/auth-context';
import { 
  Brain, 
  LayoutDashboard, 
  PlayCircle, 
  Trophy, 
  LogOut,
  Menu
} from 'lucide-react';
import ThemeToggle from '../shared/ThemeToggle';

export default function StudentLayout() {
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/student-dashboard', icon: LayoutDashboard },
    { name: 'Available Quizzes', path: '/student-dashboard/quizzes', icon: PlayCircle },
    { name: 'Leaderboard', path: '/student-dashboard/leaderboard', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-300">
      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-20 bg-slate-900/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-6 py-8 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Brain size={32} className="text-primary-600 dark:text-primary-500" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">Student</span>
            </div>
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/student-dashboard'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                    ${isActive 
                      ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }
                  `}
                >
                  <Icon size={20} className="text-slate-400" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="px-4 py-3 mb-2">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name || 'Student'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 transition-opacity">
        <header className="lg:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={24} className="text-primary-600 dark:text-primary-500" />
            <span className="font-bold text-slate-900 dark:text-white">QuizOnline</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
