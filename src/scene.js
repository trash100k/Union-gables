/* =========================================================================
   Gilded Dust — the hero's living, breathing Three.js scene.

   Sunlight caught in a grand parlor; fireflies over the gardens at dusk.
   Two layered point fields drift on stacked sine "breaths," twinkle, and
   answer to the cursor and the scroll. Deliberately abstract — atmosphere,
   not architecture — so it reads as luxury rather than literalism.
   ========================================================================= */
import * as THREE from 'three'

export function initScene(canvas) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x0a1a12, 0.055)

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  )
  camera.position.set(0, 0, 16)

  // ---- soft circular sprite, drawn once to a canvas texture ----
  const sprite = makeGlowTexture()

  // ---- Layer A: fine gold dust (many, small) ----
  const dust = makeField({
    count: reduce ? 900 : 2600,
    spread: new THREE.Vector3(46, 26, 26),
    size: 0.10,
    sprite,
    palette: [0xc5a253, 0xe7cf94, 0xf2ead7, 0xa8863f],
    breath: 1.0,
  })
  scene.add(dust.points)

  // ---- a faint gilded ring, very slow, like light off a chandelier ----
  const ringGeo = new THREE.TorusGeometry(9, 0.012, 8, 220)
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xc5a253,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI * 0.42
  scene.add(ring)

  // ---- interaction state ----
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  let scrollNorm = 0

  window.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2
  })
  // Once the reader is a viewport-and-a-quarter down, the scene has faded to
  // nothing (see uOpacity below) — so there's no reason to keep painting it.
  const inView = () => window.scrollY < window.innerHeight * 1.25
  window.addEventListener('scroll', () => {
    scrollNorm = Math.min(window.scrollY / window.innerHeight, 1.4)
    if (inView()) start()
    else stop()
  }, { passive: true })

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }
  window.addEventListener('resize', onResize)

  const clock = new THREE.Clock()

  function tick() {
    const t = clock.getElapsedTime()

    // breathe the field
    dust.material.uniforms.uTime.value = t

    // eased cursor parallax
    pointer.x += (pointer.tx - pointer.x) * 0.04
    pointer.y += (pointer.ty - pointer.y) * 0.04

    // slow ambient drift + cursor lean + a gentle scroll dolly
    const drift = reduce ? 0 : 1
    dust.points.rotation.y = t * 0.015 * drift + pointer.x * 0.18
    dust.points.rotation.x = pointer.y * 0.10
    ring.rotation.z = t * 0.05 * drift

    camera.position.x += (pointer.x * 1.4 - camera.position.x) * 0.03
    camera.position.y += (-pointer.y * 0.9 - camera.position.y) * 0.03
    camera.position.z = 16 + scrollNorm * 6
    camera.lookAt(0, 0, 0)

    // the canvas recedes as the reader moves into the house
    const fade = Math.max(0, 1 - scrollNorm * 0.85)
    dust.material.uniforms.uOpacity.value = fade
    ringMat.opacity = 0.12 * fade

    renderer.render(scene, camera)
    if (running) frame = requestAnimationFrame(tick)
  }

  let frame = 0
  let running = false
  function start() {
    if (running || document.hidden) return
    running = true
    clock.getDelta() // drop the idle gap so the drift resumes without a jump
    frame = requestAnimationFrame(tick)
  }
  function stop() {
    if (!running) return
    running = false
    cancelAnimationFrame(frame)
  }
  start()

  // pause when the tab is hidden; resume only if the hero is still in view
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
    else if (inView()) start()
  })

  return {
    destroy() {
      stop()
      window.removeEventListener('resize', onResize)
      dust.geometry.dispose(); dust.material.dispose()
      ringGeo.dispose(); ringMat.dispose()
      sprite.dispose()
      renderer.dispose()
    },
  }
}

/* ---- build one breathing point field ---- */
function makeField({ count, spread, size, sprite, palette, breath, softness = 1 }) {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const scales = new Float32Array(count)
  const c = new THREE.Color()

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * spread.x
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread.y
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread.z

    c.set(palette[(Math.random() * palette.length) | 0])
    colors[i * 3 + 0] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b

    seeds[i] = Math.random() * Math.PI * 2
    scales[i] = 0.5 + Math.random() * 1.0
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: size * renderHeightPR() },
      uBreath: { value: breath },
      uSoft: { value: softness },
      uOpacity: { value: 1 },
      uSprite: { value: sprite },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uSize;
      uniform float uBreath;
      attribute float aSeed;
      attribute float aScale;
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        vColor = color;
        vec3 p = position;
        // stacked "breaths" — the whole field swells and settles
        float b = uBreath;
        p.y += sin(uTime * 0.5 + aSeed) * 0.9 * b;
        p.x += cos(uTime * 0.35 + aSeed * 1.3) * 0.7 * b;
        p.z += sin(uTime * 0.4 + aSeed * 0.7) * 0.6 * b;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        // soft twinkle in brightness and size
        float tw = 0.6 + 0.4 * sin(uTime * 1.6 + aSeed * 3.1);
        vTwinkle = tw;
        gl_PointSize = uSize * aScale * tw * (300.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uSprite;
      uniform float uOpacity;
      uniform float uSoft;
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        vec4 tex = texture2D(uSprite, gl_PointCoord);
        float a = tex.a * uOpacity * (0.55 + 0.45 * vTwinkle);
        a *= uSoft;
        if (a < 0.01) discard;
        gl_FragColor = vec4(vColor, a);
      }
    `,
  })
  material.vertexColors = true

  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  return { points, geometry, material }
}

function renderHeightPR() {
  return Math.min(window.devicePixelRatio, 2) * 1.0 + 1.0
}

/* ---- soft radial glow sprite ---- */
function makeGlowTexture() {
  const s = 128
  const cnv = document.createElement('canvas')
  cnv.width = cnv.height = s
  const ctx = cnv.getContext('2d')
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0.0, 'rgba(255,255,255,1)')
  g.addColorStop(0.2, 'rgba(255,246,222,0.9)')
  g.addColorStop(0.5, 'rgba(230,203,148,0.35)')
  g.addColorStop(1.0, 'rgba(230,203,148,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  const tex = new THREE.CanvasTexture(cnv)
  tex.needsUpdate = true
  return tex
}
