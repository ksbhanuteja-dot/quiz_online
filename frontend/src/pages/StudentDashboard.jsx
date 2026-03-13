import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Target, TrendingUp, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import api from '../api/axios';

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalAttempted: 0,
    averageScore: 0,
    highestScore: 0,
    recentScores: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/student/stats');
        setStats(response.data);
      } catch (err) {
        console.warn('Using mock data for student dashboard:', err);
        // Fallback mock data
        setStats({
          totalAttempted: 12,
          averageScore: 82.5,
          highestScore: 98,
          recentScores: [
            { quizName: 'React Basics', score: 75, date: '11/01' },
            { quizName: 'Hooks', score: 85, date: '11/05' },
            { quizName: 'Router', score: 90, date: '11/10' },
            { quizName: 'Redux', score: 80, date: '11/15' },
            { quizName: 'Tailwind', score: 98, date: '11/20' },
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!stats && !isLoading) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-200">
        Failed to load dashboard data. Please check your connection.
      </div>
    );
  }

  const statCards = [
    { name: 'Quizzes Completed', value: stats?.totalAttempted ?? 0, icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { name: 'Average Score', value: `${stats?.averageScore ?? 0}%`, icon: Target, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { name: 'Highest Score', value: `${stats?.highestScore ?? 0}%`, icon: TrophyIcon, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Here is your progress and performance overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.name}</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Performance History</h2>
          {isLoading ? (
            <div className="h-80 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
          ) : stats.recentScores.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.recentScores} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    dot={{r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} 
                    activeDot={{r: 8}} 
                    name="Score %" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-slate-400">
              <TrendingUp size={48} className="mb-4 opacity-50" />
              <p>No quiz history available yet.</p>
            </div>
          )}
        </div>

        {/* Recent Activity Mini-list */}
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h2>
          {isLoading ? (
            <div className="space-y-4">
               {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse"></div>)}
            </div>
          ) : (stats?.recentScores && stats.recentScores.length > 0) ? (
            <div className="space-y-4">
              {stats.recentScores.slice().reverse().slice(0, 4).map((quiz, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{quiz.quizName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={12} /> {quiz.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{quiz.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-slate-500">No recent activity.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function TrophyIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
