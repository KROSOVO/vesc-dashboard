/* ============ CarPlay App Icons — SVG reconstruits fidèlement ============
 * 10 icônes officielles style iOS : carré, coins arrondis (16px à 68px),
 * dégradés saturés, symboles centrés, ombres subtiles.
 * Chaque icône est une fonction qui retourne un SVG string pour la taille demandée.
 */

const ICON_SIZE = 68; // taille de référence
const ICON_RADIUS = 16;

/* ---- Utilitaires ---- */
function iconWrapper(svgContent, bgGradient, size = ICON_SIZE, radius = ICON_RADIUS) {
  const shadow = `<filter id="icon-shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.3)"/>
    <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.2)"/>
  </filter>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">${bgGradient}</linearGradient>
    ${shadow}
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)" filter="url(#icon-shadow)"/>
  ${svgContent}
</svg>`;
}

/* ---- 1. TÉLÉPHONE : fond vert, combiné blanc ---- */
export function iconPhone(size = ICON_SIZE) {
  const r = ICON_RADIUS * size / ICON_SIZE;
  const s = size * 0.52;
  const cx = size / 2;
  const cy = size / 2;
  return iconWrapper(
    `<g transform="translate(${cx - s/2}, ${cy - s/2}) scale(${s/24})">
      <path fill="#fff" d="M17.5,1.5C12.2,1.5,8,5.7,8,11c0,3.7,2.1,6.9,5.2,8.4c0.3,0.1,0.5,0.4,0.5,0.7v3H9.3c-0.6,0-1,0.4-1,1s0.4,1,1,1h6c0.6,0,1-0.4,1-1s-0.4-1-1-1h-2.2v-3c0-0.3,0.2-0.6,0.5-0.7C19.9,17.9,22,14.7,22,11C22,5.7,17.8,1.5,12.5,1.5L17.5,1.5z M12.5,3c3.9,0,7,3.1,7,7s-3.1,7-7,7s-7-3.1-7-7S8.6,3,12.5,3L12.5,3z"/>
      <path fill="#fff" d="M12.5,5c2.8,0,5,2.2,5,5s-2.2,5-5,5s-5-2.2-5-5S9.7,5,12.5,5L12.5,5z M12.5,7c-1.7,0-3,1.3-3,3s1.3,3,3,3s3-1.3,3-3S14.2,7,12.5,7L12.5,7z"/>
    </g>`,
    `<stop offset="0%" stop-color="#34c759"/><stop offset="100%" stop-color="#28a745"/>`,
    size, r
  );
}

/* ---- 2. MUSIQUE : fond rose/rouge, note blanche ---- */
export function iconMusic(size = ICON_SIZE) {
  const r = ICON_RADIUS * size / ICON_SIZE;
  const s = size * 0.55;
  const cx = size / 2;
  const cy = size / 2;
  return iconWrapper(
    `<g transform="translate(${cx - s/2}, ${cy - s/2}) scale(${s/24})">
      <path fill="#fff" d="M12,3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7c0-1.1-.9-2-2-2zm9.5,9.5c-.35.38-.9.45-1.35.2-.54-.3-1.14-.84-1.6-1.58C16.5,8.12 14.26,7 12,7c-3.25,0-6,2.75-6,6s2.75,6 6,6c2.26,0 4.25-1.12 5.35-2.78.45-.74.35-1.75-.2-2.1-.64-.42-1.5-.45-2.15-.1-1.6.49-2.84 1.78-2.84 3.35 0 2.76 2.24 5 5 5 1.84 0 3.45-1.07 4.25-2.5.5-.88.25-1.95-.5-2.5z"/>
    </g>`,
    `<stop offset="0%" stop-color="#ff2d55"/><stop offset="100%" stop-color="#e01e4a"/>`,
    size, r
  );
}

