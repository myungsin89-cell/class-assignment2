'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '1rem 2rem',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(71, 85, 105, 0.5)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🎓 반배정 시스템
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => router.push('/login')}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1.25rem' }}
          >
            로그인
          </button>
          <button
            onClick={() => router.push('/register')}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1.25rem' }}
          >
            시작하기
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 2rem 4rem',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '900px' }}>
          <h1 className="fade-in" style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            marginBottom: '1.5rem',
            lineHeight: 1.2
          }}>
            공정하고 투명한<br />반배정 시스템
          </h1>
          <p className="fade-in" style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            maxWidth: '600px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7
          }}>
            지그재그 알고리즘으로 학생들의 실력을 균등하게 분배하고,<br />
            여러 선생님이 함께 협업하여 공정한 반배정을 실현합니다.
          </p>
          <div className="fade-in" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/register')}
              className="btn btn-primary"
              style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}
            >
              🚀 지금 시작하기
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="btn btn-secondary"
              style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
            >
              자세히 알아보기 ↓
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '6rem 2rem',
        background: 'var(--bg-secondary)'
      }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              왜 반배정 시스템인가요?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              선생님들의 업무를 덜어주고, 학부모님들께 신뢰를 드립니다.
            </p>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Feature 1 */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              textAlign: 'center',
              padding: '2.5rem 2rem'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1.5rem'
              }}>🎯</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                공정한 배정
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                지그재그 알고리즘으로 각 반 1등, 2등, 3등...을 순서대로 분산 배치합니다.
                모든 반의 평균 실력이 비슷해지도록 자동 계산됩니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              textAlign: 'center',
              padding: '2.5rem 2rem'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1.5rem'
              }}>👥</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                협업 기능
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                여러 선생님이 동시에 학생 정보를 입력하고 조건을 설정할 수 있습니다.
                임시저장으로 언제든 이어서 작업 가능합니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              textAlign: 'center',
              padding: '2.5rem 2rem'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1.5rem'
              }}>🔒</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                투명한 과정
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                배정 알고리즘이 완전 공개됩니다.
                어떤 원리로 배정되는지 학부모님께도 설명 가능합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'var(--bg-main)'
      }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              간단한 3단계
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              복잡한 반배정, 이제 쉽게 해결하세요.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Step 1 */}
            <div className="card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              padding: '2rem'
            }}>
              <div style={{
                minWidth: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                color: 'white'
              }}>1</div>
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  📝 학생 정보 입력
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                  엑셀 파일을 업로드하거나 직접 입력하세요. 이름, 성별, 석차, 특이사항 등을 입력합니다.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              padding: '2rem'
            }}>
              <div style={{
                minWidth: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                color: 'white'
              }}>2</div>
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  ⚙️ 조건 설정
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                  분리해야 할 학생, 같은 반에 배정해야 할 학생을 지정합니다. 특수교육 대상 학생 인원 조정도 가능합니다.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              padding: '2rem'
            }}>
              <div style={{
                minWidth: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, var(--secondary) 0%, #be185d 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                color: 'white'
              }}>3</div>
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  🎯 자동 배정 & 결과 확인
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                  알고리즘이 최적의 배정 결과를 계산합니다. 결과를 확인하고 필요시 수동 조정 후 최종 저장합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Algorithm Explanation Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'var(--bg-secondary)'
      }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              📐 지그재그 배정 원리
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              각 반 석차를 유지하면서 균등하게 분산 배치합니다.
            </p>
          </div>

          <div className="card" style={{ padding: '2.5rem' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '2rem', lineHeight: 1.8 }}>
              <strong>핵심:</strong> 1반 1등과 2반 1등은 서로 다른 반에 배정됩니다.<br />
              같은 등수끼리 묶어서 순서를 바꿔가며 분산 배치합니다.
            </p>

            <div style={{
              background: 'var(--bg-tertiary)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                🎯 배정 순서 예시:
              </div>
              <div style={{ fontFamily: 'monospace', lineHeight: 2, color: 'var(--text-secondary)' }}>
                <div>1등 그룹: 1반 1등→<span style={{ color: '#6366f1', fontWeight: 600 }}>A반</span>, 2반 1등→<span style={{ color: '#10b981', fontWeight: 600 }}>B반</span>, 3반 1등→<span style={{ color: '#ec4899', fontWeight: 600 }}>C반</span></div>
                <div>2등 그룹: 1반 2등→<span style={{ color: '#ec4899', fontWeight: 600 }}>C반</span>, 2반 2등→<span style={{ color: '#10b981', fontWeight: 600 }}>B반</span>, 3반 2등→<span style={{ color: '#6366f1', fontWeight: 600 }}>A반</span> <span style={{ color: '#f59e0b' }}>(역순!)</span></div>
                <div>3등 그룹: 1반 3등→<span style={{ color: '#6366f1', fontWeight: 600 }}>A반</span>, 2반 3등→<span style={{ color: '#10b981', fontWeight: 600 }}>B반</span>, 3반 3등→<span style={{ color: '#ec4899', fontWeight: 600 }}>C반</span> <span style={{ color: '#10b981' }}>(다시 정순!)</span></div>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
              → 이렇게 하면 원래 같은 반 최상위권 학생들이 새로운 반에서 서로 흩어져 모든 반이 고르게 됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            color: 'var(--text-primary)'
          }}>
            지금 바로 시작하세요
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            무료로 학교를 등록하고 공정한 반배정을 경험해보세요.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/register')}
              className="btn btn-primary"
              style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}
            >
              🚀 학교 등록하기
            </button>
            <button
              onClick={() => router.push('/login')}
              className="btn btn-secondary"
              style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}
            >
              기존 학교 로그인
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        background: 'var(--bg-main)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
          © 2024 반배정 시스템. 선생님들의 공정한 반배정을 응원합니다. 💚
        </p>
        <p style={{
          color: 'var(--text-muted)',
          margin: 0,
          fontSize: '0.8rem',
          opacity: 0.7
        }}>
          made by <span style={{ color: '#10b981', fontWeight: 600 }}>초록덕후</span> 🌿
        </p>
      </footer>
    </div>
  );
}
