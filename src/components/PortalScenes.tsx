// Scènes des tuiles du portail (modèle COM&SIG) : une mise en scène par département ou fonction, dessinée en vectoriel
// (aucune image externe). L'administration peut remplacer chaque scène par une vraie photo (Administration › Portail).
import type { ReactNode } from 'react';

const sparks = [[-60, 38], [-40, 30], [-20, 42], [0, 34], [18, 44], [36, 30], [54, 40], [-72, 22], [70, 24], [-30, 18], [28, 16], [-50, 50], [46, 52], [8, 54], [-12, 26], [62, 34]];

export const SCENES: Record<string, ReactNode> = {
  // Direction générale : bureau de direction, fauteuil de cuir, ordinateur portable, globe doré
  direction: (<>
    <defs>
      <linearGradient id="sc-dir-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f3e5cc" /><stop offset=".6" stopColor="#d6bf98" /><stop offset="1" stopColor="#a98b62" /></linearGradient>
      <linearGradient id="sc-dir-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9b6433" /><stop offset="1" stopColor="#4f2c11" /></linearGradient>
      <linearGradient id="sc-dir-chair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b0612f" /><stop offset=".55" stopColor="#7b3c18" /><stop offset="1" stopColor="#4a210a" /></linearGradient>
      <radialGradient id="sc-dir-globe" cx=".35" cy=".32" r=".8"><stop offset="0" stopColor="#fff6cf" /><stop offset=".45" stopColor="#e3b64c" /><stop offset="1" stopColor="#7d5410" /></radialGradient>
      <filter id="sc-dir-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.4" /></filter>
    </defs>
    <rect width="320" height="172" fill="url(#sc-dir-wall)" />
    <g filter="url(#sc-dir-blur)">
      <rect x="188" y="-4" width="140" height="122" fill="#fffaf0" /><rect x="252" y="-4" width="6" height="122" fill="#cdb48c" /><rect x="188" y="56" width="140" height="5" fill="#cdb48c" />
      <ellipse cx="36" cy="90" rx="28" ry="22" fill="#5d8c3d" /><ellipse cx="20" cy="74" rx="15" ry="13" fill="#78ab4e" /><ellipse cx="52" cy="70" rx="13" ry="16" fill="#4c7a31" />
      <rect x="22" y="100" width="28" height="22" rx="3" fill="#ece5d9" /><ellipse cx="296" cy="96" rx="22" ry="17" fill="#6a9946" />
    </g>
    <path d="M66 30 q0-16 16-16 h62 q16 0 16 16 v84 h-94 z" fill="url(#sc-dir-chair)" />
    <path d="M76 36 q0-12 12-12 h50 q12 0 12 12 v30 h-74 z" fill="#c4743f" opacity=".45" />
    {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={92 + c * 21} cy={40 + r * 15} r="1.8" fill="#4a210a" opacity=".55" />))}
    <path d="M56 98 q0-9 9-9 h96 q9 0 9 9 v18 h-114 z" fill="#5f2a0f" />
    <path d="M0 118 L320 108 L320 172 L0 172 Z" fill="url(#sc-dir-desk)" />
    <path d="M0 118 L320 108 L320 113 L0 123 Z" fill="#cf9a5e" opacity=".75" />
    <path d="M146 112 l70 -3 l10 7 l-76 3 z" fill="#d3d7dd" /><path d="M157 110 l9 -44 l58 -4 l-7 46 z" fill="#8f959e" /><path d="M161 107 l8 -37 l50 -3 l-6 39 z" fill="#b3b9c1" opacity=".55" />
    <rect x="92" y="132" width="50" height="3.5" rx="1.7" fill="#1f2937" transform="rotate(-6 92 132)" /><rect x="92" y="132" width="10" height="3.5" rx="1.7" fill="#d4a537" transform="rotate(-6 92 132)" />
    <path d="M260 136 h40 l-5 9 h-30 z" fill="#7d5410" /><rect x="276.5" y="112" width="6" height="26" fill="#b9892b" />
    <path d="M252 74 a32 32 0 0 1 52 38" stroke="#caa03d" strokeWidth="3.5" fill="none" />
    <circle cx="279" cy="88" r="25" fill="url(#sc-dir-globe)" />
    <path d="M266 76 q8 -4 12 2 q-2 6 -8 6 q-6 4 -4 10 q-6 -2 -6 -8 z M284 92 q8 -2 10 4 q-2 8 -10 8 q-4 -6 0 -12 z" fill="#a8761d" opacity=".75" />
    <path d="M254 88 h50 M258 76 h42 M258 100 h42" stroke="#a8761d" strokeWidth="1" opacity=".5" />
    <ellipse cx="270" cy="78" rx="9" ry="4.5" fill="#fff" opacity=".45" />
  </>),

  // Commerciale : poignée de main devant une courbe de croissance
  commercial: (<>
    <defs>
      <radialGradient id="sc-com-bg" cx=".72" cy=".25" r=".95"><stop offset="0" stopColor="#3d8bff" /><stop offset=".45" stopColor="#1546a8" /><stop offset="1" stopColor="#081a45" /></radialGradient>
      <linearGradient id="sc-com-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fe3ff" /><stop offset="1" stopColor="#2a7de1" stopOpacity=".35" /></linearGradient>
      <linearGradient id="sc-com-suitl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0d1733" /><stop offset="1" stopColor="#24355f" /></linearGradient>
      <linearGradient id="sc-com-suitr" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#0d1733" /><stop offset="1" stopColor="#2a3c69" /></linearGradient>
      <linearGradient id="sc-com-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a8714b" /><stop offset="1" stopColor="#6e4026" /></linearGradient>
      <filter id="sc-com-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
    </defs>
    <rect width="320" height="172" fill="url(#sc-com-bg)" />
    <g opacity=".9">{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={186 + i * 25} y={92 - i * 16} width="17" height={80 + i * 16} rx="2" fill="url(#sc-com-bar)" />)}</g>
    <path d="M150 96 L196 80 L222 86 L262 52 L296 26" stroke="#bdf1ff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#sc-com-glow)" />
    <path d="M150 96 L196 80 L222 86 L262 52 L296 26" stroke="#e8fbff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M300 20 l-18 4 l12 12 z" fill="#e8fbff" />
    <path d="M-10 118 L98 92 L114 128 L-10 160 Z" fill="url(#sc-com-suitl)" />
    <path d="M330 62 L208 88 L220 124 L330 104 Z" fill="url(#sc-com-suitr)" />
    <circle cx="16" cy="142" r="3" fill="#0a1228" /><circle cx="27" cy="139" r="3" fill="#0a1228" /><circle cx="38" cy="136" r="3" fill="#0a1228" />
    <path d="M94 92 l12 -3 l16 38 l-12 4 z" fill="#f4f6fb" /><path d="M204 88 l14 -3 l10 37 l-14 3 z" fill="#f4f6fb" />
    <path d="M104 94 C118 86 140 86 154 92 L160 118 C146 126 128 130 112 128 Z" fill="#6e4026" />
    <g fill="#5e3520">{[0, 1, 2].map((i) => <rect key={i} x="0" y="-4.5" width="20" height="9" rx="4.5" transform={`translate(${200 + i * 2} ${112 + i * 8}) rotate(${8 + i * 6})`} />)}</g>
    <path d="M212 88 C192 80 160 82 144 94 C136 102 138 114 148 118 L200 124 C212 122 220 112 218 100 Z" fill="url(#sc-com-skin)" />
    <path d="M156 92 C170 88 190 88 204 92" stroke="#c48a60" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".55" />
    <g fill="#8a5636" stroke="#5a321c" strokeWidth="1.2">{[0, 1, 2, 3].map((i) => <rect key={i} x="0" y="-5" width="30" height="10" rx="5" transform={`translate(${152 + i * 9} ${100 + i * 3}) rotate(112)`} />)}</g>
    <rect x="0" y="-5.5" width="52" height="11" rx="5.5" fill="#7a4a2c" stroke="#4e2c17" strokeWidth="1.2" transform="translate(116 98) rotate(-14)" />
    <ellipse cx="162" cy="86" rx="5" ry="3" fill="#c9a08a" opacity=".7" transform="rotate(-14 162 86)" />
  </>),

  // Production : atelier d'impression grand format
  production: (<>
    <defs>
      <linearGradient id="sc-prod-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9eef4" /><stop offset=".6" stopColor="#aab4c1" /><stop offset="1" stopColor="#6c7684" /></linearGradient>
      <linearGradient id="sc-prod-body" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f7f8fa" /><stop offset="1" stopColor="#c6ccd5" /></linearGradient>
      <linearGradient id="sc-prod-print" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#22d3ee" /><stop offset=".3" stopColor="#8b5cf6" /><stop offset=".55" stopColor="#ec4899" /><stop offset=".78" stopColor="#f59e0b" /><stop offset="1" stopColor="#facc15" /></linearGradient>
      <filter id="sc-prod-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2" /></filter>
    </defs>
    <rect width="320" height="172" fill="url(#sc-prod-bg)" />
    <g filter="url(#sc-prod-blur)" opacity=".95">
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={20 + i * 66} y={8 + i * 2} width="44" height="6" rx="3" fill="#ffffff" />)}
      <path d="M0 40 L320 30 M0 58 L320 50" stroke="#cdd5df" strokeWidth="2" />
      <rect x="236" y="56" width="70" height="54" rx="4" fill="#dfe4ea" /><rect x="236" y="56" width="70" height="12" fill="#3a4250" /><rect x="292" y="74" width="10" height="6" fill="#3b82f6" />
    </g>
    <rect x="0" y="112" width="320" height="60" fill="#5b6472" /><rect x="0" y="112" width="320" height="3" fill="#8d97a5" />
    <g transform="translate(0 -22)">
    <rect x="34" y="56" width="176" height="76" rx="6" fill="url(#sc-prod-body)" />
    <rect x="34" y="50" width="176" height="18" rx="5" fill="#2b3442" /><rect x="40" y="54" width="164" height="4" rx="2" fill="#4b5566" />
    <rect x="44" y="76" width="44" height="46" rx="4" fill="#e6e9ee" /><rect x="96" y="76" width="44" height="46" rx="4" fill="#e6e9ee" />
    <rect x="176" y="74" width="24" height="16" rx="2" fill="#1f2937" /><rect x="179" y="77" width="18" height="10" rx="1" fill="#38bdf8" />
    <circle cx="182" cy="98" r="3" fill="#22c55e" /><circle cx="192" cy="98" r="3" fill="#f59e0b" />
    <rect x="30" y="124" width="184" height="10" rx="3" fill="#3a4250" />
    <path d="M120 126 C170 122 200 136 236 142 C270 148 300 140 330 150 L330 166 C298 158 268 166 232 160 C196 154 168 140 120 136 Z" fill="url(#sc-prod-print)" />
    <path d="M120 126 C170 122 200 136 236 142 C270 148 300 140 330 150" stroke="#fff" strokeWidth="1.5" fill="none" opacity=".6" />
    </g>
  </>),

  // Comptabilité : calculatrice, piles de pièces d'or, graphiques
  comptabilite: (<>
    <defs>
      <linearGradient id="sc-cpt-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2b2f3a" /><stop offset=".6" stopColor="#4b4a4f" /><stop offset="1" stopColor="#7a6a52" /></linearGradient>
      <linearGradient id="sc-cpt-calc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5b616b" /><stop offset="1" stopColor="#23272e" /></linearGradient>
      <linearGradient id="sc-cpt-coin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8a6114" /><stop offset=".35" stopColor="#f2cf6b" /><stop offset=".6" stopColor="#d9a73a" /><stop offset="1" stopColor="#7d560f" /></linearGradient>
      <linearGradient id="sc-cpt-screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b2a66" /><stop offset="1" stopColor="#123e8f" /></linearGradient>
      <filter id="sc-cpt-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.8" /></filter>
    </defs>
    <rect width="320" height="172" fill="url(#sc-cpt-bg)" />
    <g filter="url(#sc-cpt-blur)">
      <rect x="196" y="4" width="120" height="72" rx="4" fill="url(#sc-cpt-screen)" />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={210 + i * 20} y={58 - i * 9} width="12" height={12 + i * 9} fill="#60a5fa" opacity=".9" />)}
      <path d="M0 124 L150 112 L170 172 L0 172 Z" fill="#eef2f7" opacity=".9" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={24 + i * 16} y={138 - i * 6} width="9" height={14 + i * 6} fill="#3b82f6" opacity=".75" />)}
    </g>
    <rect x="0" y="120" width="320" height="52" fill="#3a3530" opacity=".35" />
    <g transform="rotate(-10 120 104)">
      <rect x="54" y="52" width="132" height="98" rx="10" fill="url(#sc-cpt-calc)" />
      <rect x="66" y="62" width="108" height="22" rx="3" fill="#c9dcc3" /><rect x="70" y="66" width="100" height="14" rx="2" fill="#dfeedd" />
      {[0, 1, 2].map((r) => [0, 1, 2, 3, 4].map((c) => <rect key={`${r}${c}`} x={68 + c * 21} y={92 + r * 17} width="16" height="12" rx="3" fill={c === 4 ? '#f59e0b' : '#e5e7eb'} />))}
    </g>
    {[[226, 3], [256, 5], [286, 4]].map(([x, n]) => (
      <g key={x}>{Array.from({ length: n }, (_, i) => (
        <g key={i}><ellipse cx={x} cy={150 - i * 9} rx="17" ry="5" fill="#7d560f" /><rect x={x - 17} y={141 - i * 9} width="34" height="9" fill="url(#sc-cpt-coin)" /><ellipse cx={x} cy={141 - i * 9} rx="17" ry="5" fill="#f4d47a" /></g>
      ))}</g>
    ))}
    <ellipse cx="200" cy="160" rx="13" ry="4" fill="#e9c35a" />
  </>),

  // Régie publicitaire et médias : panneau COM&SIG éclairé au coucher du soleil
  regie: (<>
    <defs>
      <linearGradient id="sc-reg-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b1a63" /><stop offset=".45" stopColor="#9b3c86" /><stop offset=".75" stopColor="#f0784a" /><stop offset="1" stopColor="#ffc46b" /></linearGradient>
      <linearGradient id="sc-reg-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1a2a78" /><stop offset=".6" stopColor="#3b2a8e" /><stop offset="1" stopColor="#c2417a" /></linearGradient>
      <linearGradient id="sc-reg-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffbe6" stopOpacity=".75" /><stop offset="1" stopColor="#fffbe6" stopOpacity="0" /></linearGradient>
      <radialGradient id="sc-reg-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fff3c4" /><stop offset="1" stopColor="#ffb347" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="320" height="172" fill="url(#sc-reg-sky)" />
    <circle cx="70" cy="138" r="46" fill="url(#sc-reg-sun)" />
    <path d="M0 150 V128 h14 v-14 h12 v20 h10 v-30 h14 v34 h12 v-22 h16 v26 h10 v-40 h12 v40 h14 v-18 h18 v22 h12 v-34 h10 v34 h20 v-26 h14 v30 h12 v-44 h12 v44 h16 v-20 h14 v24 h18 v-30 h12 v30 h16 V172 H0 Z" fill="#2a1745" />
    {[118, 156, 194, 232, 270].map((x, i) => <g key={x}><path d={`M${x} ${30 - i * 3} L${x - 18} ${78} L${x + 18} ${76} Z`} fill="url(#sc-reg-beam)" /><rect x={x - 6} y={24 - i * 3} width="12" height="7" rx="2" fill="#20263a" /><path d={`M${x} ${31 - i * 3} v12`} stroke="#20263a" strokeWidth="2" /></g>)}
    <path d="M96 46 L304 26 L304 118 L96 112 Z" fill="#141a2e" />
    <path d="M102 51 L298 32 L298 112 L102 107 Z" fill="url(#sc-reg-screen)" />
    <path d="M102 107 V92 h10 v-12 h10 v18 h8 v-26 h12 v28 h10 v-16 h12 v20 h8 v-34 h10 v34 h12 v-14 h14 v18 h10 v-28 h8 v28 h16 v-20 h12 v24 h10 v-36 h10 v36 h14 v-16 h12 v19 h12 v-24 h10 v26 L298 112 Z" fill="#0f1640" opacity=".55" />
    <text x="196" y="80" textAnchor="middle" transform="rotate(-5 196 80)" fill="#fff" fontWeight="800" fontSize="25" fontFamily="inherit" letterSpacing="-.5">COM&amp;SIG</text>
    <text x="198" y="96" textAnchor="middle" transform="rotate(-5 198 96)" fill="#ffe6f1" fontWeight="600" fontSize="10.5" fontFamily="inherit">Régie publicitaire</text>
    <rect x="92" y="114" width="216" height="5" fill="#20263a" /><path d="M96 119 l8 8 M300 119 l-8 8" stroke="#20263a" strokeWidth="3" />
    <rect x="190" y="118" width="14" height="54" fill="#1a1f33" /><rect x="190" y="118" width="4" height="54" fill="#39405a" />
  </>),

  // Assistante de direction : bureau, café, carnet à spirale, ordinateur
  assistanat_dg: (<>
    <defs>
      <linearGradient id="sc-ast-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9e3d0" /><stop offset=".55" stopColor="#b9b19c" /><stop offset="1" stopColor="#6f5a43" /></linearGradient>
      <linearGradient id="sc-ast-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c08a55" /><stop offset="1" stopColor="#7a4d26" /></linearGradient>
      <linearGradient id="sc-ast-cup" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#d7dbe0" /></linearGradient>
      <filter id="sc-ast-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.6" /></filter>
    </defs>
    <rect width="320" height="172" fill="url(#sc-ast-bg)" />
    <g filter="url(#sc-ast-blur)">
      <ellipse cx="268" cy="34" rx="30" ry="24" fill="#5f9a3e" /><ellipse cx="290" cy="20" rx="16" ry="18" fill="#7cb552" /><rect x="254" y="50" width="28" height="26" rx="4" fill="#f2efe8" />
      <path d="M40 30 h96 v60 h-96 z" fill="#c9ccd2" /><path d="M46 36 h84 v48 h-84 z" fill="#5b6b82" />
      <path d="M196 34 l70 -4 v52 l-70 4 z" fill="#1f2530" />
    </g>
    <path d="M0 84 L320 76 L320 172 L0 172 Z" fill="url(#sc-ast-desk)" /><path d="M0 84 L320 76 L320 80 L0 88 Z" fill="#dcae79" opacity=".7" />
    <g transform="translate(0 -18)">
    <ellipse cx="88" cy="132" rx="44" ry="11" fill="#e9ecef" /><ellipse cx="88" cy="130" rx="40" ry="9" fill="#ffffff" />
    <path d="M60 96 h56 l-6 34 q-22 8 -44 0 z" fill="url(#sc-ast-cup)" />
    <ellipse cx="88" cy="96" rx="28" ry="7" fill="#f1f3f5" /><ellipse cx="88" cy="97" rx="24" ry="5" fill="#5a361d" /><ellipse cx="82" cy="96" rx="8" ry="1.6" fill="#8a5a36" />
    <path d="M114 104 q16 0 14 12 q-2 10 -16 8" stroke="#e2e5e9" strokeWidth="6" fill="none" />
    <path d="M150 140 L292 124 L300 160 L160 172 Z" fill="#232831" />
    <path d="M154 134 L224 126 L230 160 L162 166 Z" fill="#fbfbfa" /><path d="M224 126 L292 118 L298 152 L230 160 Z" fill="#f1f0ec" />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${164 + i} ${143 + i * 5} L${220 + i} ${137 + i * 5} M${236} ${136 + i * 5} L${290} ${130 + i * 5}`} stroke="#b9c2cf" strokeWidth="1.1" />)}
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <ellipse key={i} cx={225 + i * 0.6} cy={129 + i * 4.6} rx="4.5" ry="2.2" fill="none" stroke="#d4a537" strokeWidth="1.8" />)}
    </g>
  </>),

  // Imprimerie : imprimante grand format, impression couleur et cartouches d'encre
  imprimerie: (<>
    <defs>
      <linearGradient id="sc-imp-bg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#c9d0d9" /><stop offset="1" stopColor="#eef1f5" /></linearGradient>
      <linearGradient id="sc-imp-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a525e" /><stop offset="1" stopColor="#1c2129" /></linearGradient>
      <linearGradient id="sc-imp-art" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#06b6d4" /><stop offset=".25" stopColor="#6366f1" /><stop offset=".5" stopColor="#ec4899" /><stop offset=".72" stopColor="#f97316" /><stop offset="1" stopColor="#facc15" /></linearGradient>
      <filter id="sc-imp-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2" /></filter>
    </defs>
    <rect width="320" height="172" fill="url(#sc-imp-bg)" />
    <g filter="url(#sc-imp-blur)">{[0, 1, 2, 3].map((i) => <rect key={i} x={170 + i * 40} y={6} width="26" height="5" rx="2.5" fill="#fff" />)}<rect x="214" y="30" width="96" height="60" rx="4" fill="#a7afba" /></g>
    <g transform="translate(0 -16)">
    <path d="M6 30 h178 l14 14 v58 h-192 z" fill="url(#sc-imp-body)" />
    <rect x="6" y="30" width="178" height="12" fill="#5d6673" /><rect x="132" y="48" width="44" height="30" rx="3" fill="#d9dee5" /><rect x="136" y="52" width="36" height="12" rx="2" fill="#2d3a4c" />
    <circle cx="142" cy="71" r="2.6" fill="#22c55e" /><circle cx="152" cy="71" r="2.6" fill="#38bdf8" />
    <rect x="2" y="96" width="200" height="10" rx="3" fill="#111418" />
    <path d="M40 104 C90 100 130 112 170 124 C210 136 260 132 330 142 L330 172 L120 172 C100 150 70 128 40 116 Z" fill="url(#sc-imp-art)" />
    <path d="M70 114 C120 118 150 132 186 146 C220 158 270 156 330 160" stroke="#fff" strokeWidth="4" fill="none" opacity=".35" />
    <path d="M90 108 C140 114 180 130 220 140" stroke="#1e1b4b" strokeWidth="6" fill="none" opacity=".25" />
    {['#06b6d4', '#ec4899', '#facc15', '#111827'].map((c, i) => <g key={c}><rect x={8 + i * 21} y="128" width="17" height="36" rx="2" fill={c} /><rect x={10 + i * 21} y="131" width="4" height="30" rx="1" fill="#fff" opacity=".35" /><rect x={8 + i * 21} y="124" width="17" height="6" rx="1" fill="#2d333b" /></g>)}
    </g>
  </>),

  // Technicien terrain : casque COM&SIG, sac à outils, talkie-walkie, gilet haute visibilité
  terrain: (<>
    <defs>
      <radialGradient id="sc-ter-bg" cx=".6" cy=".3" r=".9"><stop offset="0" stopColor="#a9cf7f" /><stop offset=".55" stopColor="#4e7d35" /><stop offset="1" stopColor="#24401b" /></radialGradient>
      <radialGradient id="sc-ter-hat" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#fff3a3" /><stop offset=".45" stopColor="#facc15" /><stop offset="1" stopColor="#c48a06" /></radialGradient>
      <linearGradient id="sc-ter-bag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3f47" /><stop offset="1" stopColor="#131619" /></linearGradient>
      <filter id="sc-ter-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3" /></filter>
    </defs>
    <rect width="320" height="172" fill="url(#sc-ter-bg)" />
    <g filter="url(#sc-ter-blur)" opacity=".8">{[[40, 30, 16], [90, 18, 10], [260, 24, 14], [300, 60, 10], [140, 40, 8]].map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} fill="#e7f5c8" opacity=".5" />)}</g>
    <path d="M0 138 L320 128 L320 172 L0 172 Z" fill="#f97316" /><path d="M0 146 L320 136 L320 142 L0 152 Z M0 160 L320 150 L320 156 L0 166 Z" fill="#d6dbe1" />
    <path d="M188 58 q4 -22 26 -24 h52 q22 2 26 24 l6 78 h-116 z" fill="url(#sc-ter-bag)" />
    <path d="M196 50 q34 -34 70 -2" stroke="#16191d" strokeWidth="7" fill="none" /><path d="M188 96 h116 v8 h-116 z M186 128 h120 v8 h-120 z" fill="#f97316" />
    <rect x="204" y="22" width="8" height="34" rx="3" fill="#f59e0b" transform="rotate(-10 208 40)" /><rect x="268" y="18" width="9" height="36" rx="3" fill="#ef4444" transform="rotate(12 272 36)" />
    <path d="M236 30 l6 -18 l6 18 z" fill="#9ca3af" />
    <rect x="198" y="70" width="34" height="74" rx="7" fill="#1b1e22" /><rect x="206" y="40" width="7" height="32" rx="3" fill="#2a2e34" />
    <rect x="203" y="78" width="24" height="16" rx="2" fill="#9fb5a4" /><rect x="205" y="80" width="20" height="12" rx="1.5" fill="#c2d6c6" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x="204" y={102 + i * 7} width="22" height="3" rx="1.5" fill="#3a3f47" />)}
    <path d="M30 120 q0 -62 64 -64 q64 2 64 64 z" fill="url(#sc-ter-hat)" />
    <path d="M14 120 q80 -12 160 0 q4 8 -6 12 q-74 -10 -148 0 q-10 -4 -6 -12 z" fill="#e0a80b" />
    <path d="M86 58 q8 -2 16 0 v40 q-8 2 -16 0 z" fill="#f7d84a" opacity=".9" />
    <text x="96" y="106" textAnchor="middle" fill="#1f2937" fontWeight="800" fontSize="14" fontFamily="inherit" letterSpacing="-.3">COM&amp;SIG</text>
    <ellipse cx="66" cy="76" rx="12" ry="6" fill="#fff" opacity=".45" transform="rotate(-30 66 76)" />
  </>),

  // Ressources humaines : cubes de bois à pictogrammes, loupe sur un profil
  rh: (<>
    <defs>
      <linearGradient id="sc-rh-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d5e3c6" /><stop offset=".5" stopColor="#b6b8a8" /><stop offset="1" stopColor="#7f8b98" /></linearGradient>
      <linearGradient id="sc-rh-wood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f0d6ae" /><stop offset="1" stopColor="#c99a66" /></linearGradient>
      <radialGradient id="sc-rh-lens" cx=".4" cy=".35" r=".7"><stop offset="0" stopColor="#ffffff" stopOpacity=".45" /><stop offset="1" stopColor="#bfe3ff" stopOpacity=".15" /></radialGradient>
      <filter id="sc-rh-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3" /></filter>
    </defs>
    <rect width="320" height="172" fill="url(#sc-rh-bg)" />
    <g filter="url(#sc-rh-blur)" opacity=".8"><ellipse cx="40" cy="30" rx="34" ry="24" fill="#6fa54a" /><rect x="220" y="10" width="90" height="56" rx="4" fill="#eef2f6" /></g>
    <rect x="0" y="140" width="320" height="32" fill="#a07a52" opacity=".55" />
    {[[40, 100, '#2b2b2b'], [96, 112, '#2b2b2b'], [232, 102, '#2b2b2b'], [70, 62, '#2b2b2b'], [262, 64, '#2b2b2b']].map(([x, y, c], i) => (
      <g key={i}>
        <path d={`M${x} ${y} l8 -8 h44 l-8 8 z`} fill="#f6e2c2" /><path d={`M${(x as number) + 44} ${y} l8 -8 v44 l-8 8 z`} fill="#b58554" />
        <rect x={x as number} y={y as number} width="44" height="44" fill="url(#sc-rh-wood)" />
        <circle cx={(x as number) + 22} cy={(y as number) + 16} r="6.5" fill={c as string} /><path d={`M${(x as number) + 10} ${(y as number) + 37} q12 -16 24 0 z`} fill={c as string} />
      </g>
    ))}
    <path d="M150 74 l9 -9 h50 l-9 9 z" fill="#f6e2c2" /><path d="M200 74 l9 -9 v50 l-9 9 z" fill="#b58554" />
    <rect x="150" y="74" width="50" height="50" fill="url(#sc-rh-wood)" />
    <circle cx="175" cy="92" r="8" fill="#dc2626" /><path d="M161 118 q14 -20 28 0 z" fill="#dc2626" /><path d="M175 102 l-3 8 l3 6 l3 -6 z" fill="#fff" />
    <path d="M214 128 L248 162" stroke="#1f2937" strokeWidth="11" strokeLinecap="round" />
    <circle cx="186" cy="100" r="40" fill="url(#sc-rh-lens)" /><circle cx="186" cy="100" r="40" fill="none" stroke="#1f2937" strokeWidth="7" />
    <path d="M160 82 a30 30 0 0 1 20 -12" stroke="#fff" strokeWidth="3" fill="none" opacity=".75" strokeLinecap="round" />
  </>),

  // Juridique : balance de la justice, marteau, codes
  juridique: (<>
    <defs>
      <linearGradient id="sc-jur-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b2416" /><stop offset=".6" stopColor="#6b4426" /><stop offset="1" stopColor="#2a1a10" /></linearGradient>
      <linearGradient id="sc-jur-gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8a6114" /><stop offset=".45" stopColor="#f5d57a" /><stop offset="1" stopColor="#9a6c16" /></linearGradient>
      <linearGradient id="sc-jur-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a8693a" /><stop offset="1" stopColor="#5c3317" /></linearGradient>
      <filter id="sc-jur-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.4" /></filter>
    </defs>
    <rect width="320" height="172" fill="url(#sc-jur-bg)" />
    <g filter="url(#sc-jur-blur)" opacity=".85">{['#7f1d1d', '#1e3a8a', '#365314', '#78350f', '#7f1d1d', '#1e293b', '#92400e', '#1e3a8a'].map((c, i) => <rect key={i} x={8 + i * 38} y="6" width="30" height="70" rx="2" fill={c} />)}</g>
    <rect x="0" y="128" width="320" height="44" fill="#3a2414" /><rect x="0" y="128" width="320" height="3" fill="#8a5a33" />
    <rect x="152" y="40" width="8" height="88" fill="url(#sc-jur-gold)" /><path d="M134 128 h44 l-6 -10 h-32 z" fill="url(#sc-jur-gold)" />
    <rect x="96" y="44" width="120" height="6" rx="3" fill="url(#sc-jur-gold)" /><circle cx="156" cy="40" r="7" fill="#f5d57a" />
    <path d="M104 50 l-16 40 M104 50 l16 40 M208 50 l-16 34 M208 50 l16 34" stroke="#d4a537" strokeWidth="1.5" />
    <path d="M84 90 h40 q-2 14 -20 14 q-18 0 -20 -14 z" fill="url(#sc-jur-gold)" /><path d="M188 84 h40 q-2 14 -20 14 q-18 0 -20 -14 z" fill="url(#sc-jur-gold)" />
    <g transform="rotate(-18 60 140)"><rect x="18" y="132" width="70" height="12" rx="5" fill="url(#sc-jur-wood)" /><rect x="40" y="114" width="26" height="40" rx="6" fill="url(#sc-jur-wood)" /><rect x="40" y="124" width="26" height="4" fill="#d4a537" /><rect x="40" y="140" width="26" height="4" fill="#d4a537" /></g>
    <ellipse cx="60" cy="160" rx="34" ry="7" fill="#5c3317" />
    {[['#7f1d1d', 0], ['#1e3a8a', 1], ['#14532d', 2]].map(([c, i]) => <g key={i as number}><rect x="236" y={140 - (i as number) * 16} width="76" height="15" rx="2" fill={c as string} /><rect x="244" y={145 - (i as number) * 16} width="60" height="2.5" fill="#d4a537" /></g>)}
  </>),

  // Informatique et études : écrans de code et de plans, équerre
  informatique: (<>
    <defs>
      <linearGradient id="sc-inf-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0f1d3a" /><stop offset="1" stopColor="#243b6b" /></linearGradient>
      <linearGradient id="sc-inf-plan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d4ed8" /><stop offset="1" stopColor="#1e40af" /></linearGradient>
    </defs>
    <rect width="320" height="172" fill="url(#sc-inf-bg)" />
    <rect x="0" y="128" width="320" height="44" fill="#1b2433" /><rect x="0" y="128" width="320" height="3" fill="#3a4a63" />
    <rect x="20" y="22" width="138" height="88" rx="6" fill="#0b0f19" /><rect x="26" y="28" width="126" height="76" rx="3" fill="#0f172a" />
    {[[34, 38, 50, '#38bdf8'], [42, 48, 70, '#f472b6'], [42, 58, 44, '#facc15'], [50, 68, 64, '#4ade80'], [42, 78, 36, '#38bdf8'], [34, 88, 58, '#a78bfa']].map(([x, y, w, c], i) => <rect key={i} x={x as number} y={y as number} width={w as number} height="4" rx="2" fill={c as string} opacity=".9" />)}
    <rect x="80" y="110" width="18" height="16" fill="#1f2937" /><rect x="64" y="124" width="50" height="5" rx="2" fill="#374151" />
    <rect x="168" y="16" width="140" height="94" rx="6" fill="#0b0f19" /><rect x="174" y="22" width="128" height="82" rx="3" fill="url(#sc-inf-plan)" />
    {Array.from({ length: 8 }, (_, i) => <path key={`v${i}`} d={`M${174 + i * 16} 22 V104`} stroke="#60a5fa" strokeWidth=".6" opacity=".6" />)}
    {Array.from({ length: 5 }, (_, i) => <path key={`h${i}`} d={`M174 ${22 + i * 16} H302`} stroke="#60a5fa" strokeWidth=".6" opacity=".6" />)}
    <path d="M200 92 V58 L236 36 L272 58 V92 Z M200 58 H272 M224 92 V72 H246 V92" stroke="#fff" strokeWidth="2" fill="none" strokeLinejoin="round" />
    <rect x="230" y="110" width="18" height="16" fill="#1f2937" /><rect x="214" y="124" width="50" height="5" rx="2" fill="#374151" />
    <path d="M96 140 h126 l-6 18 h-114 z" fill="#d1d5db" />{Array.from({ length: 10 }, (_, i) => <rect key={i} x={106 + i * 11} y="144" width="8" height="4" rx="1" fill="#9ca3af" />)}
    <path d="M250 166 L300 136 L300 166 Z" fill="#facc15" opacity=".95" /><path d="M262 162 L294 143 L294 162 Z" fill="#1b2433" />
  </>),

  // Décoration : mur mis en peinture au rouleau, nuancier, pot de peinture
  decoration: (<>
    <defs>
      <linearGradient id="sc-dec-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8fd3c7" /><stop offset=".55" stopColor="#8fd3c7" /><stop offset=".56" stopColor="#efe7da" /><stop offset="1" stopColor="#e3d8c6" /></linearGradient>
      <linearGradient id="sc-dec-paint" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f472b6" /><stop offset="1" stopColor="#db2777" /></linearGradient>
    </defs>
    <rect width="320" height="172" fill="url(#sc-dec-wall)" />
    <path d="M150 0 h46 v120 q-23 10 -46 0 z" fill="url(#sc-dec-paint)" opacity=".92" />
    <rect x="0" y="138" width="320" height="34" fill="#c7b59b" /><rect x="0" y="138" width="320" height="3" fill="#a8977e" />
    <g transform="rotate(-8 190 70)"><rect x="140" y="98" width="72" height="26" rx="12" fill="url(#sc-dec-paint)" /><rect x="146" y="102" width="56" height="5" rx="2.5" fill="#fbcfe8" opacity=".7" />
      <path d="M212 110 h14 v-50 h-26" stroke="#4b5563" strokeWidth="5" fill="none" strokeLinejoin="round" /><rect x="192" y="44" width="14" height="40" rx="6" fill="#f59e0b" transform="rotate(90 199 64)" /></g>
    {['#ef4444', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#6366f1', '#a855f7'].map((c, i) => <rect key={c} x="38" y="96" width="16" height="62" rx="3" fill={c} transform={`rotate(${-48 + i * 13} 46 154)`} />)}
    <circle cx="46" cy="154" r="4" fill="#374151" />
    <path d="M236 118 h56 v42 q-28 8 -56 0 z" fill="#d1d5db" /><ellipse cx="264" cy="118" rx="28" ry="7" fill="#9ca3af" /><ellipse cx="264" cy="118" rx="24" ry="5" fill="url(#sc-dec-paint)" />
    <path d="M240 128 h48" stroke="#fff" strokeWidth="3" opacity=".5" />
  </>),

  // Atelier métallique : poutrelles, étincelles de soudure, enclume et marteau
  atelier: (<>
    <defs>
      <radialGradient id="sc-ate-bg" cx=".3" cy=".55" r=".9"><stop offset="0" stopColor="#7a3410" /><stop offset=".4" stopColor="#2b1d18" /><stop offset="1" stopColor="#111418" /></radialGradient>
      <linearGradient id="sc-ate-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9ca3af" /><stop offset="1" stopColor="#4b5563" /></linearGradient>
      <radialGradient id="sc-ate-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fff7d6" /><stop offset=".4" stopColor="#fbbf24" stopOpacity=".8" /><stop offset="1" stopColor="#f97316" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="320" height="172" fill="url(#sc-ate-bg)" />
    {[24, 58].map((y) => <g key={y}><rect x="0" y={y} width="320" height="8" fill="url(#sc-ate-steel)" /><rect x="0" y={y + 8} width="320" height="3" fill="#374151" /></g>)}
    <rect x="0" y="132" width="320" height="40" fill="#1f2328" /><rect x="0" y="132" width="320" height="3" fill="#4b5563" />
    <circle cx="96" cy="108" r="40" fill="url(#sc-ate-glow)" />
    {sparks.map(([dx, len], i) => { const a = Math.atan2(-Math.abs(len), dx); const x2 = 96 + Math.cos(a) * (len as number) * 1.4; const y2 = 108 + Math.sin(a) * (len as number) * 1.2; return <path key={i} d={`M96 108 L${x2.toFixed(1)} ${y2.toFixed(1)}`} stroke={i % 3 ? '#fbbf24' : '#fff3c4'} strokeWidth={i % 2 ? 1.6 : 1} strokeLinecap="round" />; })}
    <path d="M40 132 l20 -24 h70 l14 24 z" fill="#4b5563" /><rect x="60" y="104" width="76" height="6" fill="#9ca3af" />
    <path d="M196 98 h92 q-6 16 -26 18 v14 h18 v12 h-76 v-12 h18 v-14 q-20 -2 -26 -18 z" fill="url(#sc-ate-steel)" /><path d="M196 98 h92 v5 h-92 z" fill="#d1d5db" />
    <g transform="rotate(-24 250 80)"><rect x="236" y="70" width="52" height="8" rx="3" fill="#a16207" /><rect x="222" y="60" width="18" height="28" rx="3" fill="#6b7280" /><rect x="222" y="60" width="18" height="6" fill="#d1d5db" /></g>
  </>),

  // Salle CNC : fraiseuse à commande numérique découpant un panneau
  cnc: (<>
    <defs>
      <linearGradient id="sc-cnc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cfd8e3" /><stop offset="1" stopColor="#7d8a9c" /></linearGradient>
      <linearGradient id="sc-cnc-yel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fde047" /><stop offset="1" stopColor="#ca8a04" /></linearGradient>
      <linearGradient id="sc-cnc-panel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7cc4ff" /><stop offset="1" stopColor="#2563eb" /></linearGradient>
    </defs>
    <rect width="320" height="172" fill="url(#sc-cnc-bg)" />
    <path d="M10 150 L52 104 L292 104 L316 150 Z" fill="#374151" /><path d="M10 150 L316 150 L316 160 L10 160 Z" fill="#1f2937" />
    <path d="M60 140 L84 112 L262 112 L282 140 Z" fill="url(#sc-cnc-panel)" />
    <path d="M110 134 q20 -18 46 -6 t50 -8" stroke="#e0f2fe" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M100 122 h40 v10 h-40 z" stroke="#e0f2fe" strokeWidth="2" fill="none" />
    <rect x="40" y="40" width="14" height="96" fill="url(#sc-cnc-yel)" /><rect x="272" y="40" width="14" height="96" fill="url(#sc-cnc-yel)" />
    <rect x="34" y="34" width="258" height="18" rx="3" fill="url(#sc-cnc-yel)" /><rect x="34" y="34" width="258" height="4" fill="#fef9c3" opacity=".7" />
    <rect x="172" y="40" width="34" height="44" rx="4" fill="#4b5563" /><rect x="180" y="84" width="18" height="24" rx="3" fill="#d1d5db" /><rect x="186" y="108" width="6" height="14" fill="#9ca3af" />
    <path d="M189 122 l-2 6 h4 z" fill="#e5e7eb" />
    {[[176, 122], [200, 126], [182, 130], [206, 118], [170, 128]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" fill="#e0f2fe" />)}
    <rect x="292" y="70" width="24" height="40" rx="3" fill="#1f2937" /><rect x="296" y="76" width="16" height="10" rx="1" fill="#22c55e" opacity=".8" />
  </>),

  // Administration technique : baies de serveurs et bouclier de sécurité
  administration: (<>
    <defs>
      <radialGradient id="sc-adm-bg" cx=".6" cy=".4" r=".9"><stop offset="0" stopColor="#1e4fa8" /><stop offset=".55" stopColor="#0c1f4a" /><stop offset="1" stopColor="#050c1f" /></radialGradient>
      <linearGradient id="sc-adm-shield" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b82f6" /><stop offset="1" stopColor="#1e3a8a" /></linearGradient>
      <linearGradient id="sc-adm-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff1bd" /><stop offset=".5" stopColor="#e3b54e" /><stop offset="1" stopColor="#9a6b12" /></linearGradient>
    </defs>
    <rect width="320" height="172" fill="url(#sc-adm-bg)" />
    {[14, 74, 134].map((x) => <g key={x}><rect x={x} y="16" width="52" height="150" rx="3" fill="#0b1222" /><rect x={x} y="16" width="52" height="150" rx="3" fill="none" stroke="#1f2a44" />
      {Array.from({ length: 9 }, (_, i) => <g key={i}><rect x={x + 5} y={22 + i * 15} width="42" height="11" rx="1.5" fill="#141d33" /><circle cx={x + 40} cy={27.5 + i * 15} r="1.8" fill={i % 3 ? '#22c55e' : '#38bdf8'} /><rect x={x + 9} y={26 + i * 15} width="20" height="2" fill="#26324f" /></g>)}</g>)}
    <path d="M196 70 L250 48 L304 70" stroke="#38bdf8" strokeWidth="1" opacity=".5" fill="none" /><circle cx="250" cy="48" r="3" fill="#38bdf8" opacity=".7" />
    <path d="M250 36 L298 54 V92 Q298 132 250 156 Q202 132 202 92 V54 Z" fill="url(#sc-adm-gold)" />
    <path d="M250 42 L292 58 V92 Q292 126 250 148 Q208 126 208 92 V58 Z" fill="url(#sc-adm-shield)" />
    <rect x="234" y="88" width="32" height="26" rx="4" fill="url(#sc-adm-gold)" /><path d="M240 88 v-8 a10 10 0 0 1 20 0 v8" stroke="url(#sc-adm-gold)" strokeWidth="5" fill="none" />
    <circle cx="250" cy="99" r="3.5" fill="#1e3a8a" /><rect x="248.5" y="100" width="3" height="8" fill="#1e3a8a" />
  </>),
};

/** Scène d'une tuile (repli : direction générale). */
export function Scene({ name }: { name?: string }) {
  return <svg className="ptile-scene" viewBox="0 0 320 172" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">{SCENES[name ?? ''] ?? SCENES.direction}</svg>;
}
