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
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    // 3. AI에게 보낼 프롬프트 수정 (한국어 우선 답변 및 좌표 정확도 개선 지시)
    const fullPrompt = `
      You are a helpful and friendly trip planning assistant who is an expert on Korea.
      Your primary language for responses is Korean.
      Based on the user's request below, generate a travel plan in KOREAN.
      The output MUST be a JSON object with the exact following structure. Do not add any extra text or markdown formatting like \`\`\`json.

      JSON Structure:
      {
        "planTitle": "A concise and catchy title for the trip plan, in Korean. (e.g., '홍대 감성 카페와 맛집 투어')",
        "summary": "A brief, engaging summary of the trip plan, written in a friendly tone in Korean. (e.g., '친구와 함께 홍대에서 보낼 완벽한 하루! 힙한 카페에서 커피 한잔하고, 맛있는 저녁을 즐겨보세요.')",
        "recommendations": [
          {
            "placeName": "Name of the recommended place, in Korean. (e.g., '어반플랜트')",
            "category": "The category of the place in Korean. (e.g., '카페', '맛집', '명소', '액티비티')",
            "reason": "A short sentence explaining why this place fits the user's request, in Korean.",
            "address": "The full, physical address of the place, in Korean.",
            "latitude": "The latitude derived from the physical address. Must be a number.",
            "longitude": "The longitude derived from the physical address. Must be a number."
          }
        ]
      }

      User's Request: "${userPrompt}"

      Please analyze the user's request and provide 3-5 recommendations.
      If the user's request is in Korean, all text values in the JSON output MUST be in Korean.
      If the user's request is in English but is about Korea, the output should still be in Korean.
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