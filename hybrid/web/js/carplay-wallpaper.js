/* ============ CarPlay Wallpaper SVG Generator ============
 * Génère le fond d'écran géométrique complexe (745×420 reference)
 * basé sur la description : zones turquoise/vert, bleu nuit, grand cercle bleu,
 * courbes diagonales, formes abstraites, dégradés profonds.
 */

export function generateWallpaperSVG() {
  const w = 745;
  const h = 420;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <!-- Dégradé principal zone sup-gauche (turquoise/vert foncé) -->
    <linearGradient id="grad-tl" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d3d3d"/>
      <stop offset="50%" stop-color="#0a2a2a"/>
      <stop offset="100%" stop-color="#061818"/>
    </linearGradient>

    <!-- Dégradé zone sup-droite (bleu nuit profond) -->
    <linearGradient id="grad-tr" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a1628"/>
      <stop offset="50%" stop-color="#06101e"/>
      <stop offset="100%" stop-color="#030810"/>
    </linearGradient>

    <!-- Grand cercle bleu inf-droit -->
    <radialGradient id="grad-circle" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
      <stop offset="0%" stop-color="#1a3a5c" stop-opacity="0.9"/>
      <stop offset="40%" stop-color="#122844" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#0a1a2e" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#050d18" stop-opacity="0.6"/>
    </radialGradient>

    <!-- Courbes diagonales - dégradés -->
    <linearGradient id="grad-diag1" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1a4a6a" stop-opacity="0.4"/>
      <stop offset="50%" stop-color="#103048" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#081824" stop-opacity="0.1"/>
    </linearGradient>

    <linearGradient id="grad-diag2" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#0d3d3d" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#0a2a2a" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#061818" stop-opacity="0.1"/>
    </linearGradient>

    <!-- Formes abstraites - lueurs -->
    <radialGradient id="glow-1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2a6a8a" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#1a3a5a" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="glow-2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1a5a4a" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#0a3a2a" stop-opacity="0"/>
    </radialGradient>

    <!-- Filtre flou doux pour profondeur -->
    <filter id="soft-blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="40" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <!-- Masque pour vignettage -->
    <radialGradient id="vignette" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="black" stop-opacity="0"/>
      <stop offset="70%" stop-color="black" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.45"/>
    </radialGradient>
  </defs>

  <!-- Fond de base -->
  <rect width="${w}" height="${h}" fill="#030810"/>

  <!-- Zone supérieure gauche - turquoise/vert foncé -->
  <path d="M0,0 L${w * 0.55},0 L${w * 0.45},${h * 0.55} L0,${h * 0.65} Z" fill="url(#grad-tl)" filter="url(#soft-blur)"/>

  <!-- Zone supérieure droite - bleu nuit -->
  <path d="M${w * 0.55},0 L${w},0 L${w},${h * 0.55} L${w * 0.45},${h * 0.55} Z" fill="url(#grad-tr)" filter="url(#soft-blur)"/>

  <!-- Courbe diagonale principale (descendante) -->
  <path d="M${w * -0.2},${h * 1.2} Q${w * 0.3},${h * 0.3} ${w * 1.2},${h * -0.2}" fill="none" stroke="url(#grad-diag1)" stroke-width="${h * 0.35}" opacity="0.6" filter="url(#soft-blur)"/>

  <!-- Courbe diagonale secondaire (montante) -->
  <path d="M${w * 1.2},${h * 1.2} Q${w * 0.7},${h * 0.4} ${w * -0.2},${h * -0.2}" fill="none" stroke="url(#grad-diag2)" stroke-width="${h * 0.28}" opacity="0.5" filter="url(#soft-blur)"/>

  <!-- Grand cercle bleu - coin inf-droit -->
  <circle cx="${w * 0.82}" cy="${h * 0.78}" r="${w * 0.42}" fill="url(#grad-circle)" filter="url(#soft-blur)"/>

  <!-- Formes abstraites géométriques - lueurs douces -->
  <ellipse cx="${w * 0.25}" cy="${h * 0.35}" rx="${w * 0.18}" ry="${h * 0.22}" fill="url(#glow-1)" filter="url(#soft-blur)"/>
  <ellipse cx="${w * 0.15}" cy="${h * 0.65}" rx="${w * 0.12}" ry="${h * 0.18}" fill="url(#glow-2)" filter="url(#soft-blur)"/>

  <!-- Accents triangulaires subtils -->
  <g opacity="0.15" filter="url(#soft-blur)">
    <polygon points="${w * 0.7},0 ${w * 0.9},${h * 0.15} ${w * 0.85},0" fill="#1a4a6a"/>
    <polygon points="0,${h * 0.3} ${w * 0.12},${h * 0.45} 0,${h * 0.6}" fill="#0d3d3d"/>
    <polygon points="${w},${h * 0.2} ${w * 0.88},${h * 0.35} ${w},${h * 0.5}" fill="#1a4a6a"/>
  </g>

  <!-- Lignes fines décoratives (style topographique) -->
  <g stroke="#1a3a5a" stroke-width="0.5" opacity="0.12" fill="none">
    <path d="M0,${h * 0.15} Q${w * 0.3},${h * 0.1} ${w},${h * 0.18}"/>
    <path d="M0,${h * 0.25} Q${w * 0.4},${h * 0.22} ${w},${h * 0.28}"/>
    <path d="M${w * 0.6},0 Q${w * 0.8},${h * 0.3} ${w * 0.9},${h * 0.5}"/>
    <path d="M${w * 0.2},${h} Q${w * 0.5},${h * 0.75} ${w * 0.8},${h * 0.9}"/>
  </g>

  <!-- Particules/lumière subtilles -->
  <g fill="#2a6a8a" opacity="0.08">
    <circle cx="${w * 0.32}" cy="${h * 0.22}" r="3"/>
    <circle cx="${w * 0.68}" cy="${h * 0.12}" r="2"/>
    <circle cx="${w * 0.45}" cy="${h * 0.48}" r="2.5"/>
    <circle cx="${w * 0.78}" cy="${h * 0.38}" r="1.5"/>
    <circle cx="${w * 0.18}" cy="${h * 0.78}" r="2"/>
    <circle cx="${w * 0.88}" cy="${h * 0.85}" r="3"/>
  </g>

  <!-- Vignettage global pour profondeur -->
  <rect width="${w}" height="${h}" fill="url(#vignette)"/>
</svg>`;
}