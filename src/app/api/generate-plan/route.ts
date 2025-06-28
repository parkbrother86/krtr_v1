// src/app/api/generate-plan/route.ts

import { NextRequest, NextResponse } from 'next/server';
// OpenAI 대신 Google Generative AI를 가져옵니다.
import { GoogleGenerativeAI } from '@google/generative-ai';

// API 키를 환경 변수에서 가져옵니다.
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  throw new Error('Google API Key not found in .env.local');
}

// Gemini 클라이언트 초기화
const genAI = new GoogleGenerativeAI(API_KEY);

// POST 요청을 처리할 함수
export async function POST(req: NextRequest) {
  try {
    // 1. 사용자 요청에서 프롬프트 추출
    const { userPrompt } = await req.json();

    if (!userPrompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    
    // 2. Gemini 모델 선택 및 설정
    // gemini-1.5-flash-latest는 빠르고 비용 효율적이며 무료 쿼터가 넉넉합니다.
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    // 3. AI에게 보낼 프롬프트 재구성 (Gemini는 시스템 프롬프트 대신 일반 프롬프트에 지시사항을 포함)
    const fullPrompt = `
    You are a helpful trip planning assistant.
    Based on the user's request below, generate a travel plan.
    The output MUST be a JSON object with the exact following structure. Do not add any extra text or markdown formatting like \`\`\`json.

    JSON Structure:
    {
        "planTitle": "A concise and catchy title for the trip plan.",
        "summary": "A brief, engaging summary of the trip plan, written as if you are talking to a friend.",
        "recommendations": [
        {
            "placeName": "Name of the recommended place.",
            "category": "e.g., 'Restaurant', 'Cafe', 'Activity', 'Sightseeing'",
            "reason": "A short sentence explaining why this place fits the user's request.",
            "address": "The physical address of the place.",
            "latitude": "The latitude of the place as a number. Crucial for map display.",
            "longitude": "The longitude of the place as a number. Crucial for map display."
        }
        ]
    }

    User's Request: "${userPrompt}"

      Provide 3-5 recommendations based on the user's request.
    `;

    // 4. Google Gemini API 호출
    const result = await model.generateContent(fullPrompt);

    // 5. AI 응답에서 텍스트 데이터 추출
    const responseText = result.response.text();
    
    // 6. 텍스트를 JSON으로 파싱하여 클라이언트에 반환
    // Gemini는 종종 응답 앞뒤에 ```json ... ``` 같은 마크다운을 붙이므로 이를 제거합니다.
    const cleanedJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonData = JSON.parse(cleanedJsonString);

    return NextResponse.json(jsonData);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}