import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    CheckCircle2,
    Circle,
    Users,
    Calendar,
    Filter,
    Search,
    ArrowUpRight,
    LayoutDashboard,
    LogOut,
    Bell,
    Check,
    X,
    Tag,
    Activity
} from 'lucide-react';
import { supabase } from './lib/supabase';
import TeamManagement from './components/TeamManagement';
import SettlementSchedule from './components/SettlementSchedule';

function App() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // 필터 입력값 상태 (조회 버튼 클릭 전까지는 UI만 반영)
    const [inputSearch, setInputSearch] = useState('');
    const [inputAssignee, setInputAssignee] = useState('All');
    const [inputMonth, setInputMonth] = useState('All');
    const [inputCategory, setInputCategory] = useState('All');
    const [inputStatus, setInputStatus] = useState('All');

    // 실제 적용된 필터 상태 (조회 버튼 클릭 시 업데이트)
    const [appliedFilters, setAppliedFilters] = useState({
        search: '',
        assignee: 'All',
        month: 'All',
        category: 'All',
        status: 'All'
    });

    // 뷰 및 권한 관련 상태
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'team' | 'schedule'
    const [currentUser, setCurrentUser] = useState({ name: '관리자', email: 'admin@company.com', role: 'admin' });

    // 팝업 관련 상태
    const [modalTask, setModalTask] = useState(null);
    const [modalStatus, setModalStatus] = useState('');
    const [modalDate, setModalDate] = useState('');
    const dateInputRef = useRef(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('settlement_tasks')
            .select('*')
            .order('due_date', { ascending: true });

        if (error) {
            console.error('Error fetching tasks:', error);
        } else {
            // DB 컬럼명(due_date)과 프론트엔드 키명(dueDate) 매핑
            const mappedData = data.map(t => ({
                id: t.id,
                title: t.title,
                assignee: t.assignee,
                status: t.status,
                category: t.category,
                dueDate: t.due_date,
                completedDate: t.completed_date || ''
            }));
            setTasks(mappedData);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (modalTask) {
            setModalStatus(modalTask.status);
            setModalDate(modalTask.completedDate || new Date().toISOString().split('T')[0]);
        }
    }, [modalTask]);

    // 필터용 유동적 데이터 추출
    const assignees = ['All', ...new Set(tasks.map(t => t.assignee))];
    const months = ['All', ...new Set(tasks.map(t => t.dueDate.substring(0, 7)))].sort();
    const categories = ['All', ...new Set(tasks.map(t => t.category))];
    const statuses = [
        { label: '전체 상태', value: 'All' },
        { label: '완료', value: 'completed' },
        { label: '대기', value: 'pending' }
    ];

    // 필터링 적용된 과제 리스트
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchAssignee = appliedFilters.assignee === 'All' || task.assignee === appliedFilters.assignee;
            const matchMonth = appliedFilters.month === 'All' || task.dueDate.startsWith(appliedFilters.month);
            const matchCategory = appliedFilters.category === 'All' || task.category === appliedFilters.category;
            const matchStatus = appliedFilters.status === 'All' || task.status === appliedFilters.status;
            const matchSearch = task.title.toLowerCase().includes(appliedFilters.search.toLowerCase());
            return matchAssignee && matchMonth && matchCategory && matchStatus && matchSearch;
        });
    }, [tasks, appliedFilters]);

    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, percentage };
    }, [tasks]);

    // 조회 버튼 핸들러
    const handleInquiry = () => {
        setAppliedFilters({
            search: inputSearch,
            assignee: inputAssignee,
            month: inputMonth,
            category: inputCategory,
            status: inputStatus
        });
    };

    const updateStatus = async (id, newStatus) => {
        const completedDateValue = newStatus === 'completed' ? modalDate : null;

        const { data, error } = await supabase
            .from('settlement_tasks')
            .update({
                status: newStatus,
                completed_date: completedDateValue,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating task:', error);
            alert(`과제 상태 업데이트에 실패했습니다: ${error.message || '알 수 없는 에러'}`);
        } else if (data && data.length === 0) {
            console.warn('Update successful but no rows were affected. Check RLS or ID matching.');
            alert('DB 요청은 성공했으나 반영된 행이 없습니다. RLS(보안 설정)나 데이터 존재 여부를 확인해 주세요.');
        } else {
            console.log('Update successful in DB:', data);
            // 로컬 상태 업데이트
            setTasks(prev => prev.map(t =>
                t.id === id
                    ? { ...t, status: newStatus, completedDate: newStatus === 'completed' ? modalDate : '' }
                    : t
            ));
            setModalTask(null);
        }
    };

    return (
        <div className="flex h-screen bg-[#0f172a] text-slate-100 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1e293b] border-r border-slate-700 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                        <LayoutDashboard size={20} className="text-white" />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight">정산 Dashboard</h1>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <button
                        onClick={() => setCurrentView('dashboard')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all border ${currentView === 'dashboard' ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-transparent'}`}
                    >
                        <LayoutDashboard size={18} />
                        <span className="font-medium">정산 과제 현황</span>
                    </button>

                    {/* 팀 관리 메뉴: Admin만 활성화 */}
                    <button
                        onClick={() => currentUser.role === 'admin' ? setCurrentView('team') : alert('권한이 없습니다.')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all border group ${currentView === 'team' ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : (currentUser.role === 'admin' ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-transparent' : 'text-slate-600 cursor-not-allowed border-transparent')}`}
                    >
                        <Users size={18} className={currentUser.role === 'admin' ? 'group-hover:text-blue-400' : ''} />
                        <span>팀 관리</span>
                        {currentUser.role !== 'admin' && <Shield size={12} className="ml-auto opacity-50" />}
                    </button>

                    {/* 정산 일정: Admin 전용 */}
                    <button
                        onClick={() => currentUser.role === 'admin' ? setCurrentView('schedule') : alert('권한이 없습니다.')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all border group ${currentView === 'schedule' ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : (currentUser.role === 'admin' ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-transparent' : 'text-slate-600 cursor-not-allowed border-transparent')}`}
                    >
                        <Calendar size={18} className={currentUser.role === 'admin' ? 'group-hover:text-blue-400' : ''} />
                        <span>정산 일정</span>
                        {currentUser.role !== 'admin' && <Shield size={12} className="ml-auto opacity-50" />}
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-700 space-y-2">
                    {/* Role Switcher for Testing */}
                    <div className="flex bg-slate-900/50 p-1 rounded-xl mb-2 gap-1">
                        <button
                            onClick={() => setCurrentUser({ name: '관리자', email: 'admin@company.com', role: 'admin' })}
                            className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all ${currentUser.role === 'admin' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Admin
                        </button>
                        <button
                            onClick={() => {
                                setCurrentUser({ name: '사용자', email: 'member@company.com', role: 'member' });
                                if (currentView === 'team') setCurrentView('dashboard');
                            }}
                            className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all ${currentUser.role === 'member' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Member
                        </button>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 text-slate-400 rounded-lg bg-slate-800/40">
                        <div className={`w-8 h-8 bg-gradient-to-br ${currentUser.role === 'admin' ? 'from-blue-500 to-indigo-600' : 'from-slate-500 to-slate-600'} rounded-full flex items-center justify-center text-white font-bold text-xs shadow-inner`}>
                            {currentUser.name.charAt(0)}
                        </div>
                        <div className="truncate">
                            <p className="font-semibold text-slate-200 text-xs truncate">{currentUser.name}</p>
                            <p className="text-[10px] opacity-60 truncate">{currentUser.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-10 bg-[#0f172a]">
                {/* View Conditional Rendering */}
                {currentView === 'dashboard' ? (
                    <>
                        <header className="flex justify-between items-start mb-10">
                            <div>
                                <h2 className="text-3xl font-extrabold text-white tracking-tight">정산 과제 관리 시스템</h2>
                                <p className="text-slate-400 mt-2 text-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    실시간 정산 현황 및 담당자별 과제 추적
                                </p>
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="text-right mr-2">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Today</p>
                                    <p className="text-sm font-semibold text-slate-300">2026. 01. 28</p>
                                </div>
                                <button className="p-2.5 bg-slate-800 border border-slate-700 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 hover:border-blue-500/50 rounded-xl transition-all relative shadow-lg">
                                    <Bell size={20} />
                                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 border-2 border-[#090e1a] rounded-full"></span>
                                </button>
                            </div>
                        </header>

                        {/* Stats Summary Section */}
                        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
                            <div className="lg:col-span-3 bg-slate-850/40 backdrop-blur-md p-8 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] -mr-10 -mt-10 group-hover:bg-blue-600/10 transition-all duration-700"></div>

                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">전체 정산 진행률</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black text-white">{stats.percentage}</span>
                                            <span className="text-2xl font-bold text-blue-500">%</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-500 text-xs font-bold block mb-1">Status</span>
                                        <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-full border border-green-500/20">정상 가동중</span>
                                    </div>
                                </div>

                                <div className="w-full bg-slate-800/80 h-4 rounded-full overflow-hidden mb-4 p-0.5 border border-slate-700/50">
                                    <div
                                        className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-in-out relative"
                                        style={{ width: `${stats.percentage}%` }}
                                    >
                                        <div className="absolute top-0 right-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent to-white/20"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs font-bold">
                                    <div className="flex gap-4">
                                        <span className="text-slate-500">전체 <span className="text-slate-300 ml-1">{stats.total}</span></span>
                                        <span className="text-slate-500">완료 <span className="text-blue-400 ml-1">{stats.completed}</span></span>
                                    </div>
                                    <span className="text-slate-500 tracking-tighter italic">Last updated: 1 min ago</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/60 p-8 rounded-3xl border border-indigo-500/10 flex flex-col justify-between shadow-xl">
                                <div>
                                    <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Activity size={12} />
                                        Warning
                                    </p>
                                    <h4 className="text-slate-200 font-bold leading-tight">이번 주 마감이<br />임박한 과제</h4>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-amber-500">3</span>
                                        <span className="text-amber-500/60 font-bold">건</span>
                                    </div>
                                    <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500">
                                        <ArrowUpRight size={24} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Filter & Action Bar */}
                        <div className="bg-slate-850/50 backdrop-blur-sm p-5 rounded-3xl border border-slate-800 mb-8 flex flex-wrap gap-4 items-center shadow-lg">
                            {/* 검색어 */}
                            <div className="relative flex-[2] min-w-[200px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="과제명을 입력하세요..."
                                    className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm placeholder:text-slate-600 text-slate-200"
                                    value={inputSearch}
                                    onChange={(e) => setInputSearch(e.target.value)}
                                />
                            </div>

                            {/* 카테고리 필터 */}
                            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 rounded-2xl px-4 py-3 flex-1 min-w-[150px] group focus-within:border-blue-500/50 transition-all">
                                <Tag size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                                <select
                                    className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer w-full text-slate-300"
                                    value={inputCategory}
                                    onChange={(e) => setInputCategory(e.target.value)}
                                >
                                    {categories.map(c => (
                                        <option key={c} value={c} className="bg-slate-900">{c === 'All' ? '전체 카테고리' : c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 담당자 필터 */}
                            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 rounded-2xl px-4 py-3 flex-1 min-w-[150px] group focus-within:border-blue-500/50 transition-all">
                                <Users size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                                <select
                                    className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer w-full text-slate-300"
                                    value={inputAssignee}
                                    onChange={(e) => setInputAssignee(e.target.value)}
                                >
                                    {assignees.map(name => (
                                        <option key={name} value={name} className="bg-slate-900">{name === 'All' ? '전체 담당자' : name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 상태 필터 */}
                            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 rounded-2xl px-4 py-3 flex-1 min-w-[150px] group focus-within:border-blue-500/50 transition-all">
                                <Filter size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                                <select
                                    className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer w-full text-slate-300"
                                    value={inputStatus}
                                    onChange={(e) => setInputStatus(e.target.value)}
                                >
                                    {statuses.map(s => (
                                        <option key={s.value} value={s.value} className="bg-slate-900">{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 마감달 필터 */}
                            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 rounded-2xl px-4 py-3 flex-1 min-w-[150px] group focus-within:border-blue-500/50 transition-all">
                                <Calendar size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                                <select
                                    className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer w-full text-slate-300"
                                    value={inputMonth}
                                    onChange={(e) => setInputMonth(e.target.value)}
                                >
                                    {months.map(m => (
                                        <option key={m} value={m} className="bg-slate-900">{m === 'All' ? '전체 마감월' : m}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 조회 버튼 */}
                            <button
                                onClick={handleInquiry}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-2xl shadow-[0_5px_20px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Search size={18} />
                                조회
                            </button>
                        </div>

                        {/* Task Grid Table */}
                        <div className="bg-slate-850/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-800/40 border-b border-slate-700/50">
                                        <th className="px-8 py-6 text-slate-400 text-[10px] font-black uppercase tracking-widest text-center w-20">상태</th>
                                        <th className="px-6 py-6 text-slate-400 text-[10px] font-black uppercase tracking-widest text-center w-32">완료일</th>
                                        <th className="px-8 py-6 text-slate-400 text-[10px] font-black uppercase tracking-widest">정산 과제</th>
                                        <th className="px-6 py-6 text-slate-400 text-[10px] font-black uppercase tracking-widest">카테고리</th>
                                        <th className="px-6 py-6 text-slate-400 text-[10px] font-black uppercase tracking-widest">담당자</th>
                                        <th className="px-8 py-6 text-slate-400 text-[10px] font-black uppercase tracking-widest text-right">마감일정</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-32 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                                    <p className="text-sm font-bold uppercase tracking-widest text-slate-500">데이터를 불러오는 중입니다...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredTasks.length > 0 ? filteredTasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-slate-800/20 transition-all duration-300 group">
                                            <td className="px-8 py-6 text-center">
                                                <div className={`mx-auto w-7 h-7 flex items-center justify-center rounded-full ${task.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-slate-700/30 text-slate-600 group-hover:text-slate-400'} transition-all`}>
                                                    {task.status === 'completed' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <span className="text-sm font-mono text-slate-500 tabular-nums">
                                                    {task.completedDate || '-'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <button
                                                    onClick={() => setModalTask(task)}
                                                    className={`text-base font-bold text-left hover:text-blue-400 transition-colors focus:outline-none ${task.status === 'completed' ? 'text-slate-500 line-through opacity-70' : 'text-slate-100 underline decoration-blue-500/30 underline-offset-4'}`}
                                                >
                                                    {task.title}
                                                </button>
                                                <p className="text-[10px] text-slate-600 mt-1 font-bold group-hover:text-slate-500 transition-colors uppercase">Click to change status</p>
                                            </td>
                                            <td className="px-6 py-6 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-blue-500/40 rounded-full"></span>
                                                    <span className="text-sm text-slate-300">{task.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-blue-400 shadow-lg">
                                                        {task.assignee.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-300">{task.assignee}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className={`text-sm font-black tracking-tight ${new Date(task.dueDate) < new Date('2026-02-01') ? 'text-amber-500' : 'text-slate-400'}`}>
                                                    {task.dueDate}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-32 text-center">
                                                <div className="flex flex-col items-center opacity-30">
                                                    <Search size={48} className="mb-4" />
                                                    <p className="text-sm font-bold uppercase tracking-widest text-slate-500">일치하는 정산 과제가 없습니다</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : currentView === 'team' ? (
                    <TeamManagement />
                ) : (
                    <SettlementSchedule />
                )}
            </main>

            {/* Status Change Modal */}
            {modalTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/60 transition-opacity">
                    <div className="bg-[#1e293b] w-full max-w-md rounded-[2rem] border border-slate-700 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500">
                                    <Filter size={24} />
                                </div>
                                <button
                                    onClick={() => setModalTask(null)}
                                    className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <h3 className="text-xl font-black text-white mb-2 tracking-tight">상태 및 정보 수정</h3>
                            <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">
                                <span className="text-blue-400 font-bold">"{modalTask.title}"</span> 과제의 진행 상태를 변경하시겠습니까?
                            </p>

                            {/* Date Picker Section */}
                            <div className="mb-8">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">완료일 선택</label>
                                <div className="relative group">
                                    <button
                                        type="button"
                                        onClick={() => dateInputRef.current?.showPicker()}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 hover:text-blue-400 transition-colors z-10"
                                    >
                                        <Calendar size={18} />
                                    </button>
                                    <input
                                        ref={dateInputRef}
                                        type="date"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all appearance-none"
                                        value={modalDate}
                                        onChange={(e) => setModalDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setModalStatus('completed')}
                                    className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${modalStatus === 'completed' ? 'bg-green-500/10 border-green-500 text-green-500 ring-4 ring-green-500/5' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${modalStatus === 'completed' ? 'bg-green-500 text-white' : 'bg-slate-700'}`}>
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                        <span className="font-bold">과제 완료</span>
                                    </div>
                                    {modalStatus === 'completed' && <span className="text-[10px] font-black uppercase">Selected</span>}
                                </button>

                                <button
                                    onClick={() => setModalStatus('pending')}
                                    className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${modalStatus === 'pending' ? 'bg-blue-600/10 border-blue-500 text-blue-400 ring-4 ring-blue-500/5' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${modalStatus === 'pending' ? 'bg-blue-500 text-white' : 'bg-slate-700'}`}>
                                            <Activity size={12} strokeWidth={3} />
                                        </div>
                                        <span className="font-bold">진행 대기</span>
                                    </div>
                                    {modalStatus === 'pending' && <span className="text-[10px] font-black uppercase">Selected</span>}
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 p-6 flex gap-3">
                            <button
                                onClick={() => setModalTask(null)}
                                className="flex-1 py-4 text-slate-400 border border-slate-700 rounded-2xl font-bold hover:bg-slate-800 hover:text-white transition-all active:scale-95"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => updateStatus(modalTask.id, modalStatus)}
                                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
