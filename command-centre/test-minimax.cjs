require('dotenv').config({ path: './.env.local' });

const apiKey = process.env.MINIMAX_API_KEY;
const groupId = process.env.MINIMAX_GROUP_ID;

async function test() {
  console.log('Testing with:');
  console.log('  Group ID:', groupId);
  console.log('  API Key (first 10):', apiKey?.substring(0, 10));

  // Test correct URL (minimaxi.com with GroupId as query param)
  const url = `https://api.minimaxi.com/v1/text/chatcompletion_v2?GroupId=${groupId}`;

  const body = {
    model: 'MiniMax-Text-01',
    messages: [{role: 'user', content: 'say hello'}],
    tokens_to_generate: 50
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text.substring(0, 500));
}

test().catch(console.error);