/* ---- 3. PLANS : fond multicolore (bleu/vert/rouge), flèche ---- */
export function iconMaps(size = ICON_SIZE) {
  const r = ICON_RADIUS * size / ICON_SIZE;
  const s = size * 0.58;
  const cx = size / 2;
  const cy = size / 2;
  return iconWrapper(
    `<g transform="translate(${cx - s/2}, ${cy - s/2}) scale(${s/24})">
      <!-- Route -->
      <path fill="#fff" opacity="0.9" d="M12,0.5C6.48,0.5 2,4.98 2,10.5S6.48,20.5 12,20.5s10-4.48 10-10S17.52,0.5 12,0.5z M12,2c5.52,0 10,4.48 10,10s-4.48,10-10,10S2,16.52 2,11S6.48,2 12,2z"/>
      <!-- Flèche blanche -->
      <path fill="#007aff" d="M12,4.5c-1.65,0-3,1.35-3,3s1.35,3 3,3 3-1.35 3-3-1.35-3-3-3m0,10c-3.86,0-7-3.14-7-7s3.14-7 7-7 7,3.14 7,7-3.14,7-7,7z"/>
      <path fill="#34c759" d="M19.5,10.5c0,1.65-1.35,3-3,3s-3-1.35-3-3 1.35-3 3-3 3,1.35 3,3z"/>
      <path fill="#ff2d55" d="M4.5,10.5c0-1.65 1.35-3 3-3s3,1.35 3,3-1.35,3-3,3-3-1.35-3-3z"/>
      <!-- Aiguille boussole -->
      <g fill="#fff">
        <path d="M12,7.5 L11.5,10.5 L12.5,10.5 Z"/>
        <path d="M12,16.5 L11.5,13.5 L12.5,13.5 Z"/>
        <path d="M7.5,12 L10.5,11.5 L10.5,12.5 Z"/>
        <path d="M16.5,12 L13.5,11.5 L13.5,12.5 Z"/>
      </g>
    </g>`,
    `<stop offset="0%" stop-color="#007aff"/><stop offset="50%" stop-color="#34c759"/><stop offset="100%" stop-color="#ff2d55"/>`,
    size, r
  );
}

/* ---- 4. MESSAGES : fond vert, bulle blanche ---- */
export function iconMessages(size = ICON_SIZE) {
  const r = ICON_RADIUS * size / ICON_SIZE;
  const s = size * 0.55;
  const cx = size / 2;
  const cy = size / 2;
  return iconWrapper(
    `<g transform="translate(${cx - s/2}, ${cy - s/2}) scale(${s/24})">
      <path fill="#fff" d="M20,2H4c-1.1,0-2,0.9-2,2v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z M10,14.5c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S10.83,14.5,10,14.5z M17,14.5c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S17.83,14.5,17,14.5z M6,11.5c-0.83,0-1.5-0.67-1.5-1.5S5.17,8.5,6,8.5s1.5,0.67,1.5,1.5S6.83,11.5,6,11.5z M22,12h-4v-3c0-1.66-1.34-3-3-3h-3c-1.66,0-3,1.34-3,3v3H2v3h16v3c0,1.66,1.34,3,3,3h3c1.66,0,3-1.34,3-3v-3h4V12z"/>
    </g>`,
    `<stop offset="0%" stop-color="#34c759"/><stop offset="100%" stop-color="#28a745"/>`,
    size, r
  );
}

/* ---- 5. À L'ÉCOUTE : fond blanc, forme d'onde colorée ---- */
export function iconNowPlaying(size = ICON_SIZE) {
  const r = ICON_RADIUS * size / ICON_SIZE;
  const s = size * 0.6;
  const cx = size / 2;
  const cy = size / 2;
  return iconWrapper(
    `<g transform="translate(${cx - s/2}, ${cy - s/2}) scale(${s/24})">
      <g fill="none" stroke-width="2.5" stroke-linecap="round">
        <path stroke="#ff2d55" d="M7,17 Q9,9 12,5"/>
        <path stroke="#ff9f0a" d="M10,17 Q11,11 12,8"/>
        <path stroke="#34c759" d="M13,17 Q12,13 12,11"/>
        <path stroke="#007aff" d="M16,17 Q13,15 12,14"/>
        <path stroke="#af52de" d="M19,17 Q15,13 12,17"/>
      </g>
    </g>`,
    `<stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#f0f0f0"/>`,
    size, r
  );
}

