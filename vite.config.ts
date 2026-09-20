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
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), soloPairingPlugin()],
})
