import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'

export default function Home() {
  return (
    <>
      <Head>
        <title>Hiran: Jungle ka Beej-Vitaran (Seed Dispersal)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Hiran (deer) 80 km/h speed, seed dispersal, and swimming spread ? Hindi interactive explainer" />
      </Head>
      <main className="container">
        <header className="header">
          <div className="logo" />
          <div className="brand">
            <div className="title">Hiran: Jungle Ka Beej-Vitarak</div>
            <div className="subtitle">Seed dispersal ? Ecology ? Hindi Interactive</div>
          </div>
        </header>

        <section className="hero">
          <article className="card">
            <h1 className="h1">Subah ki narm roshni me Hiran</h1>
            <p>
              80 km/h ki tez raftaar se daudne wala yeh mammal, subah ki soft roshni me jungle
              ke jhadiyon ke beech se bahar nikalta hai. Ghass, patte, phool aur fal se apna pet bharta hai.
              Isi dauran paudhon ke beej uski khurduri khhaal aur baalon se chipak jaate hain.
            </p>
            <p>
              Jab woh harkat karta hai, daudta ya jhadiyon se guzarta hai, to ye beej zameen par girte rehte hain.
              Aage chalkar wahi beej naye paudhon ka roop le lete hain. Sirf itna hi nahi, hiran bahut achha
              tairak (swimmer) bhi hota hai. Jab woh pani me tair kar paar nikalta hai, to uske saath gaye beej
              nayi jagahon par ugte hain ? is tarah na keval paudhe failte hain balki jungle ka area bhi dheere-dheere badhta hai.
            </p>
            <div className="facts">
              <div className="fact"><b>80 km/h</b>Tez raftaar daud</div>
              <div className="fact"><b>Seed Dispersal</b>Beej chipak-kar girte</div>
              <div className="fact"><b>Strong Swimmer</b>Pani ke paar beej</div>
            </div>
            <div className="legend">Neeche simulation me dekhein kaise beej failte hain.</div>
          </article>

          <aside className="card">
            <SeedSimulation />
          </aside>
        </section>

        <p className="footer">? {new Date().getFullYear()} Jungle Ecology ? Built for Vercel</p>
      </main>
    </>
  )
}

