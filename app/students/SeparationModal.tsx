'use client';

import { useState, useEffect } from 'react';

interface Student {
    id?: number;
    name: string;
    gender: 'M' | 'F';
    birth_date?: string;
    contact?: string;
    notes?: string;
    is_problem_student: boolean;
    is_special_class: boolean;
    is_underachiever: boolean;
    group_name: string;
    rank: number | null;
    previous_section?: number | null;
}

interface Group {
    id: string;
    name: string;
    students: Student[];
}

interface SeparationModalProps {
    students: Student[];
    onClose: () => void;
    onSave: (updatedStudents: Student[]) => void;
}

export default function SeparationModal({ students, onClose, onSave }: SeparationModalProps) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editingGroupName, setEditingGroupName] = useState('');

    useEffect(() => {
        // 기존 그룹 로드 (group_name 기준)
        const groupMap = new Map<string, Student[]>();

        students.forEach(student => {
            if (student.group_name && student.group_name.trim()) {
                if (!groupMap.has(student.group_name)) {
                    groupMap.set(student.group_name, []);
                }
                groupMap.get(student.group_name)!.push(student);
            }
        });

        const loadedGroups: Group[] = Array.from(groupMap.entries()).map(([name, students], index) => ({
            id: `group-${index}`,
            name,
            students,
        }));

        setGroups(loadedGroups);
    }, [students]);

    const handleStudentToggle = (index: number) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedStudents(newSelected);
    };

    const handleCreateGroup = () => {
        if (selectedStudents.size === 0) {
            alert('최소 한 명의 학생을 선택해주세요.');
            return;
        }

        if (selectedStudents.size === 1) {
            alert('그룹은 최소 2명 이상이어야 합니다.');
            return;
        }

        // 다음 그룹 번호 찾기
        const existingGroupNumbers = groups
            .map(g => {
                const match = g.name.match(/그룹(\d+)/);
                return match ? parseInt(match[1]) : 0;
            })
            .filter(n => n > 0);

        const nextGroupNumber = existingGroupNumbers.length > 0
            ? Math.max(...existingGroupNumbers) + 1
            : 1;

        const groupName = `그룹${nextGroupNumber}`;

        const selectedStudentList = Array.from(selectedStudents)
            .map(index => students[index])
            .filter(s => s);

        const newGroup: Group = {
            id: `group-${Date.now()}`,
            name: groupName,
            students: selectedStudentList,
        };

        setGroups([...groups, newGroup]);
        setSelectedStudents(new Set());
    };

    const handleDeleteGroup = (groupId: string) => {
        if (confirm('이 그룹을 삭제하시겠습니까?')) {
            setGroups(groups.filter(g => g.id !== groupId));
        }
    };

    const handleRenameGroup = (groupId: string) => {
        const group = groups.find(g => g.id === groupId);
        if (!group) return;

        setEditingGroupId(groupId);
        setEditingGroupName(group.name);
    };

    const handleSaveRename = () => {
        if (!editingGroupId || !editingGroupName.trim()) {
            setEditingGroupId(null);
            return;
        }

        setGroups(groups.map(g =>
            g.id === editingGroupId
                ? { ...g, name: editingGroupName.trim() }
                : g
        ));
        setEditingGroupId(null);
        setEditingGroupName('');
    };

    const handleRemoveStudentFromGroup = (groupId: string, studentToRemove: Student) => {
        setGroups(groups.map(g => {
            if (g.id === groupId) {
                const updatedStudents = g.students.filter(s => s !== studentToRemove);

                // 그룹에 학생이 1명 이하로 남으면 그룹 삭제
                if (updatedStudents.length < 2) {
                    return null;
                }

                return { ...g, students: updatedStudents };
            }
            return g;
        }).filter(g => g !== null) as Group[]);
    };

    const handleSave = () => {
        // 학생 데이터 업데이트
        const updatedStudents = students.map(student => {
            // 모든 그룹에서 이 학생을 찾아서 그룹명 할당
            const group = groups.find(g => g.students.some(s => s === student));

            return {
                ...student,
                group_name: group ? group.name : '',
            };
        });

        onSave(updatedStudents);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '2rem'
        }}
            onClick={onClose}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '900px',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: '2rem'
            }}
                onClick={(e) => e.stopPropagation()}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h2 style={{ margin: 0 }}>분리 대상 설정</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            color: '#666'
                        }}
                    >
                        ×
                    </button>
                </div>

                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                    같은 반에 배치되지 않아야 할 학생들을 그룹으로 묶어주세요.
                </p>

                {/* 그룹 목록 */}
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>분리 그룹 목록</h3>

                    {groups.length === 0 ? (
                        <div style={{
                            background: '#f8f9fa',
                            padding: '2rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            color: '#999'
                        }}>
                            아직 생성된 그룹이 없습니다. 아래에서 학생을 선택하여 그룹을 만들어보세요.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {groups.map(group => (
                                <div key={group.id} style={{
                                    background: '#f8f9fa',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {editingGroupId === group.id ? (
                                            <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={editingGroupName}
                                                    onChange={(e) => setEditingGroupName(e.target.value)}
                                                    style={{ flex: 1, margin: 0 }}
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveRename();
                                                        if (e.key === 'Escape') setEditingGroupId(null);
                                                    }}
                                                />
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={handleSaveRename}
                                                    style={{ padding: '0.5rem 1rem' }}
                                                >
                                                    저장
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => setEditingGroupId(null)}
                                                    style={{ padding: '0.5rem 1rem' }}
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <h4 style={{ margin: 0, color: '#007bff' }}>{group.name}</h4>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleRenameGroup(group.id)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontSize: '1.2rem',
                                                            color: '#666',
                                                            padding: '0.25rem 0.5rem'
                                                        }}
                                                        title="그룹명 수정"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteGroup(group.id)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontSize: '1.2rem',
                                                            color: '#dc3545',
                                                            padding: '0.25rem 0.5rem'
                                                        }}
                                                        title="그룹 삭제"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {group.students.map((student, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    background: student.gender === 'M' ? '#e3f2fd' : '#fce4ec',
                                                    color: student.gender === 'M' ? '#007bff' : '#e91e63',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '8px',
                                                    fontWeight: 'bold',
                                                    border: `2px solid ${student.gender === 'M' ? '#007bff' : '#e91e63'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                {student.name}
                                                <button
                                                    onClick={() => handleRemoveStudentFromGroup(group.id, student)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: 'inherit',
                                                        fontSize: '1rem',
                                                        padding: 0,
                                                        marginLeft: '0.25rem'
                                                    }}
                                                    title="그룹에서 제거"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 학생 선택 영역 */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>학생 선택</h3>
                    <div style={{
                        background: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem'
                    }}>
                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#666' }}>
                            분리할 학생들을 선택한 후 "그룹 추가" 버튼을 클릭하세요.
                        </p>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: '0.5rem',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            padding: '0.5rem'
                        }}>
                            {students.map((student, index) => (
                                <label
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem',
                                        background: selectedStudents.has(index) ? '#e3f2fd' : 'white',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        border: selectedStudents.has(index) ? '2px solid #007bff' : '2px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedStudents.has(index)}
                                        onChange={() => handleStudentToggle(index)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{
                                        fontSize: '0.9rem',
                                        color: student.gender === 'M' ? '#007bff' : '#e91e63'
                                    }}>
                                        {student.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleCreateGroup}
                        disabled={selectedStudents.size < 2}
                        style={{
                            opacity: selectedStudents.size < 2 ? 0.5 : 1,
                            cursor: selectedStudents.size < 2 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        + 그룹 추가 ({selectedStudents.size}명 선택됨)
                    </button>
                </div>

                {/* 저장 버튼 */}
                <div style={{
                    marginTop: '2rem',
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end',
                    paddingTop: '1rem',
                    borderTop: '2px solid #e0e0e0'
                }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        취소
                    </button>
                    <button
                        className="btn btn-success"
                        onClick={handleSave}
                    >
                        적용
                    </button>
                </div>
            </div>
        </div>
    );
}
