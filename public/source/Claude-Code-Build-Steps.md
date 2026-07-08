# CURATED BY MMJ — Claude Code Build Steps

You cloned the Lovable repo locally. Follow these **in order**. Each block is a prompt you paste into Claude Code in your terminal.

> **Before you start:** run `/help` (or your skills command) in Claude Code and note the exact names of your installed **UI/UX** and **web-3D** skills. Everywhere below you see `[uiux-skill]` or `[web3d-skill]`, replace it with the real name.

> **Assets:** copy the three cover textures into the repo at `public/textures/`:
> `cover_pink.jpg`, `cover_blue.jpg`, `cover_green.jpg`
> (These are straight-on flat covers made to wrap onto the 3D book. Pink is the hero.)

---

## STEP 0 — Audit (don't change anything yet)

```
Read the entire repo and report back only — no edits:
1. Framework, router, TypeScript yes/no.
2. Which of these are actually installed AND wired up (not just in package.json):
   GSAP, ScrollTrigger, Lenis, Framer Motion, React Three Fiber, Three.js, Drei.
3. Where the hero, any 3D scene, and the scroll sections currently live.
4. Anything Lovable faked (e.g. a static image where real 3D was intended,
   CSS pseudo-3D, placeholder loops).
Give me a short punch-list of what's missing vs a luxury 3D product site.
```

---

## STEP 1 — Foundation & smooth scroll

```
Set up the foundation cleanly, following [uiux-skill]:
- Install/verify Lenis and wire site-wide smooth scroll in the root layout.
- Install GSAP + ScrollTrigger and register them once in a shared client util.
- Create design tokens for the locked palette:
  blush #F8E6EC, blush-2 #F4D8DF, blue #0B5FA5, white #FFFFFF,
  footer-pink #EFC9D4. Map them to Tailwind theme + CSS vars.
- Body text color is the brand blue #0B5FA5, never black.
- Respect prefers-reduced-motion globally.
Keep everything componentized. Show me the file structure when done.
```

---

## STEP 2 — Pink-forward palette pass (less color, more space)

```
Using [uiux-skill], do a palette + spacing pass across the whole site:
- Make PINK the dominant identity. Blush #F8E6EC backgrounds, blush-2 accents.
- Use blue #0B5FA5 sparingly for ink, buttons, links only.
- Increase whitespace significantly; oversized editorial headings; generous
  line-height on body. Luxury = space and restraint, not more color.
- Do NOT introduce any color outside the token set.
Refactor, don't just override with !important. Report what changed.
```

---

## STEP 3 — The real 3D notebook (core task)

```
Using [web3d-skill] and React Three Fiber + Three.js + Drei, build a real 3D
notebook and reusable scene. Requirements:

Model:
- A hardcover book: a box with slightly rounded front-edge, visible spine,
  page block on the open side, and a thin satin ribbon bookmark hanging out
  the bottom.
- Front cover uses a texture map. Load the three covers from
  /public/textures/cover_pink.jpg, cover_blue.jpg, cover_green.jpg.
- Realistic-but-soft PBR material: low metalness, medium roughness, a subtle
  clear-ish sheen so it reads as a premium linen hardcover.

Lighting/stage:
- Soft studio lighting (key + soft fill + gentle rim). Soft contact shadow.
- Put the book standing upright on a premium circular pedestal, centered.
  The pedestal is a separate mesh and must stay perfectly still.

Make this a reusable <Notebook color="pink|blue|green" /> component plus a
<Scene/> wrapper. Lazy-load the canvas. Keep it 60fps.
Show me the component files.
```

---

## STEP 4 — Hero: float, mouse tilt, entrance

```
Using [web3d-skill] + GSAP, make the hero scene feel alive:
- Notebook slowly floats (gentle vertical bob + tiny rotation drift).
- Soft contact shadow reacts to the float.
- Mouse move tilts the notebook only 2–4 degrees; lighting/shadow shift
  slightly. Must feel physical, not gimmicky. Use a reusable useMagneticTilt hook.
- Entrance timeline ~2s, staggered luxury pacing:
  background fades -> logo fades -> headline reveals line-by-line (mask up)
  -> notebook scales 90%->100% -> ribbon eases into motion.
Disable heavy motion under prefers-reduced-motion.
```