/* ---- 6. PODCASTS : fond violet, symbole podcast ---- */
export function iconPodcasts(size = ICON_SIZE) {
  const r = ICON_RADIUS * size / ICON_SIZE;
  const s = size * 0.55;
  const cx = size / 2;
  const cy = size / 2;
  return iconWrapper(
    `<g transform="translate(${cx - s/2}, ${cy - s/2}) scale(${s/24})">
      <g fill="#fff">
        <path d="M12,3c-4.97,0-9,4.03-9,9s4.03,9 9,9s9-4.03 9-9S16.97,3 12,3z M12,19c-3.87,0-7-3.13-7-7s3.13-7 7-7s7,3.13 7,7S15.87,19 12,19z"/>
        <path d="M9,10c0,1.66 1.34,3 3,3s3-1.34 3-3S14.66,7 12,7c-1.66,0-3,1.34-3,3z"/>
        <circle cx="16.5" cy="7.5" r="1.5"/>
        <path d="M16.5,10.5c0,1.66-1.34,3-3,3s-3-1.34-3-3 1.34-3 3-3c0.83,0 1.55,0.34 2.08,0.88L17,9.5c-0.83-0.75-2.08-1.25-3.5-1.25-1.93,0-3.5,1.57-3.5,3.5s1.57,3.5 3.5,3.5c1.42,0 2.6-0.5 3.5-1.25l-1.42-1.42C15.55,12.66 14.83,13 14,13c-1.1,0-2-0.9-2-2s0.9-2 2-2c0.55,0 1.02,0.2 1.35,0.5L14.5,9.5C14.15,9.15 13.58,9 13,9c-1.66,0-3,1.34-3,3s1.34,3 3,3 3-1.34 3-3z"/>
      </g>
    </g>`,
    `<stop offset="0%" stop-color="#af52de"/><stop offset="100%" stop-color="#9a3fd8"/>`,
    size, r
  );
}

/* ---- 7. LIVRES AUDIO : fond orange, livre ouvert ---- */
export function iconAudiobooks(size = ICON_SIZE) {
  const r = ICON_RADIUS * size / ICON_SIZE;
  const s = size * 0.55;
  const cx = size / 2;
  const cy = size / 2;
  return iconWrapper(
    `<g transform="translate(${cx - s/2}, ${cy - s/2}) scale(${s/24})">
      <g fill="#fff">
        <path d="M19,3H5c-1.1,0-2,0.9-2,2v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M19,19H5V5h14v14z"/>
        <path d="M12.5,7.5c-0.83,0-1.5,0.67-1.5,1.5S11.67,10.5 12.5,10.5s1.5-0.67 1.5-1.5S13.33,7.5 12.5,7.5z M12.5,12.5c-0.83,0-1.5,0.67-1.5,1.5S11.67,15.5 12.5,15.5s1.5-0.67 1.5-1.5S13.33,12.5 12.5,12.5z M9.5,7.5c-0.83,0-1.5,0.67-1.5,1.5S8.67,10.5 9.5,10.5s1.5-0.67 1.5-1.5S10.33,7.5 9.5,7.5z M9.5,12.5c-0.83,0-1.5,0.67-1.5,1.5S8.67,15.5 9.5,15.5s1.5-0.67 1.5-1.5S10.33,12.5 9.5,12.5z"/>
      </g>
    </g>`,
    `<stop offset="0%" stop-color="#ff9f0a"/><stop offset="100%" stop-color="#e08900"/>`,
    size, r
  );
}

/* ---- 8. MÉTÉO : fond bleu, nuage + soleil ---- */
export function iconWeather(size = ICON_SIZE) {
  const r = ICON_RADIUS * size / ICON_SIZE;
  const s = size * 0.58;
  const cx = size / 2;
  const cy = size / 2;
  return iconWrapper(
    `<g transform="translate(${cx - s/2}, ${cy - s/2}) scale(${s/24})">
      <g fill="#fff">
        <path d="M19,11c0-2.76-2.24-5-5-5S9,8.24 9,11c0,1.17 0.55,2.18 1.39,2.79L7,17c0,1.1 0.9,2 2,2h10c1.1,0 2-0.9 2-2v-4c0-0.55-0.45-1-1-1s-1,0.45-1,1v4H9.82C8.38,15.45 7.5,13.54 7.5,11C7.5,6.58 11.08,3 15.5,3S23.5,6.58 23.5,11H19z"/>
        <circle cx="17" cy="7" r="2" fill="#ff9f0a"/>
        <g stroke="#ff9f0a" stroke-width="1.5" stroke-linecap="round">
          <line x1="17" y1="3" x2="17" y2="4.5"/>
          <line x1="17" y1="9.5" x2="17" y2="11"/>
          <line x1="13.5" y1="7" x2="15" y2="7"/>
          <line x1="19" y1="7" x2="20.5" y2="7"/>
          <line x1="14.5" y1="4.5" x2="15.5" y2="5.5"/>
          <line x1="18.5" y1="8.5" x2="19.5" y2="9.5"/>
          <line x1="14.5" y1="9.5" x2="15.5" y2="8.5"/>
          <line x1="18.5" y1="4.5" x2="19.5" y2="5.5"/>
        </g>
      </g>
    </g>`,
    `<stop offset="0%" stop-color="#007aff"/><stop offset="100%" stop-color="#0066cc"/>`,
    size, r
  );
}