function SeedSimulation() {
  const canvasRef = useRef(null)
  const requestRef = useRef(null)
  const [running, setRunning] = useState(false)
  const [speedKph, setSpeedKph] = useState(40) // default speed
  const [swimMode, setSwimMode] = useState(false)
  const [resetFlag, setResetFlag] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const width = canvas.width
    const height = canvas.height

    // World layout
    const groundY = height * 0.72
    const riverY = height * 0.38

    // Entities
    const deer = {
      x: 40,
      y: groundY - 18,
      vx: 0.0,
      radius: 12,
      seedsCarried: 0,
    }

    /**
     * Each seed has: x, y, age, planted, sprouted
     */
    const seeds = []
    const plants = []

    let lastTime = performance.now()

    function kphToPxPerSec(kph) {
      // Arbitrary: map 80 kph -> ~280 px/s for pleasant animation
      return (kph / 80) * 280
    }

    function drawBackground() {
      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height)
      grad.addColorStop(0, '#071427')
      grad.addColorStop(0.5, '#0a1f3f')
      grad.addColorStop(1, '#0b213b')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      // Sun glow (soft morning light)
      ctx.beginPath()
      ctx.arc(width * 0.15, height * 0.18, 46, 0, Math.PI * 2)
      const sun = ctx.createRadialGradient(width * 0.15, height * 0.18, 6, width * 0.15, height * 0.18, 60)
      sun.addColorStop(0, 'rgba(255, 240, 180, 0.85)')
      sun.addColorStop(1, 'rgba(255, 240, 180, 0.0)')
      ctx.fillStyle = sun
      ctx.fill()

      // River stripe when swimMode
      if (swimMode) {
        ctx.fillStyle = 'rgba(64, 186, 235, 0.25)'
        ctx.fillRect(0, riverY - 24, width, 48)
        // river ripples
        ctx.strokeStyle = 'rgba(160, 220, 255, 0.25)'
        ctx.lineWidth = 1
        for (let i = 0; i < 6; i++) {
          ctx.beginPath()
          const y = riverY - 20 + i * 8
          ctx.moveTo(10, y)
          for (let x = 10; x < width - 10; x += 24) {
            ctx.quadraticCurveTo(x + 8, y + 2, x + 16, y)
          }
          ctx.stroke()
        }
      }

      // Ground
      ctx.fillStyle = '#0d2a22'
      ctx.fillRect(0, groundY, width, height - groundY)

      // Shrubs
      ctx.fillStyle = 'rgba(77, 219, 166, 0.12)'
      for (let i = 0; i < 12; i++) {
        const sx = (i * 83) % (width + 60) - 30
        const sy = groundY - 10 - (i % 3) * 6
        ctx.beginPath()
        ctx.ellipse(sx, sy, 24, 12, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function drawDeer() {
      // Body
      ctx.beginPath()
      ctx.fillStyle = '#c49a6c'
      ctx.arc(deer.x, deer.y, deer.radius, 0, Math.PI * 2)
      ctx.fill()
      // Head
      ctx.beginPath()
      ctx.arc(deer.x + 16, deer.y - 10, 8, 0, Math.PI * 2)
      ctx.fill()
      // Ear
      ctx.beginPath()
      ctx.fillStyle = '#d8b892'
      ctx.ellipse(deer.x + 20, deer.y - 16, 3, 5, 0.6, 0, Math.PI * 2)
      ctx.fill()
      // Legs
      ctx.strokeStyle = '#9b7a52'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(deer.x - 6, deer.y + deer.radius)
      ctx.lineTo(deer.x - 8, deer.y + deer.radius + 10)
      ctx.moveTo(deer.x + 4, deer.y + deer.radius)
      ctx.lineTo(deer.x + 6, deer.y + deer.radius + 10)
      ctx.stroke()

      // Seeds carried indicator
      if (deer.seedsCarried > 0) {
        ctx.fillStyle = '#90e0ef'
        ctx.font = '12px Inter, sans-serif'
        ctx.fillText(`Beej: ${deer.seedsCarried}`, deer.x - 20, deer.y - 20)
      }
    }

    function maybePickSeeds() {
      // Randomly add seeds to deer when moving on land
      if (!swimMode && Math.random() < 0.05) {
        deer.seedsCarried += 1
      }
    }

    function maybeDropSeeds() {
      // Drop seeds with small probability; in swim mode, drop ahead after crossing
      if (deer.seedsCarried <= 0) return
      const dropChance = swimMode ? 0.03 : 0.06
      if (Math.random() < dropChance) {
        deer.seedsCarried -= 1
        const spread = swimMode ? 30 : 14
        const sx = deer.x + (Math.random() * spread - spread / 2) + (swimMode ? 26 : 0)
        const sy = (swimMode ? riverY + 30 : deer.y + deer.radius)
        seeds.push({ x: sx, y: sy, age: 0, planted: true, sprouted: false })
      }
    }

    function update(dt) {
      deer.vx = kphToPxPerSec(speedKph)
      deer.x += deer.vx * dt
      // Wrap around
      if (deer.x > width + 40) deer.x = -40

      // Vertical position: swim vs land
      deer.y = swimMode ? riverY : groundY - 18

      // Seed lifecycle
      for (const s of seeds) {
        s.age += dt
        if (s.planted && !s.sprouted && s.age > 2.5) {
          s.sprouted = true
          plants.push({ x: s.x, y: s.y })
        }
      }

      // Occasionally pick up or drop seeds
      maybePickSeeds()
      maybeDropSeeds()
    }

    function drawSeedsAndPlants() {
      // Seeds
      for (const s of seeds) {
        ctx.beginPath()
        ctx.fillStyle = s.sprouted ? 'transparent' : '#a8dadc'
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2)
        ctx.fill()
      }

      // Plants (simple sprout)
      for (const p of plants) {
        ctx.strokeStyle = '#4ddba6'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x, p.y - 12)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(p.x, p.y - 12)
        ctx.quadraticCurveTo(p.x - 6, p.y - 18, p.x - 2, p.y - 12)
        ctx.moveTo(p.x, p.y - 12)
        ctx.quadraticCurveTo(p.x + 6, p.y - 18, p.x + 2, p.y - 12)
        ctx.stroke()
      }
    }

    function frame(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000)
      lastTime = now

      drawBackground()
      update(dt)
      drawSeedsAndPlants()
      drawDeer()

      if (running) requestRef.current = requestAnimationFrame(frame)
    }

    // Start/Stop
    if (running) {
      lastTime = performance.now()
      requestRef.current = requestAnimationFrame(frame)
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
      drawBackground()
      drawSeedsAndPlants()
      drawDeer()
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [running, speedKph, swimMode, resetFlag])

  function resetWorld() {
    setResetFlag((x) => x + 1)
  }

  return (
    <div>
      <div className="canvasWrap">
        <div className="badge">Simulation: Beej Vitaran</div>
        <canvas ref={canvasRef} width={640} height={440} />
      </div>
      <div className="controls">
        <button className={`button ${running ? 'warn' : 'primary'}`} onClick={() => setRunning(!running)}>
          {running ? 'Rokien' : 'Chalayen'}
        </button>
        <button className="button" onClick={() => setSwimMode((s) => !s)}>
          {swimMode ? 'Swim OFF' : 'Swim ON'}
        </button>
        <button className="button" onClick={resetWorld}>Reset</button>
      </div>
      <div className="legend">Raftaar (km/h): {speedKph}</div>
      <input
        className="range"
        type="range"
        min={5}
        max={80}
        value={speedKph}
        onChange={(e) => setSpeedKph(parseInt(e.target.value, 10))}
      />
      <p className="legend">
        Swim ON par beej nadi ke us paar zyada door tak girte hain, jisse naye paudhe ug kar
        jungle ka kshetra badhata hai.
      </p>
    </div>
  )
}
