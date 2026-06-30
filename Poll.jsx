'use client';
import { useState, useEffect } from 'react';

export default function Poll() {
  const [results, setResults] = useState({ yes: 0, no: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Загружаем текущие результаты при старте страницы
  useEffect(() => {
    fetch('/api/vote')
      .then((res) => res.json())
      .then((data) => {
        if (data) setResults(data);
        setLoading(false);
      });

    // Проверяем, голосовал ли пользователь ранее (локально)
    if (localStorage.getItem('voted_poll_1')) {
      setHasVoted(true);
    }
  }, []);

  // 2. Функция отправки голоса
  const handleVote = async (option) => {
    setLoading(true);
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option }),
      });
      const updatedResults = await response.json();
      
      setResults(updatedResults);
      setHasVoted(true);
      localStorage.setItem('voted_poll_1', 'true'); // Запоминаем голос
    } catch (error) {
      console.error('Ошибка при голосовании:', error);
    } finally {
      setLoading(false);
    }
  };

  // Вычисление процентов для визуализации
  const totalVotes = (Number(results.yes) || 0) + (Number(results.no) || 0);
  const yesPercent = totalVotes > 0 ? Math.round((Number(results.yes) / totalVotes) * 100) : 0;
  const noPercent = totalVotes > 0 ? Math.round((Number(results.no) / totalVotes) * 100) : 0;

  if (loading && totalVotes === 0) return <p style={{ textAlign: 'center' }}>Загрузка опроса...</p>;

  return (
    <div style={styles.card}>
      <h2 style={styles.question}>Вы этим летом купались в реке или в озере?</h2>

      {!hasVoted ? (
        // Интерфейс для голосования
        <div style={styles.buttonContainer}>
          <button 
            onClick={() => handleVote('yes')} 
            disabled={loading} 
            style={{ ...styles.button, ...styles.buttonYes }}
          >
            Да 👍
          </button>
          <button 
            onClick={() => handleVote('no')} 
            disabled={loading} 
            style={{ ...styles.button, ...styles.buttonNo }}
          >
            Нет 👎
          </button>
        </div>
      ) : (
        // Интерфейс результатов после голосования
        <div style={styles.resultsContainer}>
          <p style={styles.thanks}>Спасибо за ваш голос!</p>
          
          {/* Шкала для "Да" */}
          <div style={styles.resultRow}>
            <div style={styles.label}>Да ({results.yes || 0})</div>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressBar, width: `${yesPercent}%`, backgroundColor: '#4CAF50' }} />
            </div>
            <div style={styles.percent}>{yesPercent}%</div>
          </div>

          {/* Шкала для "Нет" */}
          <div style={styles.resultRow}>
            <div style={styles.label}>Нет ({results.no || 0})</div>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressBar, width: `${noPercent}%`, backgroundColor: '#F44336' }} />
            </div>
            <div style={styles.percent}>{noPercent}%</div>
          </div>
          
          <p style={styles.total}>Всего голосов: {totalVotes}</p>
        </div>
      )}
    </div>
  );
}

// Простые встроенные стили (можно заменить на Tailwind CSS / CSS Modules)
const styles = {
  card: {
    maxWidth: '400px',
    margin: '40px auto',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    fontFamily: 'system-ui, sans-serif',
    color: '#333'
  },
  question: {
    fontSize: '20px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
  },
  button: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  buttonYes: { backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' },
  buttonNo: { backgroundColor: '#ffebee', color: '#c62828', fontWeight: 'bold' },
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  thanks: {
    textAlign: 'center',
    color: '#666',
    margin: '0 0 8px 0',
  },
  resultRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  label: { width: '70px', fontSize: '14px' },
  progressTrack: {
    flex: 1,
    height: '12px',
    backgroundColor: '#eee',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    transition: 'width 0.5s ease-out',
  },
  percent: { width: '40px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' },
  total: { fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '8px' }
};
