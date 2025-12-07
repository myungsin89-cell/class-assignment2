'use client';

import { useState, useEffect } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    useDraggable,
    useDroppable,
} from '@dnd-kit/core';

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

interface RankModalProps {
    students: Student[];
    onClose: () => void;
    onSave: (updatedStudents: Student[]) => void;
}

interface RankSlot {
    rank: number;
    student: Student | null;
}

export default function RankModal({ students, onClose, onSave }: RankModalProps) {
    const [maleSlots, setMaleSlots] = useState<RankSlot[]>([]);
    const [femaleSlots, setFemaleSlots] = useState<RankSlot[]>([]);
    const [unassignedMales, setUnassignedMales] = useState<Student[]>([]);
    const [unassignedFemales, setUnassignedFemales] = useState<Student[]>([]);
    const [activeStudent, setActiveStudent] = useState<Student | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        // 남/여학생 분리
        const males = students.filter(s => s.gender === 'M');
        const females = students.filter(s => s.gender === 'F');

        // 석차 슬롯 초기화
        const maleCount = males.length;
        const femaleCount = females.length;

        const initialMaleSlots: RankSlot[] = Array.from({ length: maleCount }, (_, i) => ({
            rank: i + 1,
            student: males.find(s => s.rank === i + 1) || null,
        }));

        const initialFemaleSlots: RankSlot[] = Array.from({ length: femaleCount }, (_, i) => ({
            rank: i + 1,
            student: females.find(s => s.rank === i + 1) || null,
        }));

        setMaleSlots(initialMaleSlots);
        setFemaleSlots(initialFemaleSlots);

        // 미지정 학생
        setUnassignedMales(males.filter(s => !s.rank));
        setUnassignedFemales(females.filter(s => !s.rank));
    }, [students]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const studentData = active.data.current?.student as Student;
        setActiveStudent(studentData);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveStudent(null);

        if (!over) return;

        const activeData = active.data.current;
        const overData = over.data.current;

        if (!activeData || !overData) return;

        const student = activeData.student as Student;
        const targetRank = overData.rank as number;
        const targetGender = overData.gender as 'M' | 'F';

        // 성별이 다르면 이동 불가
        if (student.gender !== targetGender) {
            alert('같은 성별 영역에만 배치할 수 있습니다.');
            return;
        }

        if (student.gender === 'M') {
            const newSlots = [...maleSlots];
            const targetSlot = newSlots.find(slot => slot.rank === targetRank);

            if (targetSlot) {
                // 기존에 배치된 학생이 있다면 미지정으로 이동
                if (targetSlot.student) {
                    setUnassignedMales([...unassignedMales, targetSlot.student]);
                }

                // 새 학생 배치
                targetSlot.student = student;
                setMaleSlots(newSlots);

                // 미지정에서 제거
                if (activeData.from === 'unassigned') {
                    setUnassignedMales(unassignedMales.filter(s => s !== student));
                } else {
                    // 기존 슬롯에서 제거
                    const oldSlot = newSlots.find(slot => slot.student === student && slot.rank !== targetRank);
                    if (oldSlot) {
                        oldSlot.student = null;
                    }
                }
            }
        } else {
            const newSlots = [...femaleSlots];
            const targetSlot = newSlots.find(slot => slot.rank === targetRank);

            if (targetSlot) {
                if (targetSlot.student) {
                    setUnassignedFemales([...unassignedFemales, targetSlot.student]);
                }

                targetSlot.student = student;
                setFemaleSlots(newSlots);

                if (activeData.from === 'unassigned') {
                    setUnassignedFemales(unassignedFemales.filter(s => s !== student));
                } else {
                    const oldSlot = newSlots.find(slot => slot.student === student && slot.rank !== targetRank);
                    if (oldSlot) {
                        oldSlot.student = null;
                    }
                }
            }
        }
    };

    const handleSave = () => {
        // 모든 학생의 rank 업데이트
        const updatedStudents = students.map(student => {
            if (student.gender === 'M') {
                const slot = maleSlots.find(s => s.student === student);
                return { ...student, rank: slot ? slot.rank : null };
            } else {
                const slot = femaleSlots.find(s => s.student === student);
                return { ...student, rank: slot ? slot.rank : null };
            }
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
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '1200px',
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
                        <h2 style={{ margin: 0 }}>학생 석차 지정</h2>
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

                    {/* 미지정 학생 영역 */}
                    <div style={{
                        background: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem'
                    }}>
                        <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#666' }}>
                            미지정 학생 (드래그하여 순번에 배치하세요)
                        </h3>
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap'
                        }}>
                            {unassignedMales.length === 0 && unassignedFemales.length === 0 && (
                                <p style={{ color: '#999', margin: 0 }}>모든 학생이 배치되었습니다</p>
                            )}
                            {unassignedMales.map((student, index) => (
                                <StudentCard
                                    key={`unassigned-m-${index}`}
                                    student={student}
                                    from="unassigned"
                                />
                            ))}
                            {unassignedFemales.map((student, index) => (
                                <StudentCard
                                    key={`unassigned-f-${index}`}
                                    student={student}
                                    from="unassigned"
                                />
                            ))}
                        </div>
                    </div>

                    {/* 남/여학생 석차 영역 */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '2rem'
                    }}>
                        {/* 남학생 */}
                        <div>
                            <h3 style={{ marginTop: 0, color: '#007bff' }}>남학생 석차</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {maleSlots.map((slot) => (
                                    <RankSlotComponent
                                        key={`male-${slot.rank}`}
                                        rank={slot.rank}
                                        student={slot.student}
                                        gender="M"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 여학생 */}
                        <div>
                            <h3 style={{ marginTop: 0, color: '#e91e63' }}>여학생 석차</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {femaleSlots.map((slot) => (
                                    <RankSlotComponent
                                        key={`female-${slot.rank}`}
                                        rank={slot.rank}
                                        student={slot.student}
                                        gender="F"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 저장 버튼 */}
                    <div style={{
                        marginTop: '2rem',
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            취소
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                        >
                            적용
                        </button>
                    </div>
                </div>

                <DragOverlay>
                    {activeStudent ? (
                        <div style={{
                            background: '#007bff',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'grabbing',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}>
                            {activeStudent.name}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

// 학생 카드 컴포넌트
function StudentCard({ student, from }: { student: Student; from: string }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `${from}-${student.name}-${student.id || Math.random()}`,
        data: { student, from },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                background: student.gender === 'M' ? '#e3f2fd' : '#fce4ec',
                color: student.gender === 'M' ? '#007bff' : '#e91e63',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: isDragging ? 'grabbing' : 'grab',
                opacity: isDragging ? 0.5 : 1,
                fontWeight: 'bold',
                border: `2px solid ${student.gender === 'M' ? '#007bff' : '#e91e63'}`,
                transition: 'opacity 0.2s'
            }}
        >
            {student.name}
        </div>
    );
}

// 석차 슬롯 컴포넌트
function RankSlotComponent({ rank, student, gender }: { rank: number; student: Student | null; gender: 'M' | 'F' }) {
    const { setNodeRef } = useDroppable({
        id: `slot-${gender}-${rank}`,
        data: { rank, gender },
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                border: '2px dashed #ddd',
                borderRadius: '8px',
                background: student ? (gender === 'M' ? '#e3f2fd' : '#fce4ec') : 'white',
                minHeight: '50px'
            }}
        >
            <span style={{ fontWeight: 'bold', color: '#666', minWidth: '40px' }}>
                {rank}등:
            </span>
            {student ? (
                <StudentCard student={student} from={`slot-${gender}`} />
            ) : (
                <span style={{ color: '#999', fontStyle: 'italic' }}>드래그하여 배치</span>
            )}
        </div>
    );
}
