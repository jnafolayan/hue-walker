let canvas, ctx
let filled = [[0,0,0]], walkers = []
const directions = [[1,0],[0,1],[-1,0],[0,-1]]
const seen = {
  '0_0': 1
}

let thinkingDelay = 0
let lastTick, time, dt, tick


let width = 640
let height = 480
let screenRatio = width / height

let cellSize = 10
if (window.innerWidth < 480) {
  cellSize = 8;
}

init()

function initCanvas() {
  canvas = document.getElementById('board')
  ctx = canvas.getContext('2d', { transparent: true })

  resizeCanvas()
}

function resizeCanvas() {
  let w = window.innerWidth
  let h = window.innerHeight
  if (w > h) {
    h *= 0.9
    // w = h / screenRatio
    w = h
  } else {
    w *= 0.9
    // h = w * screenRatio
    h = w
  }
  w = width = window.innerWidth
  h = height = window.innerHeight
  canvas.width = width
  canvas.height = height
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
}

function registerEvents() {
  window.addEventListener('resize', resizeCanvas)
}

function renderGrid() {

}

function renderWalkers() {
  for (const walker of walkers) {
    const cx = walker[0] + cellSize / 2 | 0
    const cy = walker[1] + cellSize / 2 | 0
    ctx.fillStyle = `hsl(${walker[3]}, 100%, 55%)`
    ctx.fillRect(-cx, -cy, cellSize, cellSize)
  }
}

function renderFilled() {
  ctx.fillStyle = '#ccc'
  let x, y, hue
  for (const cell of filled) {
    x = cell[0]
    y = cell[1]
    hue = (x * y) / (width / 2 * height / 2) * 360 | 0
    hue += Math.sin(tick / 80) * 100
    while (hue < 0) {
      hue += 180
    }
    while (hue > 360) {
      hue -= 180
    }
    // hue = cell[2]
    ctx.fillStyle = `hsl(${hue}, 100%, 55%)`
    ctx.fillRect(-(x + cellSize / 2) | 0, -(y + cellSize / 2) | 0, cellSize, cellSize)
  }
}

function updateWalkers() {
  let x, y, dir, str, tries
  for (const walker of walkers) {
    if (walker[2] < thinkingDelay) {
      walker[2] += dt
      continue
    }
    walker[2] = 0
    tries = 4
    do {
      dir = directions[rand(directions.length) | 0]
      x = walker[0] + dir[0] * cellSize
      y = walker[1] + dir[1] * cellSize
      str = `${x}_${y}`
      tries--
    } while (tries > 0 && seen.hasOwnProperty(str))

    if (x < -width / 2 || x > width / 2 || y < -height / 2 || y > height / 2) {
      continue
    }

    walker[0] = x
    walker[1] = y
    if (!seen.hasOwnProperty(str)) {
      filled.push([x, y, walker[3]])
      seen[str] = 1
    }
  }
}

function update() {
  updateWalkers()
}

function render() {
  ctx.save()
  ctx.fillStyle = 'rgb(0,0,0)'
  ctx.fillRect(0, 0, width, height)
  ctx.translate(width / 2, height / 2)
  renderGrid()
  renderWalkers()
  ctx.globalCompositeOperation = 'lighter'
  renderFilled()
  ctx.restore()
}

function gameLoop() {
  time = new Date().getTime()
  dt = (time - (lastTick || time)) / 1000
  tick++
  update()
  render()

  lastTick = time
  requestAnimationFrame(gameLoop)
}

function init() {
  initCanvas()
  registerEvents()

  walkers = []
  const l = 30
  for (let i = 0; i < l; i++) {
    walkers.push([0,0,0,(i / l * 360) | 0])
  }

  tick = 0
  gameLoop()
}

// utils
function rand(a, b) {
  if (!a && !b) {
    a = 0
    b = 1
  } else if (!b) {
    b = a
    a = 0
  }
  return a + Math.random() * (b - a)
}