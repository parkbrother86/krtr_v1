// src/app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('요청 내용을 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: prompt }),
      });

      if (!response.ok) {
        throw new Error('API 요청에 실패했습니다.');
      }

      const data = await response.json();
      
      // 결과를 쿼리 스트링으로 변환하여 results 페이지로 전달
      const queryString = encodeURIComponent(JSON.stringify(data));
      router.push(`/results?data=${queryString}`);

    } catch (err) {
      setError('계획 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Trip Planner</h1>
        <p className="text-lg text-gray-600 mb-8">
          원하는 여행을 말해주세요. AI가 일정을 만들어 드립니다.
        </p>
        
        <form onSubmit={handleSubmit} className="w-full">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: 서울에서 주말에 친구랑 둘이서 10만원으로 즐길 수 있는 힙한 맛집과 카페 추천해줘"
            className="w-full h-40 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all duration-300 transform hover:scale-105 disabled:scale-100"
          >
            {isLoading ? 'AI가 계획을 짜는 중...' : '나만의 여행 계획 만들기'}
          </button>
        </form>

        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </main>
  );
}

// ...
interface Recommendation {
  placeName: string;
  category: string;
  reason: string;
  address: string;
  latitude: number;  // 추가
  longitude: number; // 추가
}
// ...