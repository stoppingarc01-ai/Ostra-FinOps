export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { provider, apiKey } = body;
    const key = String(apiKey || '').trim();
    const p = String(provider || '').toLowerCase();
    const t0 = Date.now();

    if (!key) {
      return res.status(400).json({ ok: false, error: 'API key is required' });
    }

    let targetUrl = '';
    const headers: Record<string, string> = {};

    if (p === 'google') {
      targetUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
    } else if (p === 'openai') {
      targetUrl = 'https://api.openai.com/v1/models';
      headers['Authorization'] = `Bearer ${key}`;
    } else if (p === 'anthropic') {
      targetUrl = 'https://api.anthropic.com/v1/models';
      headers['x-api-key'] = key;
      headers['anthropic-version'] = '2023-06-01';
    } else if (p === 'deepseek') {
      targetUrl = 'https://api.deepseek.com/models';
      headers['Authorization'] = `Bearer ${key}`;
    } else if (p === 'mistral') {
      targetUrl = 'https://api.mistral.ai/v1/models';
      headers['Authorization'] = `Bearer ${key}`;
    } else if (p === 'xai') {
      targetUrl = 'https://api.x.ai/v1/models';
      headers['Authorization'] = `Bearer ${key}`;
    } else if (p === 'cohere') {
      targetUrl = 'https://api.cohere.com/v1/models';
      headers['Authorization'] = `Bearer ${key}`;
    } else {
      targetUrl = 'https://api.openai.com/v1/models';
      headers['Authorization'] = `Bearer ${key}`;
    }

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 6000);
    const upstreamRes = await fetch(targetUrl, { headers, signal: ctrl.signal }).finally(() => clearTimeout(timeout));
    const latency = Date.now() - t0;

    if (upstreamRes.ok) {
      return res.status(200).json({ ok: true, latency, status: upstreamRes.status });
    } else {
      const errText = await upstreamRes.text().catch(() => '');
      let errMsg = `Upstream error HTTP ${upstreamRes.status}`;
      try {
        const parsed = JSON.parse(errText);
        errMsg = parsed?.error?.message || parsed?.message || errMsg;
      } catch {}
      return res.status(200).json({ ok: false, error: errMsg, status: upstreamRes.status });
    }
  } catch (err: any) {
    return res.status(200).json({ ok: false, error: err.message || 'Handshake failed' });
  }
}
