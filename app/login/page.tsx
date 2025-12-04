'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [schoolName, setSchoolName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schoolName || !password) {
      alert('학교 이름과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/schools/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: schoolName,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      // Store school ID in localStorage
      if (data.schoolId) {
        localStorage.setItem('schoolId', data.schoolId.toString());
        localStorage.setItem('schoolName', schoolName);
      }

      alert('로그인 성공!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card fade-in" style={{ maxWidth: '500px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>학교 로그인</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="schoolName" className="form-label">학교 이름</label>
            <input
              id="schoolName"
              type="text"
              className="form-input"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="학교 이름을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">비밀번호</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading"></span>
                <span>처리 중...</span>
              </>
            ) : (
              '로그인'
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="btn"
            style={{ 
              width: '100%', 
              marginTop: '0.5rem',
              background: '#fff',
              color: '#666',
              border: '1px solid #ddd'
            }}
          >
            취소
          </button>
        </form>
      </div>
    </div>
  );
}
