import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Plus,
    Edit2,
    Trash2,
    Tag,
    Clock,
    LayoutList,
    AlertCircle,
    CheckCircle2,
    X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

function SettlementSchedule() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [form, setForm] = useState({
        title: '',
        category: '',
        schedule_type: 'monthly', // 'monthly' | 'weekly'
        schedule_value: '1' // 일자(1-31) 또는 요일(0-6)
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        // 실제 운영 시에는 'task_templates' 테이블을 조회합니다.
        // 여기서는 기존 'settlement_tasks'의 카테고리와 타이틀 정보를 기반으로 유니크한 템플릿을 추출하거나, 
        // 테이블이 존재한다고 가정하고 쿼리합니다.
        const { data, error } = await supabase
            .from('task_templates')
            .select('*')
            .order('title', { ascending: true });

        if (error) {
            console.error('Error fetching templates:', error);
            // 테이블이 없을 경우를 대비한 가상 데이터
            setTemplates([
                { id: 1, title: '기초 자료 검토', category: '데이터검증', schedule_type: 'monthly', schedule_value: '5' },
                { id: 2, title: '세금계산서 발행', category: '세무', schedule_type: 'monthly', schedule_value: '10' },
                { id: 3, title: '파트너사 정산금 확정', category: '정산확정', schedule_type: 'weekly', schedule_value: '5' }
            ]);
        } else {
            setTemplates(data);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!form.title || !form.category) return;

        if (editingTemplate) {
            const { error } = await supabase
                .from('task_templates')
                .update(form)
                .eq('id', editingTemplate.id);

            if (!error) {
                setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...form } : t));
            }
        } else {
            const { data, error } = await supabase
                .from('task_templates')
                .insert([form])
                .select();

            if (!error && data) {
                setTemplates(prev => [...prev, data[0]]);
            } else {
                // 실습용 로컬 반영
                setTemplates(prev => [...prev, { ...form, id: Date.now() }]);
            }
        }
        closeModal();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('이 과제를 삭제하시겠습니까? 관련 할당 내역에도 영향을 줄 수 있습니다.')) return;

        const { error } = await supabase
            .from('task_templates')
            .delete()
            .eq('id', id);

        if (!error) {
            setTemplates(prev => prev.filter(t => t.id !== id));
        }
    };

    const openModal = (template = null) => {
        if (template) {
            setEditingTemplate(template);
            setForm({
                title: template.title,
                category: template.category,
                schedule_type: template.schedule_type || 'monthly',
                schedule_value: template.schedule_value || '1'
            });
        } else {
            setEditingTemplate(null);
            setForm({ title: '', category: '', schedule_type: 'monthly', schedule_value: '1' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTemplate(null);
        setForm({ title: '', category: '', schedule_type: 'monthly', schedule_value: '1' });
    };

    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    const weekDays = [
        { label: '일', value: '0' },
        { label: '월', value: '1' },
        { label: '화', value: '2' },
        { label: '수', value: '3' },
        { label: '목', value: '4' },
        { label: '금', value: '5' },
        { label: '토', value: '6' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">정산 일정 및 과제 관리</h2>
                    <p className="text-slate-400 mt-2 text-sm flex items-center gap-2">
                        <Calendar size={16} className="text-blue-500" />
                        표준 정산 과제 리스트와 정기 주기를 통합 관리합니다.
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus size={18} />
                    새 과제 등록
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Master Task Templates List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-slate-850/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                                <LayoutList size={20} className="text-blue-500" />
                                등록 과제 리스트
                            </h3>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                Total {templates.length}
                            </span>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-800/40 border-b border-slate-700/50">
                                <tr>
                                    <th className="px-8 py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">카테고리</th>
                                    <th className="px-8 py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">과제명</th>
                                    <th className="px-8 py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">정산 일정</th>
                                    <th className="px-8 py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center text-slate-500 text-sm italic">로딩 중...</td>
                                    </tr>
                                ) : templates.map((template) => (
                                    <tr key={template.id} className="hover:bg-slate-800/20 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <Tag size={12} className="text-blue-400" />
                                                <span className="text-xs font-bold text-slate-400 uppercase">{template.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-slate-200">{template.title}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-bold text-slate-500 uppercase">
                                                    {template.schedule_type === 'monthly' ? '매월' : '매주'}
                                                </div>
                                                <span className="text-sm font-bold text-slate-300">
                                                    {template.schedule_type === 'monthly'
                                                        ? `${template.schedule_value}일`
                                                        : `${weekDays.find(d => d.value === template.schedule_value.toString())?.label || ''}요일`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openModal(template)}
                                                    className="p-2 bg-slate-800 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(template.id)}
                                                    className="p-2 bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Card / Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/60 p-8 rounded-[2.5rem] border border-blue-500/10 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] -mr-10 -mt-10"></div>
                        <AlertCircle className="text-blue-400 mb-4" size={32} />
                        <h4 className="text-xl font-black text-white mb-2">정산 과제 활용</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            여기 등록된 과제들은 <strong>'팀 관리'</strong> 메뉴에서 담당자에게 업무를 할당할 때 기본 리스트로 제공됩니다. 정기적인 정산 업무를 표준화하여 관리하세요.
                        </p>
                    </div>

                    <div className="bg-slate-850/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Clock size={14} />
                            최근 업데이트 내역
                        </h4>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                    <p className="text-xs text-slate-400 leading-tight">
                                        새로운 정기 정산 과제가 등록되거나 수정되었습니다.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                    <div className="bg-[#1e293b] w-full max-w-md rounded-[2rem] border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8">
                            <h3 className="text-xl font-black text-white mb-6 tracking-tight">과제 {editingTemplate ? '수정' : '등록'}</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">과제명</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-all"
                                        placeholder="예: 월간 거래내역 대사"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">카테고리</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-all"
                                        placeholder="예: 세무 / 정산확정"
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                    />
                                </div>

                                {/* 정산 일정 설정 */}
                                <div className="space-y-4 pt-4 border-t border-slate-800">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">정산 일정 설정</label>

                                    <div className="flex bg-slate-950 p-1 rounded-2xl gap-1">
                                        <button
                                            onClick={() => setForm({ ...form, schedule_type: 'monthly', schedule_value: '1' })}
                                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${form.schedule_type === 'monthly' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            매월
                                        </button>
                                        <button
                                            onClick={() => setForm({ ...form, schedule_type: 'weekly', schedule_value: '1' })}
                                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${form.schedule_type === 'weekly' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            매주
                                        </button>
                                    </div>

                                    {form.schedule_type === 'monthly' ? (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-4">
                                                <span className="text-sm font-bold text-slate-400 shrink-0">매월</span>
                                                <select
                                                    className="flex-1 bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
                                                    value={form.schedule_value}
                                                    onChange={e => setForm({ ...form, schedule_value: e.target.value })}
                                                >
                                                    {days.map(d => <option key={d} value={d} className="bg-slate-900">{d}일</option>)}
                                                </select>
                                                <span className="text-sm font-bold text-slate-400">마감</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-4">
                                                <span className="text-sm font-bold text-slate-400 shrink-0">매주</span>
                                                <select
                                                    className="flex-1 bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
                                                    value={form.schedule_value}
                                                    onChange={e => setForm({ ...form, schedule_value: e.target.value })}
                                                >
                                                    {weekDays.map(wd => <option key={wd.value} value={wd.value} className="bg-slate-900">{wd.label}요일</option>)}
                                                </select>
                                                <span className="text-sm font-bold text-slate-400">마감</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 p-6 flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 py-4 text-slate-400 border border-slate-700 rounded-2xl font-bold hover:bg-slate-800 hover:text-white transition-all shadow-inner"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                            >
                                저장하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SettlementSchedule;