---

## STEP 5 — Signature scroll: 360° + color morph (the centerpiece)

```
Using [web3d-skill] + GSAP ScrollTrigger, build the scroll-linked showcase.
The book stays centered on the pedestal; the pedestal never moves.

Pin the section and drive ONE scroll-linked timeline:
1. Rotate the notebook a full 360deg, rotation matched to scroll velocity.
2. Near the end, crossfade the cover material Pink -> Blue (no jump cut;
   blend the two textures over ~15% of the turn).
3. Another 360deg, crossfade Blue -> Green.
4. Another 360deg, crossfade Green -> Pink (back to start).

Camera: subtly orbit the virtual camera (tiny parallax + tiny zoom + tiny
lighting shift) rather than only spinning the mesh, for a cinematic feel.

Per color, fade in product copy: color name, short luxury description,
paper quality / cover material / ribbon / weight, and a Shop Now button.
Make the crossfade logic a reusable hook. Keep 60fps; test scrub both directions.
```

---

## STEP 6 — Animated fabric stripe background

```
Using [web3d-skill] (shader) with a CSS/SVG fallback, build the signature
background behind the hero:
- Vertical stripes alternating blush #F8E6EC / blush-2 #F4D8DF.
- A subtle noise-based displacement so the stripes ripple like satin in a light
  breeze, plus an almost-imperceptible horizontal drift. Very low amplitude,
  very slow, no visible loop seam. Users should feel it subconsciously.
- Cheap enough to keep 60fps; provide a static gradient fallback on mobile and
  under prefers-reduced-motion.
Make it a reusable <FabricBackground/> component.
```

---

## STEP 7 — Editorial type, video frame, testimonials, footer

```
Using [uiux-skill] + GSAP/Framer Motion:
- Editorial typography moment: oversized magazine type, mask/letter reveals,
  one subtle overlapping marquee text loop.
- Video section: a floating luxury frame (rounded corners, soft glass
  reflection, subtle float, slight scale-on-scroll). Autoplay muted loop.
  Leave a clean placeholder <video> — I will supply the file. Do not generate one.
- Testimonials: cards like printed paper, soft shadow, gentle hover lift.
- Footer as a luxury ending: huge CURATED / BY MMJ type nearly touching the
  edges, background shifts to footer-pink #EFC9D4, soft animated grain, a very
  slow ribbon drifting across, newsletter inside a glass panel, social icons
  animate on hover, small elegant copyright.
```

---

## STEP 8 — Shop, Product, Cart, Checkout

```
Using [uiux-skill] (+ [web3d-skill] on the product page):

SHOP: minimal luxury grid, 3 large product cards (Pink, Blue, Green), little
text. Hover: notebook lifts slowly, shadow grows, image shifts angle, ribbon
nudges, Shop Now button slides up.

PRODUCT PAGE: reuse the 3D <Notebook/> in a viewer with rotate + zoom and a
Pink/Blue/Green color selector that reuses the crossfade logic. Luxury type,
lots of space, details (paper, cover, ribbon, weight, dimensions), Add to Cart.

CART: floating right side drawer, glass effect, smooth open/close, micro-
interactions on qty/remove/subtotal.

CHECKOUT: Apple-style single column — contact -> shipping -> payment -> review,
inline validation, calm spacing, fast and clean.
```

---

## STEP 9 — Mobile + performance lock

```
Using [uiux-skill] + [web3d-skill]:
- Full responsive pass. On mobile, swap the live 3D scene for a lighter path
  (pre-rendered image sequence or reduced canvas) so we never drop frames;
  keep the fabric ripple cheap; preserve the feel.
- Audit for a locked 60fps: dispose Three resources, lazy-load canvas, memoize,
  avoid layout thrash. Confirm prefers-reduced-motion kills heavy motion.
- Final accessibility + SEO pass: semantic HTML, focus states, alt text,
  metadata + Open Graph.
Give me a before/after performance note.
```

---

### Tips
- Commit after each step (`git add -A && git commit -m "step N"`), so you can roll back cleanly.
- If a skill isn't triggering, name it explicitly: "Use the [web3d-skill] skill for this."
- Do steps 3–5 carefully and in order — they're what wins the pitch. The rest is polish.
