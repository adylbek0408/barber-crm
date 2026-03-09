/**
 * Генератор PNG иконок для PWA
 * Запуск: node generate-icons.mjs
 * Требует: npm install canvas  (один раз)
 */
import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'public/icons')
mkdirSync(OUT, { recursive: true })

function drawIcon(ctx, size, maskable = false) {
  const s = size
  const scale = maskable ? 0.75 : 0.88
  const pad = (s - s * scale) / 2

  // Фон
  ctx.fillStyle = '#09090b'
  if (!maskable) {
    // Скруглённые углы для обычной иконки
    const r = s * 0.19
    ctx.beginPath()
    ctx.moveTo(r, 0)
    ctx.lineTo(s - r, 0)
    ctx.quadraticCurveTo(s, 0, s, r)
    ctx.lineTo(s, s - r)
    ctx.quadraticCurveTo(s, s, s - r, s)
    ctx.lineTo(r, s)
    ctx.quadraticCurveTo(0, s, 0, s - r)
    ctx.lineTo(0, r)
    ctx.quadraticCurveTo(0, 0, r, 0)
    ctx.closePath()
    ctx.fill()
  } else {
    ctx.fillRect(0, 0, s, s)
  }

  // Центр иконки — ножницы барбера
  ctx.save()
  ctx.translate(s / 2, s / 2)
  ctx.scale(scale * s / 512, scale * s / 512)

  const lw = 20
  ctx.strokeStyle = '#f8fafc'
  ctx.lineWidth = lw
  ctx.lineCap = 'round'

  // Левая ручка ножниц (круг)
  ctx.beginPath()
  ctx.arc(-70, -70, 32, 0, Math.PI * 2)
  ctx.stroke()

  // Правая ручка ножниц (круг)
  ctx.beginPath()
  ctx.arc(70, -70, 32, 0, Math.PI * 2)
  ctx.stroke()

  // Лезвие 1
  ctx.beginPath()
  ctx.moveTo(-52, -52)
  ctx.lineTo(90, 90)
  ctx.stroke()

  // Лезвие 2
  ctx.beginPath()
  ctx.moveTo(52, -52)
  ctx.lineTo(-90, 90)
  ctx.stroke()

  // Точка пересечения
  ctx.fillStyle = '#f8fafc'
  ctx.beginPath()
  ctx.arc(0, 20, 12, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()

  // Золотая полоска внизу (имитация расчёски)
  ctx.fillStyle = '#d4a843'
  const barW = s * 0.39
  const barH = s * 0.03
  const barX = (s - barW) / 2
  const barY = s * 0.79
  const barR = barH / 2
  ctx.beginPath()
  ctx.moveTo(barX + barR, barY)
  ctx.lineTo(barX + barW - barR, barY)
  ctx.quadraticCurveTo(barX + barW, barY, barX + barW, barY + barR)
  ctx.lineTo(barX + barW, barY + barH - barR)
  ctx.quadraticCurveTo(barX + barW, barY + barH, barX + barW - barR, barY + barH)
  ctx.lineTo(barX + barR, barY + barH)
  ctx.quadraticCurveTo(barX, barY + barH, barX, barY + barH - barR)
  ctx.lineTo(barX, barY + barR)
  ctx.quadraticCurveTo(barX, barY, barX + barR, barY)
  ctx.closePath()
  ctx.fill()
}

const icons = [
  { name: 'icon-192.png',          size: 192, maskable: false },
  { name: 'icon-512.png',          size: 512, maskable: false },
  { name: 'icon-maskable-192.png', size: 192, maskable: true  },
  { name: 'icon-maskable-512.png', size: 512, maskable: true  },
]

for (const { name, size, maskable } of icons) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  drawIcon(ctx, size, maskable)
  const buf = canvas.toBuffer('image/png')
  writeFileSync(join(OUT, name), buf)
  console.log(`✅ ${name} (${size}x${size})`)
}

console.log('\n🎉 Все иконки созданы в public/icons/')