/* ---- 9. CALENDRIER : fond blanc, date rouge + chiffre ---- */
export function iconCalendar(size = ICON_SIZE) {
  const r = ICON_RADIUS * size / ICON_SIZE;
  const s = size * 0.55;
  const cx = size / 2;
  const cy = size / 2;
  return iconWrapper(
    `<g transform="translate(${cx - s/2}, ${cy - s/2}) scale(${s/24})">
      <g fill="#fff">
        <rect x="5" y="4" width="14" height="16" rx="1" fill="#ff3b30"/>
        <rect x="5" y="4" width="14" height="5" rx="1" fill="#ff3b30"/>
        <text x="12" y="7.8" font-size="3.5" font-weight="700" fill="#fff" text-anchor="middle" font-family="SF Pro, sans-serif">24</text>
        <rect x="6" y="11" width="12" height="8" fill="#f0f0f0" rx="0.5"/>
        <line x1="8" y1="13" x2="16" y2="13" stroke="#ddd" stroke-width="0.5"/>
        <line x1="8" y1="15" x2="16" y2="15" stroke="#ddd" stroke-width="0.5"/>
        <line x1="8" y1="17" x2="16" y2="17" stroke="#ddd" stroke-width="0.5"/>
      </g>
    </g>`,
    `<stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#f5f5f5"/>`,
    size, r
  );
}

/* ---- 10. RÉGLAGES : fond gris, engrenages métalliques ---- */
export function iconSettings(size = ICON_SIZE) {
  const r = ICON_RADIUS * size / ICON_SIZE;
  const s = size * 0.55;
  const cx = size / 2;
  const cy = size / 2;
  return iconWrapper(
    `<g transform="translate(${cx - s/2}, ${cy - s/2}) scale(${s/24})">
      <g fill="#fff" opacity="0.95">
        <path d="M19.14,12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39,.96c-.5-.38-1.03-.7-1.59-.94l-.36-2.54c-.04-.24-.24-.44-.48-.44h-3.84c-.24,0-.43,.2-.47,.44l-.36,2.54c-.56,.24-1.09,.56-1.59,.94l-2.39-.96c-.22-.07-.47,0-.59,.22L2.74,8.87c-.12,.2-.07,.47.12,.61l2.03,1.58c-.04,.31-.06,.63-.06,.94s.02,.63.06,.94l-2.03,1.58c-.18,.14-.23,.41-.12,.61l1.92,3.32c.12,.22,.37,.29,.59,.22l2.39-.96c.5,.38 1.03,.7 1.59,.94l.36,2.54c.05,.24,.24,.44,.48,.44h3.84c.24,0,.44-.2.47-.44l.36-2.54c.56-.24 1.09-.56 1.59-.94l2.39,.96c.22,.07 .47,0 .59-.22l1.92-3.32c.12-.2.07-.47-.12-.61l-2.01-1.58zM12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6,1.62 3.6,3.6-1.62,3.6-3.6,3.6z"/>
      </g>
    </g>`,
    `<stop offset="0%" stop-color="#8e8e93"/><stop offset="100%" stop-color="#636366"/>`,
    size, r
  );
}

/* ---- Mapping nom → fonction ---- */
export const ICONS = {
  'Téléphone': iconPhone,
  'Musique': iconMusic,
  'Plans': iconMaps,
  'Messages': iconMessages,
  'À l\'écoute': iconNowPlaying,
  'Podcasts': iconPodcasts,
  'Livres audio': iconAudiobooks,
  'Météo': iconWeather,
  'Calendrier': iconCalendar,
  'Réglages': iconSettings,
};

/* ---- Raccourcis sidebar (3 icônes) ---- */
export const SIDEBAR_SHORTCUTS = ['Plans', 'Musique', 'Réglages'];