import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

function soloPairingPlugin(): Plugin {
  const getPairingFiles = () => [
    path.resolve(process.cwd(), '.ostraops', 'solo_pairing.json'),
    path.resolve(os.homedir(), '.ostraops', 'solo_pairing.json'),
  ]

  return {
    name: 'solo-pairing-plugin',
    configureServer(server) {
      server.middlewares.use('/api/dev/pairing', (req, res) => {
        const pairingFiles = getPairingFiles()

        if (req.method === 'GET') {
          for (const file of pairingFiles) {
            console.log('[solo-pairing] Checking file:', file, 'exists:', fs.existsSync(file))
            if (fs.existsSync(file)) {
              try {
                const data = fs.readFileSync(file, 'utf-8')
                const parsed = JSON.parse(data)
                if (parsed.clientId && parsed.secret) {
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(data)
                }
              } catch (e) {
                console.log('[solo-pairing] Error reading file:', e)
              }
            }
          }
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({ found: false }))
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => { body += chunk })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body)
              for (const file of pairingFiles) {
                const dir = path.dirname(file)
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
                }
                fs.writeFileSync(file, JSON.stringify(parsed, null, 2), { encoding: 'utf-8', mode: 0o600 })
              }
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true, saved: parsed }))
            } catch (err) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, error: String(err) }))
            }
          })
          return
        }

        res.statusCode = 405
        res.end('Method not allowed')
      })

      server.middlewares.use('/api/verify-upstream', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end('Method not allowed')
        }

        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', async () => {
          try {
            const { provider, apiKey } = JSON.parse(body || '{}')
            const key = String(apiKey || '').trim()
            const p = String(provider || '').toLowerCase()
            const t0 = Date.now()

            if (!key) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              return res.end(JSON.stringify({ ok: false, error: 'API key is required' }))
            }

            let targetUrl = ''
            const headers: Record<string, string> = {}

            if (p === 'google') {
              targetUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`
            } else if (p === 'openai') {
              targetUrl = 'https://api.openai.com/v1/models'
              headers['Authorization'] = `Bearer ${key}`
            } else if (p === 'anthropic') {
              targetUrl = 'https://api.anthropic.com/v1/models'
              headers['x-api-key'] = key
              headers['anthropic-version'] = '2023-06-01'
            } else if (p === 'deepseek') {
              targetUrl = 'https://api.deepseek.com/models'
              headers['Authorization'] = `Bearer ${key}`
            } else if (p === 'mistral') {
              targetUrl = 'https://api.mistral.ai/v1/models'
              headers['Authorization'] = `Bearer ${key}`
            } else if (p === 'xai') {
              targetUrl = 'https://api.x.ai/v1/models'
              headers['Authorization'] = `Bearer ${key}`
            } else if (p === 'cohere') {
              targetUrl = 'https://api.cohere.com/v1/models'
              headers['Authorization'] = `Bearer ${key}`
            } else {
              targetUrl = 'https://api.openai.com/v1/models'
              headers['Authorization'] = `Bearer ${key}`
            }

            const ctrl = new AbortController()
            const timeout = setTimeout(() => ctrl.abort(), 6000)
            const upstreamRes = await fetch(targetUrl, { headers, signal: ctrl.signal }).finally(() => clearTimeout(timeout))
            const latency = Date.now() - t0

            res.setHeader('Content-Type', 'application/json')
            if (upstreamRes.ok) {
              return res.end(JSON.stringify({ ok: true, latency, status: upstreamRes.status }))
            } else {
              const errText = await upstreamRes.text().catch(() => '')
              let errMsg = `Upstream error HTTP ${upstreamRes.status}`
              try {
                const parsed = JSON.parse(errText)
                errMsg = parsed?.error?.message || parsed?.message || errMsg
              } catch {}
              return res.end(JSON.stringify({ ok: false, error: errMsg, status: upstreamRes.status }))
            }
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ ok: false, error: err.message || 'Handshake failed' }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), soloPairingPlugin()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('framer-motion')) return 'vendor-framer';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('@tanstack')) return 'vendor-tanstack';
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/gateway': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gateway/, ''),
      },
      '/v1': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
})
