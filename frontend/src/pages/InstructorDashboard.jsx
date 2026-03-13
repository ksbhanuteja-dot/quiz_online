import { useState, useEffect } from 'react';
import { FileText, Users, Target, TrendingUp } from 'lucide-react';
import api from '../api/axios';

export default function InstructorDashboard() {
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
    activeStudents: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for initial render or fallback
    // Try fetching from API later
    const fetchStats = async () => {
      try {
        const response = await api.get('/instructor/stats');
        setStats(response.data);
      } catch (err) {
        console.warn('Using mock data, API failed:', err);
        setStats({
          totalQuizzes: 12,
          totalAttempts: 348,
          averageScore: 76.5,
          activeStudents: 45
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { 
      name: 'Total Quizzes', 
      value: stats.totalQuizzes, 
      icon: FileText, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50' 
    },
    { 
      name: 'Total Attempts', 
      value: stats.totalAttempts, 
      icon: Users, 
      color: 'text-emerald-600', 
      bgColor: 'bg-emerald-50' 
    },
    { 
      name: 'Average Score', 
      value: `${stats.averageScore}%`, 
      icon: Target, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50' 
    },
    { 
      name: 'Active Students', 
      value: stats.activeStudents, 
      icon: TrendingUp, 
      color: 'text-amber-600', 
      bgColor: 'bg-amber-50' 
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="mt-2 text-slate-600">Here's what's happening with your courses today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${stat.bgColor}`}>
                  <Icon size={24} className={stat.color} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                  <div className="flex items-baseline gap-2">
                    {isLoading ? (
                      <div className="h-8 w-16 bg-slate-200 animate-pulse rounded mt-1"></div>
                    ) : (
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Placeholder for Quick Actions or Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Quizzes</h2>
          {isLoading ? (
             <div className="space-y-4">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse"></div>
               ))}
             </div>
          ) : (
             <div className="text-center py-10">
               <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                 <FileText className="text-slate-400" size={24} />
               </div>
               <h3 className="text-sm font-medium text-slate-900">No quizzes yet</h3>
               <p className="mt-1 text-sm text-slate-500">Get started by creating a new quiz.</p>
             </div>
          )}
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
             <button className="w-full text-left px-4 py-3 rounded-xl border border-dashed border-slate-300 hover:border-primary-500 hover:bg-primary-50 transition-colors flex items-center gap-3">
               <PlusCircle size={20} className="text-primary-600" />
               <span className="font-medium text-slate-700 block">Create new quiz</span>
             </button>
             <button className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-3">
               <Users size={20} className="text-slate-600" />
               <span className="font-medium text-slate-700 block">Manage students</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
