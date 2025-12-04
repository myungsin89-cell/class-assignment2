'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card fade-in" style={{ maxWidth: '500px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>학생 관리 시스템</h1>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
          시작하려면 학교를 등록하거나 로그인하세요
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={() => router.push('/register')}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            학교 가입하기
          </button>

          <button
            onClick={() => router.push('/login')}
            className="btn"
            style={{ 
              width: '100%',
              background: '#fff',
              color: '#007bff',
              border: '2px solid #007bff'
            }}
          >
            학교 로그인하기
          </button>
        </div>
      </div>
    </div>
  );
}
