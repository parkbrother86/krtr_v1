// src/app/results/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, Suspense } from 'react'; // Suspense를 추가로 import 합니다.

// 데이터 타입을 정의합니다.
interface Recommendation {
  placeName: string;
  category: string;
  reason: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface PlanData {
  planTitle: string;
  summary: string;
  recommendations: Recommendation[];
}

// 에러 처리 및 데이터 파싱을 담당하는 메인 컴포넌트
function ResultsDisplay() {
  // 지도를 클라이언트 사이드에서만 렌더링하도록 dynamic import
  const Map = useMemo(() => dynamic(
    () => import('@/components/DynamicMap'),
    { 
      loading: () => <p className="text-center">A map is loading...</p>,
      ssr: false 
    }
  ), []);

  const searchParams = useSearchParams();
  const dataString = searchParams.get('data');
  
  // 데이터가 없거나 잘못된 경우를 처리하는 로직을 강화합니다.
  if (!dataString) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8">
        <h1 className="text-2xl font-bold">오류</h1>
        <p className="text-gray-600 mt-2">표시할 데이터가 없습니다.</p>
        <Link href="/" className="mt-4 text-blue-600 hover:underline">
          처음으로 돌아가기
        </Link>
      </div>
    );
  }

  let data: PlanData;
  try {
    data = JSON.parse(decodeURIComponent(dataString));
  } catch (error) {
    console.error("Failed to parse data:", error);
    return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8">
        <h1 className="text-2xl font-bold">데이터 오류</h1>
        <p className="text-gray-600 mt-2">결과를 처리하는 중 문제가 발생했습니다.</p>
        <Link href="/" className="mt-4 text-blue-600 hover:underline">
          다시 시도하기
        </Link>
      </div>
    )
  }

  return (
    // 메인 레이아웃을 flex 컨테이너로 변경
    <main className="flex h-screen bg-gray-100">
      {/* 왼쪽 패널 (기존 콘텐츠) */}
      <div className="w-full md:w-1/2 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{data.planTitle}</h1>
            <p className="mt-4 text-lg text-gray-700">{data.summary}</p>
          </div>
          
          <div className="bg-gray-50 px-8 py-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">추천 장소</h2>
            <div className="space-y-6">
              {data.recommendations.map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{item.placeName}</h3>
                  </div>
                  {/* 따옴표 문제를 확실히 해결하고, 문장 앞뒤 공백도 제거합니다. */}
                  <p className='text-gray-600 mb-3'>"{item.reason.replace(/"/g, '').trim()}"</p>
                  <p className="text-sm text-gray-500">📍 {item.address}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 text-center">
            <Link href="/" className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
              새로운 계획 만들기
            </Link>
          </div>
        </div>
      </div>

      {/* 오른쪽 패널 (지도) - 모바일에서는 숨겨집니다. */}
      <div className="hidden md:block md:w-1/2 h-full">
        {/* 데이터가 유효할 때만 맵을 렌더링하도록 합니다. */}
        {data.recommendations && data.recommendations.length > 0 && (
          <Map recommendations={data.recommendations} />
        )}
      </div>
    </main>
  );
}


// 페이지 전체를 Suspense로 감싸서 useSearchParams 사용으로 인한 잠재적 문제를 방지합니다.
export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading results...</div>}>
      <ResultsDisplay />
    </Suspense>
  )
}