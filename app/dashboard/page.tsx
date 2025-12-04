  'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClassData {
  id: number;
  grade: number;
  section_count: number;
  created_at: string;
}

export default function Dashboard() {
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [grade, setGrade] = useState('');
    const [sectionCount, setSectionCount] = useState('');
    const [creating, setCreating] = useState(false);
    const router = useRouter();
    const [schoolName, setSchoolName] = useState('');

    useEffect(() => {
      const storedSchoolName = localStorage.getItem('schoolName');
      const schoolId = localStorage.getItem('schoolId');

      if (!schoolId) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      if (storedSchoolName) {
        setSchoolName(storedSchoolName);
      }

      fetchClasses();
    }, [router]);

    const fetchClasses = async () => {
      try {
        const schoolId = localStorage.getItem('schoolId');
        const response = await fetch(`/api/classes?schoolId=${schoolId}`);

        if (!response.ok) throw new Error('Failed to fetch classes');

        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error('Error fetching classes:', error);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!grade || !sectionCount) {
        alert('학년과 반 수를 모두 입력해주세요.');
        return;
      }

      setCreating(true);

      try {
        const schoolId = localStorage.getItem('schoolId');
        const response = await fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            school_id: parseInt(schoolId!),
            grade: parseInt(grade),
            section_count: parseInt(sectionCount),
          }),
        });

        if (!response.ok) throw new Error('Failed to create class');

        const data = await response.json();
        setShowModal(false);
        setGrade('');
        setSectionCount('');

        fetchClasses();

        router.push(`/students?classId=${data.id}`);
      } catch (error) {
        console.error('Error:', error);
        alert('반 생성 중 오류가 발생했습니다.');
      } finally {
        setCreating(false);
      }
    };

    const handleClassClick = (classId: number) => {
      router.push(`/students?classId=${classId}`);
    };

    const handleDeleteClass = async (classId: number, e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click

      if (!confirm('이 학급을 삭제하시겠습니까? 모든 학생 데이터도 함께 삭제됩니다.')) {
        return;
      }

      try {
        const schoolId = localStorage.getItem('schoolId');
        const response = await fetch(`/api/classes?classId=${classId}&schoolId=${schoolId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete class');

        alert('학급이 삭제되었습니다.');
        fetchClasses(); // Refresh the list
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('학급 삭제 중 오류가 발생했습니다.');
      }
    };

    const handleLogout = () => {
      localStorage.removeItem('schoolId');
      localStorage.removeItem('schoolName');
      router.push('/');
    };

    if (loading) {
      return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
  justifyContent: 'center' }}>
          <div className="loading"></div>
        </div>
      );
    }

    return (
      <div className="container" style={{ minHeight: '100vh', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'
  }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>{schoolName} 학생 관리</h1>
            <p style={{ color: '#666' }}>생성된 학급을 클릭하여 학생을 관리하세요</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn"
            style={{
              background: '#fff',
              color: '#666',
              border: '1px solid #ddd'
            }}
          >
            로그아웃
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '5rem'
        }}>
          {classes.map((classData) => (
            <div
              key={classData.id}
              onClick={() => handleClassClick(classData.id)}
              className="card"
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '2px solid #e0e0e0',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#007bff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
            >
              <button
                onClick={(e) => handleDeleteClass(classData.id, e)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#c82333';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#dc3545';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="학급 삭제"
              >
                ×
              </button>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#007bff' }}>
                  {classData.grade}학년
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1rem' }}>
                  {classData.section_count}개 반
                </p>
                <p style={{ fontSize: '0.85rem', color: '#999' }}>
                  생성일: {new Date(classData.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          ))}

          {classes.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem',
              color: '#999'
            }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>아직 생성된 학급이 없습니다.</p>
              <p>왼쪽 하단의 + 버튼을 눌러 새 학급을 만들어보세요!</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#007bff',
            color: 'white',
            border: 'none',
            fontSize: '2rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,123,255,0.4)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,123,255,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,123,255,0.4)';
          }}
        >
          +
        </button>

        {showModal && (
          <div
            style={{
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
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              className="card"
              style={{ maxWidth: '500px', width: '90%', margin: '1rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '1.5rem' }}>새 학급 만들기</h2>

              <form onSubmit={handleCreateClass}>
                <div className="form-group">
                  <label htmlFor="grade" className="form-label">학년</label>
                  <input
                    id="grade"
                    type="number"
                    min="1"
                    max="6"
                    className="form-input"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="학년을 입력하세요 (예: 3)"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sectionCount" className="form-label">반 수</label>
                  <input
                    id="sectionCount"
                    type="number"
                    min="1"
                    max="20"
                    className="form-input"
                    value={sectionCount}
                    onChange={(e) => setSectionCount(e.target.value)}
                    placeholder="반 수를 입력하세요 (예: 5)"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <span className="loading"></span>
                        <span>생성 중...</span>
                      </>
                    ) : (
                      '학급 생성'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn"
                    style={{
                      flex: 1,
                      background: '#fff',
                      color: '#666',
                      border: '1px solid #ddd'
                    }}
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }