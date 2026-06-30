import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { option } = req.body; // Например, 'yes' или 'no'
    await kv.hincrby('poll_results', option, 1); // Увеличиваем счетчик варианта на 1
    const currentResults = await kv.hgetall('poll_results');
    return res.status(200).json(currentResults);
  }

  if (req.method === 'GET') {
    const currentResults = await kv.hgetall('poll_results');
    return res.status(200).json(currentResults || { yes: 0, no: 0 });
  }
}
