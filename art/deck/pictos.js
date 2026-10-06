// Pictogramas (viewBox 120x120) nas cores da marca, para os azulejos numerados dos slides.
const S = 'stroke="#00275B" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
const pics = {
  // ---- ingredientes ----
  dough: `<rect x="18" y="26" width="84" height="26" rx="9" fill="#F8E4B5"/><rect x="18" y="48" width="84" height="26" rx="9" fill="#EFCF8E"/><rect x="18" y="70" width="84" height="26" rx="9" fill="#F8E4B5"/>`,
  apple: `<path d="M60 34C44 20 22 34 24 62C26 90 44 104 60 98C76 104 94 90 96 62C98 34 76 20 60 34Z" fill="#E34B3C"/><path d="M60 34C60 24 62 18 68 12" fill="none"/><path d="M66 24C74 12 90 12 96 18C90 28 76 30 66 24Z" fill="#7FA82B"/><ellipse cx="40" cy="58" rx="5" ry="12" fill="#fff" opacity=".45" stroke="none" transform="rotate(20 40 58)"/>`,
  sugar: `<rect x="14" y="62" width="42" height="42" rx="7" fill="#fff"/><rect x="62" y="62" width="42" height="42" rx="7" fill="#fff"/><rect x="36" y="18" width="42" height="42" rx="7" fill="#fff" transform="rotate(-9 57 39)"/><path d="M22 72l6 0M70 72l6 0M44 28l6 -1" stroke="#77ABD9"/>`,
  cornstarch: `<path d="M24 28h72l-6 78H30z" fill="#EBF0F2"/><path d="M24 28h72v16H24z" fill="#F2D541"/><ellipse cx="60" cy="78" rx="15" ry="22" fill="#F2D541"/><path d="M60 58v40M50 70h20M48 82h24" stroke="#F27D16" stroke-width="3"/>`,
  lime: `<circle cx="60" cy="60" r="44" fill="#7FA82B"/><circle cx="60" cy="60" r="35" fill="#D6E58A" stroke="none"/><path d="M60 26V94M26 60H94M36 36L84 84M84 36L36 84" stroke="#fff" stroke-width="3"/><circle cx="60" cy="60" r="5" fill="#fff" stroke="none"/>`,
  egg: `<path d="M60 12C84 12 98 52 98 74C98 95 82 108 60 108C38 108 22 95 22 74C22 52 36 12 60 12Z" fill="#FBF3C9"/><ellipse cx="46" cy="52" rx="7" ry="14" fill="#fff" opacity=".8" stroke="none" transform="rotate(14 46 52)"/>`,
  cinnamon: `<g transform="rotate(-26 60 52)"><rect x="12" y="36" width="96" height="22" rx="11" fill="#9A5A2B"/><rect x="20" y="42" width="80" height="5" rx="2.5" fill="#C98648" stroke="none"/></g><g transform="rotate(-8 60 70)"><rect x="12" y="62" width="96" height="22" rx="11" fill="#8A4E22"/><rect x="20" y="68" width="80" height="5" rx="2.5" fill="#B97638" stroke="none"/></g><path d="M22 106Q60 70 98 106Z" fill="#B5703A"/>`,
  water: `<path d="M60 10C60 10 22 54 22 78A38 38 0 0 0 98 78C98 54 60 10 60 10Z" fill="#77ABD9"/><path d="M42 76c0 11 6 19 15 23" fill="none" stroke="#fff" stroke-width="5"/>`,
  // ---- utensílios ----
  board: `<rect x="12" y="28" width="96" height="66" rx="13" fill="#D9A55B"/><circle cx="92" cy="44" r="6.5" fill="#EBF0F2"/><path d="M28 56h44M28 70h28" stroke="#B9823E"/>`,
  spoon: `<path d="M54 58L98 102" stroke="#00275B" stroke-width="15"/><path d="M54 58L98 102" stroke="#C9D3DD" stroke-width="7"/><ellipse cx="40" cy="40" rx="21" ry="28" fill="#C9D3DD" transform="rotate(-45 40 40)"/><ellipse cx="34" cy="34" rx="7" ry="12" fill="#fff" opacity=".6" stroke="none" transform="rotate(-45 34 34)"/>`,
  knife: `<g transform="rotate(-42 60 60)"><path d="M10 50H70C82 50 92 56 96 60C92 64 82 70 70 70H10Z" fill="#E1E8EE"/><rect x="74" y="52" width="38" height="16" rx="7" fill="#00275B"/></g>`,
  plate: `<circle cx="60" cy="60" r="48" fill="#fff"/><circle cx="60" cy="60" r="31" fill="#EBF0F2"/><path d="M40 44a28 28 0 0 1 16-9" fill="none" stroke="#77ABD9" stroke-width="5"/>`,
  bowls: `<path d="M10 38H82A36 36 0 0 1 10 38Z" fill="#77ABD9"/><path d="M38 66H110A36 36 0 0 1 38 66Z" fill="#F27D16"/>`,
  fork: `<path d="M36 10h8v34c0 4 3 6 6 6V10h8v40c3 0 6-2 6-6V10h8v34a22 22 0 0 1-15 20v46h-8V64A22 22 0 0 1 36 44Z" fill="#C9D3DD"/>`,
  brush: `<g transform="rotate(32 60 60)"><rect x="52" y="62" width="16" height="48" rx="7" fill="#D9A55B"/><rect x="47" y="46" width="26" height="18" rx="4" fill="#C9D3DD"/><path d="M47 46C44 28 49 12 60 8c11 4 16 20 13 38Z" fill="#F2D541"/></g>`,
  airfryer: `<rect x="20" y="12" width="80" height="96" rx="18" fill="#3A5478"/><circle cx="60" cy="38" r="13" fill="#F27D16"/><rect x="30" y="64" width="60" height="32" rx="9" fill="#EBF0F2"/><rect x="48" y="74" width="24" height="9" rx="4.5" fill="#00275B"/>`,
  squeezer: `<path d="M14 60A46 46 0 0 1 106 60Z" fill="#F2D541"/><path d="M25 60A35 35 0 0 1 95 60Z" fill="#FBEFA6" stroke="none"/><path d="M60 60V28M36 60L44 34M84 60L76 34" stroke="#fff" stroke-width="3"/><rect x="18" y="62" width="84" height="14" rx="7" fill="#C9D3DD"/><path d="M28 76h64l-7 28H35z" fill="#C9D3DD"/>`,
  microwave: `<rect x="8" y="26" width="104" height="70" rx="11" fill="#3A5478"/><rect x="18" y="36" width="60" height="50" rx="7" fill="#D5E6F5"/><circle cx="94" cy="46" r="6.5" fill="#F27D16"/><rect x="87" y="62" width="14" height="24" rx="4" fill="#EBF0F2"/>`,
  mitt: `<path d="M32 106V62C28 48 31 30 42 28c9-1 9 12 9 20V30c0-11 5-19 13-17 9 2 8 13 8 23V30c2-10 13-10 15 3 2 13-1 23-3 35l9-7c8-6 15 5 8 13L88 100c-2 4-5 6-9 6Z" fill="#F27D16"/><rect x="28" y="92" width="58" height="18" rx="6" fill="#77ABD9"/>`,
};
const svg = (k) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120"><g ${S}>${pics[k]}</g></svg>`;
module.exports = { pics, svg };
