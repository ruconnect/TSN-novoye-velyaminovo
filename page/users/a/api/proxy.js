export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Укажите параметр ?url=');
  }

  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    const parsedUrl = new URL(targetUrl);
    const origin = parsedUrl.origin;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    let html = await response.text();

    // Простейшая замена относительных путей на абсолютные
    html = html.replace(/(src|href)=\"\/(?!\/)/g, `$1="${origin}/`);
    html = html.replace(/(src|href)=\'\/(?!\/)/g, `$1='${origin}/`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (error) {
    return res.status(500).send(`Ошибка загрузки страницы: ${error.message}`);
  }
}
