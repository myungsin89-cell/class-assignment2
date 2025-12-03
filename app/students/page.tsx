'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Student {
    id?: number;
    name: string;
    gender: 'M' | 'F';
    is_problem_student: boolean;
    group_name: string;
}

interface ClassData {
    id: number;
    grade: number;
    section_count: number;
}

export default function StudentsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const classId = searchParams.get('classId');
    const currentSection = parseInt(searchParams.get('section') || '1');

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [classData, setClassData] = useState<ClassData | null>(null);

    useEffect(() => {
        if (!classId) return;
        loadClassData();
    }, [classId]);

    useEffect(() => {
        if (!classId || !currentSection) return;
        loadStudents();
    }, [classId, currentSection]);

    const loadClassData = async () => {
        try {
            const response = await fetch(`/api/classes/${classId}`);
            const data = await response.json();
            setClassData(data);
        } catch (error) {
            console.error('Error loading class data:', error);
        }
    };

    const loadStudents = async () => {
        try {
            const response = await fetch(`/api/students?classId=${classId}&section=${currentSection}`);
            const data = await response.json();
            if (data.length > 0) {
                setStudents(data.map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    gender: s.gender,
                    is_problem_student: Boolean(s.is_problem_student),
                    group_name: s.group_name || '',
                })));
            } else {
                setStudents([createEmptyStudent()]);
            }
        } catch (error) {
            console.error('Error loading students:', error);
            setStudents([createEmptyStudent()]);
        }
    };

    const createEmptyStudent = (): Student => ({
        name: '',
        gender: 'M',
        is_problem_student: false,
        group_name: '',
    });

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const rows = pastedData.split('\n').filter(row => row.trim());

        const newStudents: Student[] = rows.map(row => {
            const cols = row.split('\t');
            return {
                name: cols[0] || '',
                gender: (cols[1]?.toUpperCase() === 'F' || cols[1] === '여') ? 'F' : 'M',
                is_problem_student: cols[2]?.toLowerCase() === 'true' || cols[2] === '1' || cols[2] === '문제',
                group_name: cols[3] || '',
            };
        });

        setStudents(newStudents);
    };

    const addRow = () => {
        setStudents([...students, createEmptyStudent()]);
    };

    const removeRow = (index: number) => {
        setStudents(students.filter((_, i) => i !== index));
    };

    const updateStudent = (index: number, field: keyof Student, value: any) => {
        const updated = [...students];
        updated[index] = { ...updated[index], [field]: value };
        setStudents(updated);
    };

    const handleSave = async () => {
        const validStudents = students.filter(s => s.name.trim());

        if (validStudents.length === 0) {
            alert('최소 한 명의 학생 정보를 입력해주세요.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classId,
                    section: currentSection,
                    students: validStudents,
                }),
            });

            if (!response.ok) throw new Error('Failed to save students');

            alert('학생 정보가 저장되었습니다!');
            loadStudents();
        } catch (error) {
            console.error('Error:', error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const navigateToSection = (section: number) => {
        router.push(`/students?classId=${classId}&section=${section}`);
    };

    if (!classId) {
        return (
            <div className="container">
                <div className="card">
                    <p>잘못된 접근입니다. 메인 페이지에서 학년과 반 수를 먼저 입력해주세요.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <h3>{classData?.grade}학년</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>반 목록</p>
                </div>
                <div className="sidebar-sections">
                    {classData && [...Array(classData.section_count)].map((_, i) => (
                        <button
                            key={i}
                            className={`section-btn ${currentSection === i + 1 ? 'active' : ''}`}
                            onClick={() => navigateToSection(i + 1)}
                        >
                            <span className="section-number">{i + 1}</span>
                            <span className="section-label">반</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content fade-in">
                <div className="container">
                    <div className="card">
                        <h1>{classData?.grade}학년 {currentSection}반 학생 정보</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            엑셀에서 복사 후 표에 붙여넣기(Ctrl+V) 하거나, 직접 입력할 수 있습니다.
                            <br />
                            <small>엑셀 형식: 이름 | 성별(남/여 또는 M/F) | 문제아(true/false) | 그룹</small>
                        </p>

                        <div className="table-container" onPaste={handlePaste}>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '30px' }}>#</th>
                                        <th>이름</th>
                                        <th style={{ width: '120px' }}>성별</th>
                                        <th style={{ width: '120px' }}>문제아</th>
                                        <th style={{ width: '150px' }}>그룹</th>
                                        <th style={{ width: '100px' }}>작업</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={student.name}
                                                    onChange={(e) => updateStudent(index, 'name', e.target.value)}
                                                    placeholder="학생 이름"
                                                    style={{ margin: 0 }}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    className="form-select"
                                                    value={student.gender}
                                                    onChange={(e) => updateStudent(index, 'gender', e.target.value)}
                                                    style={{ margin: 0 }}
                                                >
                                                    <option value="M">남</option>
                                                    <option value="F">여</option>
                                                </select>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={student.is_problem_student}
                                                    onChange={(e) => updateStudent(index, 'is_problem_student', e.target.checked)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={student.group_name}
                                                    onChange={(e) => updateStudent(index, 'group_name', e.target.value)}
                                                    placeholder="그룹"
                                                    style={{ margin: 0 }}
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => removeRow(index)}
                                                    style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                                                >
                                                    삭제
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={addRow}>
                                + 행 추가
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={handleSave}
                                disabled={loading}
                                style={{ marginLeft: 'auto' }}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading"></span>
                                        <span>저장 중...</span>
                                    </>
                                ) : (
                                    '저장'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
