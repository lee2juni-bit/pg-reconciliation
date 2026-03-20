import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Edit2,
    Trash2,
    Plus,
    ChevronRight,
    X,
    Shield,
    Briefcase,
    Search
} from 'lucide-react';

const MOCK_MEMBERS = [
    { id: 1, name: '이상준', email: 'sj.lee@company.com', role: 'admin', part: '정산1팀' },
    { id: 2, name: '이정희', email: 'jh.lee@company.com', role: 'member', part: '정산1팀' },
    { id: 3, name: '박지민', email: 'jm.park@company.com', role: 'member', part: '운영지원' },
    { id: 4, name: '김철수', email: 'cs.kim@company.com', role: 'member', part: '정산2팀' },
];

const MOCK_TASKS = [
    { id: 101, memberId: 1, title: '1월 정산 기초 자료 검토', category: '기초자료' },
    { id: 102, memberId: 1, title: '외부 파트너사 세금계산서 발행', category: '세무' },
    { id: 103, memberId: 2, title: '원가 정산 데이터 확정', category: '데이터확정' },
];

import { supabase } from '../lib/supabase';

function TeamManagement() {
    const [members, setMembers] = useState(MOCK_MEMBERS);
    const [tasks, setTasks] = useState(MOCK_TASKS);
    const [templates, setTemplates] = useState([]); // 과제 템플릿
    const [selectedMember, setSelectedMember] = useState(null);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    // Member Form State
    const [memberForm, setMemberForm] = useState({ name: '', email: '', role: 'member', part: '' });

    // Task Assignment Modal State
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        const { data, error } = await supabase.from('task_templates').select('*');
        if (!error && data) {
            setTemplates(data);
        } else {
            // Fallback mock tasks with schedule info
            setTemplates([
                { id: 1, title: '기초 자료 검토', category: '데이터검증', schedule_type: 'monthly', schedule_value: '5' },
                { id: 2, title: '세금계산서 발행', category: '세무', schedule_type: 'monthly', schedule_value: '10' },
                { id: 3, title: '파트너사 정산금 확정', category: '정산확정', schedule_type: 'weekly', schedule_value: '5' }
            ]);
        }
    };

    // --- Member CRUD ---
    const handleMemberSave = () => {
        if (editingMember) {
            setMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...memberForm } : m));
        } else {
            const newMember = { ...memberForm, id: Date.now() };
            setMembers(prev => [...prev, newMember]);
        }
        setShowMemberModal(false);
        setEditingMember(null);
        setMemberForm({ name: '', email: '', role: 'member', part: '' });
    };

    const handleMemberDelete = (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            setMembers(prev => prev.filter(m => m.id !== id));
            if (selectedMember?.id === id) setSelectedMember(null);
        }
    };

    const openMemberModal = (member = null) => {
        if (member) {
            setEditingMember(member);
            setMemberForm({ name: member.name, email: member.email, role: member.role, part: member.part });
        } else {
            setEditingMember(null);
            setMemberForm({ name: '', email: '', role: 'member', part: '' });
        }
        setShowMemberModal(true);
    };

    // --- Task Assignment ---
    const handleTaskAssignment = async () => {
        if (!selectedMember || !selectedTemplateId) return;

        const template = templates.find(t => t.id.toString() === selectedTemplateId.toString());
        if (!template) return;

        const newTask = {
            id: Date.now(),
            memberId: selectedMember.id,
            title: template.title,
            category: template.category,
            dueDate: template.schedule_type ? `${template.schedule_type === 'monthly' ? '매월' : '매주'} ${template.schedule_value}` : '일정 확인 필요'
        };

        // UI 즉시 반영
        setTasks(prev => [...prev, newTask]);

        // Supabase 연동 (기존 settlement_tasks 테이블에 할당)
        const { error } = await supabase
            .from('settlement_tasks')
            .insert([{
                title: template.title,
                category: template.category,
                assignee: selectedMember.name,
                status: 'pending',
                due_date: template.schedule_type ? `${template.schedule_type === 'monthly' ? '매월' : '매주'} ${template.schedule_value}` : null
            }]);

        if (error) console.error('Error assigning task:', error);

        setShowTaskModal(false);
        setSelectedTemplateId('');
    };

    const handleTaskDelete = (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const memberTasks = selectedMember ? tasks.filter(t => t.memberId === selectedMember.id) : [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">팀원 및 과제 할당 관리</h2>
                    <p className="text-slate-400 mt-2 text-sm flex items-center gap-2">
                        <Users size={16} className="text-blue-500" />
                        조직 내 정산 담당자들을 관리하고 등록된 과제를 할당합니다.
                    </p>
                </div>
                <button
                    onClick={() => openMemberModal()}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                    <UserPlus size={18} />
                    새 팀원 추가
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Member List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-slate-850/40 backdrop-blur-md rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-800/40 border-b border-slate-700/50">
                                    <th className="px-8 py-5 text-slate-400 text-[10px] font-black uppercase tracking-widest">팀원 정보</th>
                                    <th className="px-6 py-5 text-slate-400 text-[10px] font-black uppercase tracking-widest">소속 / 역할</th>
                                    <th className="px-8 py-5 text-slate-400 text-[10px] font-black uppercase tracking-widest text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {members.map((member) => (
                                    <tr
                                        key={member.id}
                                        onClick={() => setSelectedMember(member)}
                                        className={`cursor-pointer transition-all duration-300 group ${selectedMember?.id === member.id ? 'bg-blue-600/10' : 'hover:bg-slate-800/20'}`}
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-blue-400 shadow-lg">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-200">{member.name}</p>
                                                    <p className="text-xs text-slate-500 tracking-tight">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <span className="inline-block px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-md border border-slate-700">
                                                    {member.part}
                                                </span>
                                                <div className="flex items-center gap-1.5 ml-0.5">
                                                    <Shield size={10} className={member.role === 'admin' ? 'text-amber-500' : 'text-slate-500'} />
                                                    <span className={`text-[10px] font-black uppercase ${member.role === 'admin' ? 'text-amber-500/80' : 'text-slate-500'}`}>
                                                        {member.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openMemberModal(member); }}
                                                    className="p-2 bg-slate-800 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleMemberDelete(member.id); }}
                                                    className="p-2 bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
                                                    <ChevronRight size={16} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Task Assignment */}
                <div className="space-y-4">
                    <div className="bg-slate-850/40 backdrop-blur-md p-6 rounded-[2rem] border border-slate-800 shadow-2xl min-h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                                <Briefcase size={20} className="text-blue-500" />
                                과제 할당 리스트
                            </h3>
                            {selectedMember && (
                                <button
                                    onClick={() => setShowTaskModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95 group"
                                >
                                    <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                                    과제 할당
                                </button>
                            )}
                        </div>

                        {selectedMember ? (
                            <div className="flex-1 flex flex-col">
                                <div className="flex items-center gap-3 p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl mb-6">
                                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                                        {selectedMember.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Selected Assignee</p>
                                        <p className="text-sm font-bold text-slate-200">{selectedMember.name} 님</p>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3">
                                    {memberTasks.length > 0 ? memberTasks.map(task => (
                                        <div key={task.id} className="group bg-slate-800/20 border border-slate-800/50 p-4 rounded-2xl hover:border-slate-700 flex justify-between items-start transition-all">
                                            <div>
                                                <p className="text-sm font-bold text-slate-300 mb-1">{task.title}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                                                        {task.category}
                                                    </span>
                                                    {task.dueDate && (
                                                        <span className="text-[10px] text-blue-500/80 font-bold">{task.dueDate}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleTaskDelete(task.id)}
                                                className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-10">
                                            <Briefcase size={40} className="mb-3" />
                                            <p className="text-xs font-bold uppercase tracking-widest">할당된 과제 없음</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                                <Users size={48} className="mb-4" />
                                <p className="text-sm font-bold uppercase tracking-widest text-center">좌측 리스트에서<br />팀원을 선택해 주세요</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Member Modal */}
            {showMemberModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                    <div className="bg-[#1e293b] w-full max-w-md rounded-[2rem] border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8">
                            <h3 className="text-xl font-black text-white mb-6 tracking-tight">팀원 {editingMember ? '수정' : '추가'}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">이름</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-all"
                                        value={memberForm.name}
                                        onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">이메일</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-all"
                                        value={memberForm.email}
                                        onChange={e => setMemberForm({ ...memberForm, email: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">역할</label>
                                        <select
                                            className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                            value={memberForm.role}
                                            onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}
                                        >
                                            <option value="member">Member</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">파트</label>
                                        <input
                                            className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-all"
                                            placeholder="예: 정산1팀"
                                            value={memberForm.part}
                                            onChange={e => setMemberForm({ ...memberForm, part: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 p-6 flex gap-3">
                            <button
                                onClick={() => setShowMemberModal(false)}
                                className="flex-1 py-4 text-slate-400 border border-slate-700 rounded-2xl font-bold hover:bg-slate-800 hover:text-white transition-all shadow-inner"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleMemberSave}
                                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Assignment Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                    <div className="bg-[#1e293b] w-full max-w-lg rounded-[2.5rem] border border-slate-700 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-10">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">정산 과제 할당</h3>
                                    <p className="text-slate-400 text-sm mt-1">담당자에게 표준 과제를 배정합니다.</p>
                                </div>
                                <button onClick={() => setShowTaskModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-800 text-slate-500 hover:text-white rounded-full transition-all border border-slate-700">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div className="p-5 bg-gradient-to-r from-blue-600/10 to-transparent border border-blue-500/20 rounded-[1.5rem] flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-500/30">
                                        {selectedMember?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1.5">Assign To</p>
                                        <p className="text-base font-bold text-slate-100">{selectedMember?.name} 님</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">과제 카테고리 필터</label>
                                        <div className="flex gap-2">
                                            {['전체', ...new Set(templates.map(t => t.category))].map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => { setSelectedCategory(cat); setSelectedTemplateId(''); }}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${selectedCategory === cat ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">할당 과제 선택</label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-4 pr-12 text-white font-bold focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer backdrop-blur-sm"
                                                value={selectedTemplateId}
                                                onChange={e => setSelectedTemplateId(e.target.value)}
                                            >
                                                <option value="" className="bg-slate-900">과제를 선택하세요</option>
                                                {templates
                                                    .filter(t => selectedCategory === '전체' || t.category === selectedCategory)
                                                    .map(t => (
                                                        <option key={t.id} value={t.id} className="bg-slate-900 font-bold py-2">
                                                            [{t.category}] {t.title}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                                <ChevronRight size={18} className="rotate-90" />
                                            </div>
                                        </div>
                                        {templates.filter(t => selectedCategory === '전체' || t.category === selectedCategory).length === 0 && (
                                            <p className="text-[10px] text-amber-500/80 mt-2 px-1">해당 카테고리에 등록된 과제가 없습니다.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/30 backdrop-blur-md p-8 flex gap-4 border-t border-slate-700/50">
                            <button
                                onClick={() => setShowTaskModal(false)}
                                className="flex-1 py-4 text-slate-400 border border-slate-700 rounded-2xl font-bold hover:bg-slate-800 hover:text-white transition-all shadow-inner"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleTaskAssignment}
                                disabled={!selectedTemplateId}
                                className={`flex-1 py-4 text-white rounded-2xl font-bold transition-all ${selectedTemplateId ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-[0.98]' : 'bg-slate-700 cursor-not-allowed opacity-50'}`}
                            >
                                할당 확정하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeamManagement;
