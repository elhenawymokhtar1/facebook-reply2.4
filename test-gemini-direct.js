// اختبار مباشر لـ Gemini API
import fetch from 'node-fetch';

async function testGeminiDirect() {
  console.log('🧪 اختبار Gemini API مباشرة...');
  
  const apiKey = 'AIzaSyC9lPa149e4aRcu85Ac8yNbI53HZziyD_Q';
  const model = 'gemini-1.5-flash';
  const prompt = 'مرحبا، كيف الحال؟ أريد مساعدة في اختيار منتج مناسب.';
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });

    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API Error:', response.status, errorText);
      return;
    }

    const data = await response.json();
    console.log('📄 Full response:', JSON.stringify(data, null, 2));
    
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (aiResponse) {
      console.log('✅ AI Response:', aiResponse);
    } else {
      console.log('❌ No AI response found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testGeminiDirect();
