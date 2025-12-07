'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import RankModal from './RankModal';
import SeparationModal from './SeparationModal';

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

interface ClassData {
    id: number;
    grade: number;
    section_count: number;
    section_statuses?: string;
    is_distributed?: number;
    parent_class_id?: number;
    child_class_id?: number;
}

export default function StudentsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const classId = searchParams.get('classId');
    const currentSection = parseInt(searchParams.get('section') || '1');

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [classData, setClassData] = useState<ClassData | null>(null);
    const [parentClassData, setParentClassData] = useState<ClassData | null>(null);
    const [childClassData, setChildClassData] = useState<ClassData | null>(null);
    const [isPasting, setIsPasting] = useState(false);
    const [showDistributeModal, setShowDistributeModal] = useState(false);
    const [newSectionCount, setNewSectionCount] = useState<number>(2);
    const [showRankModal, setShowRankModal] = useState(false);
    const [showSeparationModal, setShowSeparationModal] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'complete' | 'unmark'>('complete');

    useEffect(() => {
        if (!classId) return;
        loadClassData();
    }, [classId]);

    useEffect(() => {
        if (!classId || !currentSection) return;
        loadStudents();
    }, [classId, currentSection]);

    // 섹션 변경 시 상태 재확인 (classData가 이미 로드된 경우)
    useEffect(() => {
        if (classData && currentSection) {
            try {
                const statuses = JSON.parse(classData.section_statuses || '{}');
                setIsCompleted(statuses[currentSection] === 'completed');
            } catch (e) {
                setIsCompleted(false);
            }
        }
    }, [currentSection, classData]);

    const loadClassData = async () => {
        try {
            const response = await fetch(`/api/classes/${classId}?t=${Date.now()}`);
            const data = await response.json();

            try {
                const statuses = JSON.parse(data.section_statuses || '{}');
                setIsCompleted(statuses[currentSection] === 'completed');
            } catch (e) {
                setIsCompleted(false);
            }

            setClassData(data);

            // 현재 클래스가 child class인 경우 (반편성된 클래스)
            if (data.parent_class_id) {
                try {
                    const parentResponse = await fetch(`/api/classes/${data.parent_class_id}`);
                    if (parentResponse.ok) {
                        const parentData = await parentResponse.json();
                        setParentClassData(parentData);
                        setChildClassData(data);
                    } else {
                        // Parent class가 존재하지 않으면 일반 클래스로 처리
                        console.warn(`Parent class ${data.parent_class_id} not found, treating as normal class`);
                        setParentClassData(null);
                        setChildClassData(null);
                    }
                } catch (error) {
                    console.error('Error loading parent class:', error);
                    setParentClassData(null);
                    setChildClassData(null);
                }
            }
            // 현재 클래스가 parent class인 경우 (기존반)
            else if (data.child_class_id) {
                try {
                    const childResponse = await fetch(`/api/classes/${data.child_class_id}`);
                    if (childResponse.ok) {
                        const childData = await childResponse.json();
                        setParentClassData(data);
                        setChildClassData(childData);
                    } else {
                        // Child class가 존재하지 않으면 일반 클래스로 처리
                        console.warn(`Child class ${data.child_class_id} not found, treating as normal class`);
                        setParentClassData(null);
                        setChildClassData(null);
                    }
                } catch (error) {
                    console.error('Error loading child class:', error);
                    setParentClassData(null);
                    setChildClassData(null);
                }
            }
            // 반편성이 없는 일반 클래스
            else {
                setParentClassData(null);
                setChildClassData(null);
            }
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
                    birth_date: s.birth_date || '',
                    contact: s.contact || '',
                    notes: s.notes || '',
                    is_problem_student: Boolean(s.is_problem_student),
                    is_special_class: Boolean(s.is_special_class),
                    is_underachiever: Boolean(s.is_underachiever),
                    group_name: s.group_name || '',
                    rank: s.rank || null,
                    previous_section: s.previous_section || null,
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
        birth_date: '',
        contact: '',
        notes: '',
        is_problem_student: false, // 기본값 false
        is_special_class: false, // 기본값 false
        is_underachiever: false, // 기본값 false
        group_name: '',
        rank: null,
        previous_section: null,
    });

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        setIsPasting(true);

        const pastedData = e.clipboardData.getData('text');
        const rows = pastedData.split('\n').filter(row => row.trim());

        const newStudents: Student[] = rows.map(row => {
            const cols = row.split('\t');

            // 1. 번호 (무시)
            // 2. 성명
            const name = cols[1]?.trim() || '';

            // 3. 성별
            const genderValue = cols[2]?.trim().toUpperCase();
            let gender: 'M' | 'F' = 'M';
            if (genderValue === 'F' || cols[2]?.trim() === '여' || cols[2]?.trim() === '여자') {
                gender = 'F';
            }

            // 4. 생년월일
            const birth_date = cols[3]?.trim() || '';

            // 5. 특이사항
            const notes = cols[4]?.trim() || '';

            // 6. 연락처
            const contact = cols[5]?.trim() || '';

            return {
                name,
                gender,
                birth_date,
                notes,
                contact,
                is_problem_student: false, // 기본값 false
                is_special_class: false, // 기본값 false
                is_underachiever: false, // 기본값 false
                group_name: '',
                rank: null,
            };
        });

        setStudents(newStudents);

        setTimeout(() => setIsPasting(false), 1000);
    };

    const downloadTemplate = () => {
        const template = '이름\t성별\t문제아\t특수반\t그룹\t등수\n홍길동\t남\tfalse\tfalse\tA조\t1\n김영희\t여\tfalse\ttrue\tB조\t2\n이철수\t남\ttrue\tfalse\tA조\t3';
        const blob = new Blob([template], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${classData?.grade}학년_${currentSection}반_명렬표_템플릿.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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

    // 개별 필드 붙여넣기 핸들러
    const handleFieldPaste = (e: React.ClipboardEvent<HTMLInputElement | HTMLSelectElement>, startIndex: number, field: keyof Student) => {
        e.preventDefault();
        e.stopPropagation(); // 부모의 handlePaste 실행 방지
        const pastedData = e.clipboardData.getData('text');
        const rows = pastedData.split('\n').filter(v => v.trim());

        console.log('[붙여넣기] 필드:', field, '시작 인덱스:', startIndex);
        console.log('[붙여넣기] 데이터:', pastedData);
        console.log('[붙여넣기] 행 개수:', rows.length);

        if (rows.length === 0) return;

        const updated = [...students];

        // 필드 순서 정의
        const fieldOrder: (keyof Student)[] = ['name', 'gender', 'is_problem_student', 'is_special_class', 'group_name', 'rank'];
        const startFieldIndex = fieldOrder.indexOf(field);

        console.log('[붙여넣기] 필드 순서 인덱스:', startFieldIndex);

        if (startFieldIndex === -1) return; // 필드를 찾을 수 없음

        // 각 행 처리
        rows.forEach((row, rowIndex) => {
            const targetRowIndex = startIndex + rowIndex;
            const cols = row.split('\t');

            // 행이 부족하면 추가
            while (updated.length <= targetRowIndex) {
                updated.push(createEmptyStudent());
            }

            // 각 열 처리 (커서 위치부터 시작)
            cols.forEach((value, colIndex) => {
                const targetFieldIndex = startFieldIndex + colIndex;
                if (targetFieldIndex >= fieldOrder.length) return; // 범위 초과

                const targetField = fieldOrder[targetFieldIndex];
                const trimmedValue = value.trim();

                console.log(`[붙여넣기] 행 ${targetRowIndex}, 열 ${colIndex}: ${targetField} = "${trimmedValue}"`);

                // 필드 타입에 따라 값 변환
                if (targetField === 'rank') {
                    // 숫자가 아닌 모든 문자 제거 (공백, 특수문자 등)
                    const cleanValue = trimmedValue.replace(/\D/g, '');
                    const numValue = parseInt(cleanValue, 10);
                    updated[targetRowIndex].rank = !isNaN(numValue) && cleanValue ? numValue : null;
                } else if (targetField === 'gender') {
                    const genderValue = trimmedValue.toUpperCase();
                    if (genderValue === 'F' || trimmedValue === '여' || trimmedValue === '여자') {
                        updated[targetRowIndex].gender = 'F';
                    } else {
                        updated[targetRowIndex].gender = 'M';
                    }
                } else if (targetField === 'is_problem_student') {
                    updated[targetRowIndex].is_problem_student =
                        trimmedValue.toLowerCase() === 'true' ||
                        trimmedValue === '1' ||
                        trimmedValue === '문제';
                } else if (targetField === 'is_special_class') {
                    updated[targetRowIndex].is_special_class =
                        trimmedValue.toLowerCase() === 'true' ||
                        trimmedValue === '1' ||
                        trimmedValue === '특수';
                } else if (targetField === 'name') {
                    updated[targetRowIndex].name = trimmedValue;
                } else if (targetField === 'group_name') {
                    // 그룹 값 정규화: "1" → "그룹1", "그룹 1" → "그룹1"
                    let groupValue = trimmedValue;
                    if (/^\d+$/.test(trimmedValue)) {
                        // 숫자만 있으면 "그룹" 접두사 추가
                        groupValue = `그룹${trimmedValue}`;
                    } else if (trimmedValue) {
                        // "그룹 1" → "그룹1" (공백 제거)
                        groupValue = trimmedValue.replace(/\s/g, '');
                    }
                    // 유효한 옵션인지 확인 (그룹1~그룹10)
                    const validGroups = ['그룹1', '그룹2', '그룹3', '그룹4', '그룹5', '그룹6', '그룹7', '그룹8', '그룹9', '그룹10'];
                    updated[targetRowIndex].group_name = validGroups.includes(groupValue) ? groupValue : '';
                }
            });
        });

        setStudents(updated);
        setIsPasting(true);
        setTimeout(() => setIsPasting(false), 1000);
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

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error(errorData.error || 'Failed to save students');
            }

            const result = await response.json();
            console.log('Save successful:', result);
            alert('학생 정보가 저장되었습니다!');
            loadStudents();
        } catch (error) {
            console.error('Error:', error);
            alert(`저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setLoading(false);
        }
    };

    const navigateToSection = (section: number) => {
        router.push(`/students?classId=${classId}&section=${section}`);
    };

    const handleDistribute = async () => {
        if (!classId || !newSectionCount || newSectionCount < 2) {
            alert('반 수는 최소 2개 이상이어야 합니다.');
            return;
        }

        const schoolId = localStorage.getItem('schoolId');
        if (!schoolId) {
            alert('로그인이 필요합니다.');
            router.push('/login');
            return;
        }

        const confirmed = confirm(`현재 학급의 모든 학생을 ${newSectionCount}개 반으로 편성하시겠습니까?`);
        if (!confirmed) return;

        setLoading(true);
        setShowDistributeModal(false);

        try {
            const response = await fetch('/api/classes/distribute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classId,
                    newSectionCount,
                    schoolId: parseInt(schoolId)
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to distribute students');
            }

            const result = await response.json();
            alert(`반편성이 완료되었습니다!\n\n${result.stats.map((s: any) =>
                `${s.section}반: 총 ${s.total}명 (남 ${s.male}, 여 ${s.female}, 문제아 ${s.problem}, 특수반 ${s.special})`
            ).join('\n')}`);

            // 새로운 클래스의 1반으로 이동
            router.push(`/students?classId=${result.newClassId}&section=1`);
        } catch (error) {
            console.error('Error:', error);
            alert(`반편성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDistributedClass = async () => {
        if (!childClassData) {
            alert('삭제할 새로운반이 없습니다.');
            return;
        }

        const confirmed = confirm(
            `새로운반 전체를 삭제하시겠습니까?\n\n` +
            `삭제 대상:\n` +
            `- ${classData?.grade}학년 새로운반 (${childClassData.section_count}개 반: 1반~${childClassData.section_count}반)\n` +
            `- 모든 반의 학생 데이터\n\n` +
            `삭제 후 기존반으로 돌아가며, 이 작업은 되돌릴 수 없습니다.`
        );
        if (!confirmed) return;

        setLoading(true);

        try {
            const schoolId = localStorage.getItem('schoolId');
            const response = await fetch(`/api/classes?classId=${childClassData.id}&schoolId=${schoolId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete class');
            }

            alert(`새로운반 전체(${childClassData.section_count}개 반)가 삭제되었습니다.\n대시보드로 돌아갑니다.`);

            // 대시보드로 이동
            router.push('/dashboard');
        } catch (error) {
            console.error('Error:', error);
            alert(error instanceof Error ? error.message : '새로운반 삭제 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 통계 계산
    const stats = {
        total: students.filter(s => s.name.trim()).length,
        male: students.filter(s => s.gender === 'M' && s.name.trim()).length,
        female: students.filter(s => s.gender === 'F' && s.name.trim()).length,
        problem: students.filter(s => s.is_problem_student && s.name.trim()).length,
        special: students.filter(s => s.is_special_class && s.name.trim()).length,
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
        <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="container">
                {/* 헤더 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <h1 style={{ margin: '0 0 0.5rem 0' }}>{classData?.grade}학년 {currentSection}반 학생 정보</h1>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>학생 정보를 입력하고 석차, 분리 그룹을 설정하세요</p>
                    </div>
                    <button
                        onClick={() => router.push(`/classes/${classId}`)}
                        className="btn btn-secondary"
                    >
                        ◀ 반 목록으로
                    </button>
                </div>



                {/* 툴바 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={downloadTemplate}
                            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                            title="엑셀 템플릿 다운로드"
                        >
                            📥 예시자료
                        </button>
                        <div style={{ position: 'relative' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setIsPasting(!isPasting)}
                                style={{
                                    fontSize: '0.9rem',
                                    padding: '0.5rem 1rem',
                                    background: isPasting ? 'var(--primary-light)' : undefined,
                                    color: isPasting ? 'white' : undefined
                                }}
                                title="엑셀 데이터 붙여넣기"
                            >
                                📋 엑셀 붙여넣기
                            </button>
                            {isPasting && (
                                <div style={{
                                    position: 'absolute',
                                    top: '110%',
                                    left: 0,
                                    width: '300px',
                                    padding: '1rem',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    zIndex: 10,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                        엑셀 데이터를 복사(Ctrl+C)한 후<br />테이블을 클릭하고 붙여넣기(Ctrl+V) 하세요.
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        * 예시자료 형식을 지켜주세요.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn"
                            onClick={() => setShowRankModal(true)}
                            style={{
                                background: 'white',
                                border: '1px solid var(--primary)',
                                color: 'var(--primary)',
                                fontSize: '0.9rem',
                                padding: '0.5rem 1rem'
                            }}
                        >
                            📊 석차 지정
                        </button>

                        <button
                            className="btn"
                            onClick={() => setShowSeparationModal(true)}
                            style={{
                                background: 'white',
                                border: '1px solid var(--secondary)',
                                color: 'var(--secondary)',
                                fontSize: '0.9rem',
                                padding: '0.5rem 1rem'
                            }}
                        >
                            🔗 반 내부 분리
                        </button>
                    </div>
                </div>

                {isPasting && (
                    <div style={{
                        background: 'var(--success)',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        animation: 'fadeIn 0.3s'
                    }}>
                        ✅ 데이터가 성공적으로 붙여넣기 되었습니다!
                    </div>
                )}

                <div className="table-container" onPaste={handlePaste}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                                {!!classData?.is_distributed && (
                                    <th style={{ width: '60px', textAlign: 'center' }}>이전반</th>
                                )}
                                <th style={{ width: '100px' }}>성명</th>
                                <th style={{ width: '80px', textAlign: 'center' }}>성별</th>
                                <th style={{ width: '100px' }}>생년월일</th>
                                <th style={{ width: '150px' }}>특이사항</th>
                                <th style={{ width: '120px' }}>연락처</th>
                                <th style={{ width: '60px', textAlign: 'center', borderLeft: '2px solid var(--border)' }}>석차</th>
                                <th style={{ width: '80px', textAlign: 'center' }}>문제행동</th>
                                <th style={{ width: '80px', textAlign: 'center' }}>특수교육</th>
                                <th style={{ width: '80px', textAlign: 'center' }}>부진아</th>
                                <th style={{ width: '100px' }}>그룹</th>
                                <th style={{ width: '50px', textAlign: 'center' }}>삭제</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={index}>
                                    <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{index + 1}</td>
                                    {!!classData?.is_distributed && (
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                            {student.previous_section ? `${student.previous_section}반` : '-'}
                                        </td>
                                    )}
                                    <td>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={student.name}
                                            onChange={(e) => updateStudent(index, 'name', e.target.value)}
                                            onPaste={(e) => handleFieldPaste(e, index, 'name')}
                                            placeholder="이름"
                                            style={{ margin: 0, padding: '0.25rem', border: 'none', background: 'transparent' }}
                                            onFocus={(e) => e.target.style.borderBottom = '1px solid var(--primary)'}
                                            onBlur={(e) => e.target.style.borderBottom = '1px solid transparent'}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div
                                            className={`badge ${student.gender === 'M' ? 'badge-male' : 'badge-female'}`}
                                            style={{ cursor: 'pointer', margin: '0 auto', width: 'fit-content' }}
                                            onClick={() => updateStudent(index, 'gender', student.gender === 'M' ? 'F' : 'M')}
                                        >
                                            {student.gender === 'M' ? '남' : '여'}
                                        </div>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={student.birth_date || ''}
                                            onChange={(e) => updateStudent(index, 'birth_date', e.target.value)}
                                            placeholder="YYMMDD"
                                            style={{ margin: 0, padding: '0.25rem', border: 'none', background: 'transparent', fontSize: '0.9rem' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={student.notes || ''}
                                            onChange={(e) => updateStudent(index, 'notes', e.target.value)}
                                            placeholder="-"
                                            style={{ margin: 0, padding: '0.25rem', border: 'none', background: 'transparent', fontSize: '0.9rem' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={student.contact || ''}
                                            onChange={(e) => updateStudent(index, 'contact', e.target.value)}
                                            placeholder="-"
                                            style={{ margin: 0, padding: '0.25rem', border: 'none', background: 'transparent', fontSize: '0.9rem' }}
                                        />
                                    </td>

                                    {/* 구분선 이후 관리 항목 */}
                                    <td style={{ borderLeft: '2px solid var(--border)' }}>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="form-input"
                                            value={student.rank || ''}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
                                                updateStudent(index, 'rank', isNaN(val) ? null : val);
                                            }}
                                            placeholder="-"
                                            style={{ margin: 0, textAlign: 'center', background: 'transparent', border: 'none' }}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={student.is_problem_student}
                                            onChange={(e) => updateStudent(index, 'is_problem_student', e.target.checked)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={student.is_special_class}
                                            onChange={(e) => updateStudent(index, 'is_special_class', e.target.checked)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={student.is_underachiever}
                                            onChange={(e) => updateStudent(index, 'is_underachiever', e.target.checked)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            className="form-select"
                                            value={student.group_name}
                                            onChange={(e) => updateStudent(index, 'group_name', e.target.value)}
                                            style={{ margin: 0, padding: '0.25rem', fontSize: '0.85rem', height: 'auto' }}
                                        >
                                            <option value="">-</option>
                                            {[...Array(10)].map((_, i) => (
                                                <option key={i} value={`그룹${i + 1}`}>그룹{i + 1}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="btn" onClick={() => removeRow(index)} style={{ padding: '0.25rem', color: 'var(--text-muted)' }}>×</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 버튼 액션 바 */}
                {/* 버튼 액션 바 */}
                <div className="action-bar" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
                    <div className="action-group">
                        <button className="btn btn-secondary" onClick={addRow}>
                            + 학생 추가
                        </button>
                    </div>

                    <div className="action-group">
                        {childClassData && (
                            <button
                                className="btn"
                                onClick={handleDeleteDistributedClass}
                                style={{
                                    background: 'var(--error)',
                                    color: 'white',
                                    marginRight: '0.5rem',
                                    opacity: 0.8
                                }}
                            >
                                🗑️ 새로운반 삭제
                            </button>
                        )}
                        {errorMsg && (
                            <div style={{ color: 'var(--error)', fontWeight: 'bold', marginRight: '1rem', alignSelf: 'center', whiteSpace: 'pre-wrap', textAlign: 'right' }}>
                                ⚠️ {errorMsg}
                            </div>
                        )}
                        <button
                            className="btn"
                            onClick={() => {
                                setErrorMsg(null);
                                if (!classId || !currentSection) {
                                    setErrorMsg('학급 정보가 없습니다.');
                                    return;
                                }

                                // --- 마감 해지 로직 ---
                                if (isCompleted) {
                                    setConfirmAction('unmark');
                                    setShowConfirmModal(true);
                                    return;
                                }

                                // --- 마감 로직 ---
                                const studentsWithoutRank = students.filter(s => s.name.trim() && s.rank === null);
                                if (studentsWithoutRank.length > 0) {
                                    const names = studentsWithoutRank.map(s => s.name).join(', ');
                                    setErrorMsg(`석차가 입력되지 않은 학생이 있습니다 (${studentsWithoutRank.length}명)\n: ${names}`);
                                    return;
                                }

                                setConfirmAction('complete');
                                setShowConfirmModal(true);
                            }}
                            style={{
                                background: isCompleted ? 'var(--text-secondary)' : 'var(--success)',
                                color: 'white',
                                fontWeight: 'bold',
                                paddingLeft: '2rem',
                                paddingRight: '2rem',
                                boxShadow: isCompleted ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                                transition: 'all 0.3s'
                            }}
                        >
                            {isCompleted ? '🔓 마감 해지' : '✅ 명렬표 마감'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 반편성 모달 */}
            {
                showDistributeModal && (
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
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '12px',
                            maxWidth: '500px',
                            width: '90%'
                        }}>
                            <h2 style={{ marginTop: 0, color: '#667eea' }}>🔀 반편성</h2>
                            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                                현재 학급의 모든 학생을 새로운 반으로 편성합니다.<br />
                                등수, 성별, 그룹, 문제아, 특수반을 고려하여 균등하게 배치됩니다.
                            </p>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    새로운 반 수
                                </label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={newSectionCount}
                                    onChange={(e) => setNewSectionCount(parseInt(e.target.value) || 2)}
                                    min="2"
                                    max="20"
                                    style={{ width: '100%' }}
                                />
                                <small style={{ color: '#999' }}>2개 ~ 20개 반으로 편성 가능합니다.</small>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowDistributeModal(false)}
                                >
                                    취소
                                </button>
                                <button
                                    className="btn"
                                    onClick={handleDistribute}
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none'
                                    }}
                                >
                                    반편성 시작
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }


            {/* 석차 지정 모달 */}
            {
                showRankModal && (
                    <RankModal
                        students={students}
                        onClose={() => setShowRankModal(false)}
                        onSave={(updatedStudents) => {
                            setStudents(updatedStudents);
                            setShowRankModal(false);
                        }}
                    />
                )
            }

            {/* 분리 대상 설정 모달 */}
            {
                showSeparationModal && (
                    <SeparationModal
                        students={students}
                        onClose={() => setShowSeparationModal(false)}
                        onSave={(updatedStudents) => {
                            setStudents(updatedStudents);
                            setShowSeparationModal(false);
                        }}
                    />
                )
            }
            {/* 확인 모달 */}
            {showConfirmModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginTop: 0 }}>
                            {confirmAction === 'complete' ? '명렬표 마감' : '마감 해지'}
                        </h3>
                        <p style={{ color: '#666', marginBottom: '2rem' }}>
                            {confirmAction === 'complete'
                                ? '이 반의 학생 정보 입력을 마감하시겠습니까?\n모든 정보가 저장됩니다.'
                                : '마감을 해지하시겠습니까?\n다시 정보를 수정할 수 있게 됩니다.'}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                취소
                            </button>
                            <button
                                className="btn"
                                onClick={async () => {
                                    setShowConfirmModal(false);
                                    setLoading(true);
                                    try {
                                        if (confirmAction === 'complete') {
                                            // 학생 정보 저장
                                            const validStudents = students.filter(s => s.name.trim());
                                            if (validStudents.length > 0) {
                                                await fetch('/api/students', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        classId,
                                                        section: currentSection,
                                                        students: validStudents,
                                                    }),
                                                });
                                            }
                                            // 마감 상태 업데이트
                                            const response = await fetch(`/api/classes/${classId}`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ section: currentSection, status: 'completed' })
                                            });
                                            if (response.ok) {
                                                alert('✅ 완료되었습니다!');
                                                setIsCompleted(true);
                                                router.refresh();
                                                await loadClassData();
                                            } else {
                                                throw new Error('마감 처리 실패');
                                            }
                                        } else {
                                            // 마감 해지
                                            const response = await fetch(`/api/classes/${classId}`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ section: currentSection, status: 'in_progress' })
                                            });
                                            if (response.ok) {
                                                alert('마감이 해지되었습니다.');
                                                setIsCompleted(false);
                                                router.refresh();
                                                await loadClassData();
                                            } else {
                                                throw new Error('해지 실패');
                                            }
                                        }
                                    } catch (e: any) {
                                        setErrorMsg('오류 발생: ' + (e.message || '알 수 없는 오류'));
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                style={{
                                    background: confirmAction === 'complete' ? 'var(--success)' : 'var(--text-secondary)',
                                    color: 'white'
                                }}
                            >
                                {confirmAction === 'complete' ? '확인 (마감)' : '확인 (해지)'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
