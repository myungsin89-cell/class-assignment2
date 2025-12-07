'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ChartBarIcon,
    UserGroupIcon,
    ClipboardDocumentCheckIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

interface ClassData {
    id: number;
    grade: number;
    section_count: number;
    section_statuses?: string;
    is_distributed?: number;
    parent_class_id?: number;
    child_class_id?: number;
}

interface SectionStatus {
    [key: string]: 'completed' | 'in_progress';
}

export default function ClassSectionsPage() {
    const router = useRouter();
    const params = useParams();
    const classId = params.id as string;

    const [classData, setClassData] = useState<ClassData | null>(null);
    const [sectionStatuses, setSectionStatuses] = useState<SectionStatus>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClassData();
    }, [classId]);

    const loadClassData = async () => {
        try {
            const response = await fetch(`/api/classes/${classId}`);
            const data = await response.json();
            setClassData(data);

            // section_statuses 파싱
            try {
                const statuses = JSON.parse(data.section_statuses || '{}');
                setSectionStatuses(statuses);
            } catch (e) {
                setSectionStatuses({});
            }
        } catch (error) {
            console.error('Error loading class data:', error);
            alert('학급 정보를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSectionClick = (section: number) => {
        router.push(`/students?classId=${classId}&section=${section}`);
    };

    const getSectionStatus = (section: number): 'completed' | 'in_progress' => {
        return sectionStatuses[section.toString()] || 'in_progress';
    };

    if (loading) {
        return (
            <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading"></div>
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="container" style={{ minHeight: '100vh', padding: '2rem' }}>
                <div className="card">
                    <p>학급 정보를 찾을 수 없습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="container">
                {/* 헤더 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '3rem'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary-light)' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>학급 관리</span>
                            <span>/</span>
                            <span style={{ fontSize: '0.9rem' }}>{classData.grade}학년</span>
                        </div>
                        <h1 style={{ margin: 0 }}>{classData.grade}학년 반배정 대시보드</h1>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="btn btn-secondary"
                    >
                        🏠 홈으로
                    </button>
                </div>

                {/* 진행상황 Stepper */}
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
                    {/* 1단계 */}
                    <div className="stat-card" style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute', top: '1.5rem', right: '1.5rem',
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'white', color: '#3b82f6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem', fontWeight: 'bold',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>1</div>

                        <div className="stat-icon" style={{ background: '#3b82f6', color: 'white', marginBottom: '1rem' }}>
                            📝
                        </div>

                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>학생 정보 입력</h3>

                        <div style={{ width: '100%', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>진행률</span>
                                <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>
                                    {Object.values(sectionStatuses).filter(s => s === 'completed').length} / {classData.section_count} 완료
                                </span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${(Object.values(sectionStatuses).filter(s => s === 'completed').length / classData.section_count) * 100}%`,
                                    height: '100%',
                                    background: '#3b82f6',
                                    transition: 'width 0.5s ease'
                                }}></div>
                            </div>
                        </div>

                        <button
                            className="btn"
                            disabled={Object.values(sectionStatuses).filter(s => s === 'completed').length < classData.section_count}
                            onClick={() => {
                                if (Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count) {
                                    alert('모든 반의 입력이 완료되었습니다! 다음 단계[조건 설정]로 이동합니다. (준비중)');
                                    // TODO: 다음 단계 라우팅 구현
                                }
                            }}
                            style={{
                                width: '100%',
                                background: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count
                                    ? '#3b82f6'
                                    : '#e2e8f0',
                                color: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count
                                    ? 'white'
                                    : '#94a3b8',
                                border: 'none',
                                padding: '0.5rem',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                borderRadius: '6px',
                                marginTop: 'auto',
                                cursor: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count
                                    ? 'pointer'
                                    : 'not-allowed'
                            }}
                        >
                            {Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count ? '다음 단계로 이동 ▶' : '진행 중...'}
                        </button>
                    </div>

                    {/* 2단계 */}
                    <div className="stat-card" style={{
                        background: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)'
                            : 'rgba(30, 41, 59, 0.4)',
                        border: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count
                            ? '1px solid rgba(16, 185, 129, 0.3)'
                            : '1px solid var(--border)',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        opacity: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count ? 1 : 0.7,
                        position: 'relative',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{
                            position: 'absolute', top: '1.5rem', right: '1.5rem',
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count
                                ? 'white'
                                : 'rgba(255,255,255,0.1)',
                            color: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count
                                ? '#10b981'
                                : 'rgba(255,255,255,0.8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem', fontWeight: 'bold',
                            border: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count
                                ? 'none'
                                : '1px solid rgba(255,255,255,0.2)',
                            boxShadow: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count
                                ? '0 4px 6px rgba(0,0,0,0.1)'
                                : 'none'
                        }}>2</div>
                        <div className="stat-icon" style={{
                            background: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count
                                ? '#10b981'
                                : 'var(--bg-tertiary)',
                            color: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count
                                ? 'white'
                                : 'var(--text-muted)',
                            marginBottom: '1rem'
                        }}>
                            ⚙️
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count ? 'var(--text-primary)' : 'var(--text-muted)' }}>조건 설정</h3>
                        <p style={{ margin: 0, color: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count ? 'var(--text-secondary)' : 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            분리 학생 지정 및<br />우선순위 조정
                        </p>

                        <button
                            className="btn"
                            disabled={Object.values(sectionStatuses).filter(s => s === 'completed').length < classData.section_count}
                            onClick={() => alert('조건 설정 페이지로 이동합니다. (준비중)')}
                            style={{
                                width: '100%',
                                background: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count ? '#10b981' : 'transparent',
                                color: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count ? 'white' : 'transparent',
                                border: 'none',
                                padding: '0.5rem',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                borderRadius: '6px',
                                marginTop: 'auto',
                                cursor: Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count ? 'pointer' : 'default',
                                height: '36px'
                            }}
                        >
                            {Object.values(sectionStatuses).filter(s => s === 'completed').length === classData.section_count ? '설정 시작하기' : ''}
                        </button>
                    </div>

                    {/* 3단계 */}
                    <div className="stat-card" style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        border: '1px solid var(--border)',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        opacity: 0.5 // 3단계는 아직 비활성화 (2단계 완료 후 활성화 예정)
                    }}>
                        <div style={{
                            position: 'absolute', top: '1.5rem', right: '1.5rem',
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem', fontWeight: 'bold',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>3</div>
                        <div className="stat-icon" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            🎯
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: 'var(--text-muted)' }}>반편성 결과</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            알고리즘 배정 결과 확인<br />및 수동 조정
                        </p>
                    </div>
                </div>

                {/* 반 목록 Grid */}
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={{ margin: 0 }}>📂 학급 목록</h2>
                    <span className="badge badge-group">{classData.section_count}개 학급</span>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {[...Array(classData.section_count)].map((_, i) => {
                        const section = i + 1;
                        const status = getSectionStatus(section);
                        const isCompleted = status === 'completed';

                        return (
                            <div
                                key={section}
                                onClick={() => handleSectionClick(section)}
                                className="stat-card"
                                style={{
                                    cursor: 'pointer',
                                    flexDirection: 'column',
                                    alignItems: 'stretch',
                                    padding: '0',
                                    overflow: 'hidden',
                                    background: isCompleted
                                        ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.05) 0%, rgba(30, 41, 59, 0.6) 100%)'
                                        : 'rgba(30, 41, 59, 0.6)',
                                    borderColor: isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'
                                }}
                            >
                                <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{
                                            marginBottom: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <span style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                background: isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                                color: isCompleted ? '#34d399' : '#818cf8',
                                                fontWeight: 'bold'
                                            }}>
                                                {section}
                                            </span>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{section}반</span>
                                        </div>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {classData.grade}학년
                                        </p>
                                    </div>

                                    {isCompleted ? (
                                        <span className="badge badge-special">작성완료</span>
                                    ) : (
                                        <span className="badge badge-group" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                                            작성중
                                        </span>
                                    )}
                                </div>

                                <div style={{
                                    padding: '1rem 1.5rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderTop: '1px solid var(--border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    <span>학생 명단 관리</span>
                                    <span>바로가기 →</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
