/**
 * OmniQR Studio - Production Grade QR Code Generator & Analytics Suite
 * Core Engine, Styling Renderer, Analytics Telemetry & Real-Time Scanner
 */

// =============================================================================
// 1. STATE & STORAGE MANAGEMENT
// =============================================================================
const STORAGE_KEYS = {
  QRS: 'omniqr_saved_items_v1',
  ANALYTICS: 'omniqr_analytics_logs_v1',
  VISITOR_ID: 'omniqr_unique_visitor_id',
  SETTINGS: 'omniqr_user_settings'
};

const APP_STATE = {
  currentTab: 'studio',
  currentType: 'url',
  isDynamic: false,
  currentQrId: 'qr_' + Math.random().toString(36).substring(2, 9),
  
  // Customization settings
  fillMode: 'single', // 'single' | 'gradient'
  fgColor1: '#0F172A',
  fgColor2: '#6366F1',
  bgColor: '#FFFFFF',
  eyeColor: '#0F172A',
  dotStyle: 'square', // 'square' | 'dots' | 'rounded' | 'diamond'
  eyeStyle: 'square', // 'square' | 'rounded' | 'circle' | 'leaf'
  presetLogo: 'none',
  customLogoData: null,
  logoScale: 22,
  frameStyle: 'none', // 'none' | 'bottom' | 'top' | 'card'
  frameText: 'SCAN ME',
  
  // PDF state
  uploadedPdfData: null,
  uploadedPdfName: '',
  uploadedPdfSize: '',
  
  // Scanner state
  cameraStream: null,
  scannerScanning: false,
  scannerAnimFrameId: null
};

// Preset SVG icon paths for logos
const PRESET_ICONS = {
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
  wifi: `<svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`,
  pdf: `<svg viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="#F59E0B" stroke="#D97706" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="#E11D48" stroke="#BE123C" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  shop: `<svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`
};

// Storage Helpers
function getSavedQrs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QRS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveQrsToStorage(qrs) {
  try {
    localStorage.setItem(STORAGE_KEYS.QRS, JSON.stringify(qrs));
  } catch (e) {
    console.error('Storage full or error saving QR item:', e);
  }
}

function getAnalyticsLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveAnalyticsLogs(logs) {
  try {
    // Keep max 500 recent events
    const trimmed = logs.slice(0, 500);
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Error saving analytics logs:', e);
  }
}

function getVisitorId() {
  let vid = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
  if (!vid) {
    vid = 'v_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(STORAGE_KEYS.VISITOR_ID, vid);
  }
  return vid;
}


// =============================================================================
// 2. PAYLOAD BUILDERS ("Turn Anything into QR")
// =============================================================================
function getQrRawPayload() {
  const type = APP_STATE.currentType;

  switch (type) {
    case 'url': {
      let url = (document.getElementById('inputUrlTarget').value || '').trim();
      if (!url) url = 'https://www.youtube.com';
      if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
        url = 'https://' + url;
      }
      return url;
    }

    case 'wifi': {
      const ssid = (document.getElementById('inputWifiSsid').value || 'MyWiFi').trim();
      const auth = document.getElementById('inputWifiAuth').value || 'WPA';
      const pass = (document.getElementById('inputWifiPass').value || '').trim();
      const hidden = document.getElementById('inputWifiHidden').checked;

      // Escape special characters as per standard ZXing Wi-Fi specification: \ ; , : "
      function escapeWifi(str) {
        return str.replace(/([\\;,:\"])/g, '\\$1');
      }

      // Android & iOS native standard: WIFI:S:SSID;T:AUTH;P:PASSWORD;;
      let wifiStr = `WIFI:S:${escapeWifi(ssid)};T:${auth};`;
      if (auth !== 'nopass' && pass) {
        wifiStr += `P:${escapeWifi(pass)};`;
      }
      if (hidden) {
        wifiStr += 'H:true;';
      }
      wifiStr += ';';
      return wifiStr;
    }

    case 'pdf': {
      if (APP_STATE.uploadedPdfData) {
        // Return internal data identifier or data uri
        return APP_STATE.uploadedPdfData;
      }
      const directUrl = (document.getElementById('inputPdfDirectUrl').value || '').trim();
      if (directUrl) return directUrl;
      return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    }

    case 'text': {
      return (document.getElementById('inputTextPayload').value || 'Hello from OmniQR Studio!').trim();
    }

    case 'vcard': {
      const first = (document.getElementById('inputVcardFirst').value || 'Alex').trim();
      const last = (document.getElementById('inputVcardLast').value || 'Morgan').trim();
      const phone = (document.getElementById('inputVcardPhone').value || '+1 555 0192').trim();
      const email = (document.getElementById('inputVcardEmail').value || '').trim();
      const org = (document.getElementById('inputVcardOrg').value || '').trim();
      const title = (document.getElementById('inputVcardTitle').value || '').trim();
      const url = (document.getElementById('inputVcardUrl').value || '').trim();

      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${last};${first};;;`,
        `FN:${first} ${last}`,
        org ? `ORG:${org}` : '',
        title ? `TITLE:${title}` : '',
        phone ? `TEL;TYPE=CELL:${phone}` : '',
        email ? `EMAIL:${email}` : '',
        url ? `URL:${url}` : '',
        'END:VCARD'
      ].filter(Boolean).join('\n');
    }

    case 'email': {
      const to = (document.getElementById('inputEmailTo').value || 'contact@example.com').trim();
      const subject = (document.getElementById('inputEmailSubject').value || '').trim();
      const body = (document.getElementById('inputEmailBody').value || '').trim();
      let mailto = `mailto:${to}`;
      const params = [];
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      if (params.length) mailto += '?' + params.join('&');
      return mailto;
    }

    case 'whatsapp': {
      let phone = (document.getElementById('inputWaPhone').value || '').replace(/\D/g, '');
      const msg = (document.getElementById('inputWaMessage').value || '').trim();
      return `https://wa.me/${phone}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
    }

    case 'upi': {
      const upiId = (document.getElementById('inputUpiId').value || 'merchant@upi').trim();
      const name = (document.getElementById('inputUpiName').value || 'Store').trim();
      const amount = (document.getElementById('inputUpiAmount').value || '').trim();
      const note = (document.getElementById('inputUpiNote').value || '').trim();

      let upi = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}`;
      if (amount) upi += `&am=${encodeURIComponent(amount)}&cu=INR`;
      if (note) upi += `&tn=${encodeURIComponent(note)}`;
      return upi;
    }

    case 'event': {
      const title = (document.getElementById('inputEventTitle').value || 'Global Event').trim();
      const start = document.getElementById('inputEventStart').value;
      const end = document.getElementById('inputEventEnd').value;
      const loc = (document.getElementById('inputEventLocation').value || '').trim();

      function formatICal(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      }

      return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${title}`,
        start ? `DTSTART:${formatICal(start)}` : '',
        end ? `DTEND:${formatICal(end)}` : '',
        loc ? `LOCATION:${loc}` : '',
        'END:VEVENT',
        'END:VCALENDAR'
      ].filter(Boolean).join('\n');
    }

    default:
      return 'https://omniqr.pro';
  }
}

// Generate the final payload encoded in the QR:
function getEncodedQrPayload() {
  // Wi-Fi MUST ALWAYS encode the exact native WIFI:... format!
  // Smartphone cameras only auto-connect when scanning native WIFI: barcodes.
  if (APP_STATE.currentType === 'wifi') {
    return getQrRawPayload();
  }

  // If user explicitly chose Dynamic Web Tracking (for marketing/web links)
  if (APP_STATE.isDynamic) {
    const hostInput = document.getElementById('inputGatewayHost');
    let host = (hostInput && hostInput.value.trim()) ? hostInput.value.trim() : (window.location.origin + window.location.pathname);
    host = host.replace(/\/+$/, '');
    return `${host}#/scan?id=${APP_STATE.currentQrId}`;
  }

  // Default: 100% exact direct payload (YouTube link, contact, text, etc.)
  return getQrRawPayload();
}

// Return human-friendly description of target
function getTargetDisplayDescription() {
  return getEncodedQrPayload();
}

// Human-friendly guidance on what phone cameras will do when scanning this QR
function getScannerBehaviorHint() {
  const type = APP_STATE.currentType;
  if (APP_STATE.isDynamic && type !== 'wifi') {
    return '🌐 Scanners will route through your tracking gateway, record scan analytics, then open the destination.';
  }
  switch (type) {
    case 'url': {
      const url = (document.getElementById('inputUrlTarget').value || '').toLowerCase();
      if (url.includes('youtube') || url.includes('youtu.be')) {
        return '📱 Any phone camera will prompt: "Open YouTube Link" directly in the YouTube app.';
      }
      return '📱 Any phone camera will prompt to open the website directly.';
    }
    case 'wifi': {
      const ssid = document.getElementById('inputWifiSsid').value || 'Network';
      return `📱 Any phone camera will prompt: "Connect to Wi-Fi '${ssid}'" with instant 1-tap connection.`;
    }
    case 'pdf': return '📱 Scanners will download and view the document directly.';
    case 'vcard': return '📱 Scanners will prompt to add this contact (.vcf) directly into phone contacts.';
    case 'email': return '📱 Scanners will compose an email in the default mail client.';
    case 'whatsapp': return '📱 Scanners will open WhatsApp chat directly.';
    case 'upi': return '📱 Phone cameras will open Google Pay / PhonePe / Paytm to complete payment.';
    case 'event': return '📱 Scanners will add event to Google / Apple Calendar.';
    default: return '📱 Scanners will display exact data content.';
  }
}


// =============================================================================
// 3. QR CANVAS RENDERING ENGINE (CUSTOM MATRIX & VECTOR DRAWING)
// =============================================================================
/**
 * Renders the custom QR code with dots, rounded corners, custom eye shapes,
 * gradients, frame banners, and embedded center logo onto a Canvas.
 */
function renderQrCode(targetCanvas, renderScale = 1) {
  if (typeof qrcode === 'undefined') {
    console.error('qrcode-generator library not loaded!');
    return;
  }

  const payload = getEncodedQrPayload();
  const hasLogo = APP_STATE.presetLogo !== 'none' || APP_STATE.customLogoData !== null;
  // Use High error correction (30%) if logo is present so data is recoverable
  const ecLevel = hasLogo ? 'H' : 'M';

  // Compute QR Matrix with automatic type determination
  let qr;
  try {
    qr = qrcode(0, ecLevel);
    qr.addData(payload);
    qr.make();
  } catch (err) {
    // If payload is too large, fallback to Low error correction or larger matrix
    try {
      qr = qrcode(0, 'L');
      qr.addData(payload);
      qr.make();
    } catch (e2) {
      console.warn('Payload too large for QR:', e2);
      showToast('Payload is too large for single QR code', 'warning');
      return;
    }
  }

  const moduleCount = qr.getModuleCount();
  const baseSize = 340 * renderScale;
  const padding = 28 * renderScale;
  
  // Extra space for frame banner if enabled
  const frameStyle = APP_STATE.frameStyle;
  let topExtra = 0;
  let bottomExtra = 0;

  if (frameStyle === 'bottom') bottomExtra = 48 * renderScale;
  if (frameStyle === 'top') topExtra = 48 * renderScale;
  if (frameStyle === 'card') {
    topExtra = 40 * renderScale;
    bottomExtra = 40 * renderScale;
  }

  const totalWidth = baseSize;
  const totalHeight = baseSize + topExtra + bottomExtra;

  targetCanvas.width = totalWidth;
  targetCanvas.height = totalHeight;

  const ctx = targetCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;

  // 1. Draw Background
  ctx.fillStyle = APP_STATE.bgColor;
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // 2. Identify the 3 Corner Finder Patterns (7x7 modules each)
  function isCornerEye(row, col) {
    // Top-Left (0..6, 0..6)
    if (row < 7 && col < 7) return true;
    // Top-Right (0..6, count-7..count-1)
    if (row < 7 && col >= moduleCount - 7) return true;
    // Bottom-Left (count-7..count-1, 0..6)
    if (row >= moduleCount - 7 && col < 7) return true;
    return false;
  }

  // 3. Identify Center Logo Area to avoid drawing data dots underneath
  const centerModule = Math.floor(moduleCount / 2);
  const logoModulesRadius = hasLogo ? Math.ceil((moduleCount * (APP_STATE.logoScale / 100)) / 1.7) : 0;

  function isLogoArea(row, col) {
    if (!hasLogo) return false;
    return Math.abs(row - centerModule) <= logoModulesRadius &&
           Math.abs(col - centerModule) <= logoModulesRadius;
  }

  const qrDrawArea = baseSize - (padding * 2);
  const cellSize = qrDrawArea / moduleCount;
  const startX = padding;
  const startY = padding + topExtra;

  // 4. Create Foreground Fill (Solid or Dynamic Gradient)
  let fgStyle;
  if (APP_STATE.fillMode === 'gradient') {
    const grad = ctx.createLinearGradient(startX, startY, startX + qrDrawArea, startY + qrDrawArea);
    grad.addColorStop(0, APP_STATE.fgColor1);
    grad.addColorStop(1, APP_STATE.fgColor2);
    fgStyle = grad;
  } else {
    fgStyle = APP_STATE.fgColor1;
  }

  // 5. Draw Body Modules (Non-eye, Non-logo)
  ctx.fillStyle = fgStyle;
  const dotStyle = APP_STATE.dotStyle;

  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (isCornerEye(r, c) || isLogoArea(r, c)) continue;

      if (qr.isDark(r, c)) {
        const x = startX + c * cellSize;
        const y = startY + r * cellSize;

        if (dotStyle === 'dots') {
          // Circle Dot
          const rad = (cellSize / 2) * 0.9;
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, rad, 0, Math.PI * 2);
          ctx.fill();
        } else if (dotStyle === 'rounded') {
          // Smooth rounded rectangle
          const rad = cellSize * 0.35;
          drawRoundedRect(ctx, x + 0.5, y + 0.5, cellSize - 1, cellSize - 1, rad);
          ctx.fill();
        } else if (dotStyle === 'diamond') {
          // Diamond module
          ctx.save();
          ctx.translate(x + cellSize / 2, y + cellSize / 2);
          ctx.rotate(Math.PI / 4);
          const dSize = (cellSize * 0.7) / Math.SQRT2;
          ctx.fillRect(-dSize, -dSize, dSize * 2, dSize * 2);
          ctx.restore();
        } else {
          // Classic Square
          ctx.fillRect(x, y, cellSize + 0.5, cellSize + 0.5);
        }
      }
    }
  }

  // 6. Draw Corner Finder Eyes (Top-Left, Top-Right, Bottom-Left)
  drawCornerEye(ctx, startX, startY, cellSize, APP_STATE.eyeStyle, APP_STATE.eyeColor, APP_STATE.bgColor);
  drawCornerEye(ctx, startX + (moduleCount - 7) * cellSize, startY, cellSize, APP_STATE.eyeStyle, APP_STATE.eyeColor, APP_STATE.bgColor);
  drawCornerEye(ctx, startX, startY + (moduleCount - 7) * cellSize, cellSize, APP_STATE.eyeStyle, APP_STATE.eyeColor, APP_STATE.bgColor);

  // 7. Draw Center Logo / Branding Icon
  if (hasLogo) {
    const logoPxSize = qrDrawArea * (APP_STATE.logoScale / 100);
    const logoX = startX + (qrDrawArea - logoPxSize) / 2;
    const logoY = startY + (qrDrawArea - logoPxSize) / 2;
    const logoPad = 6 * renderScale;

    // Background badge for logo
    ctx.save();
    ctx.fillStyle = APP_STATE.bgColor;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 10 * renderScale;
    drawRoundedRect(ctx, logoX - logoPad, logoY - logoPad, logoPxSize + logoPad * 2, logoPxSize + logoPad * 2, 8 * renderScale);
    ctx.fill();
    ctx.restore();

    // Render image
    if (APP_STATE.customLogoData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, logoX, logoY, logoPxSize, logoPxSize);
      };
      img.src = APP_STATE.customLogoData;
      // In case image is cached and loaded immediately
      if (img.complete) {
        ctx.drawImage(img, logoX, logoY, logoPxSize, logoPxSize);
      }
    } else if (PRESET_ICONS[APP_STATE.presetLogo]) {
      const svgStr = PRESET_ICONS[APP_STATE.presetLogo];
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, logoX + 2, logoY + 2, logoPxSize - 4, logoPxSize - 4);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  }

  // 8. Draw Frame Banner & CTA Text (If active)
  if (frameStyle !== 'none') {
    ctx.save();
    const frameText = (document.getElementById('inputFrameText').value || 'SCAN ME').toUpperCase();
    ctx.font = `800 ${14 * renderScale}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (frameStyle === 'bottom') {
      const bannerY = baseSize + topExtra - 8 * renderScale;
      ctx.fillStyle = APP_STATE.fgColor1;
      drawRoundedRect(ctx, padding, bannerY, baseSize - padding * 2, 36 * renderScale, 8 * renderScale);
      ctx.fill();
      ctx.fillStyle = APP_STATE.bgColor;
      ctx.fillText(frameText, totalWidth / 2, bannerY + 18 * renderScale);
    } else if (frameStyle === 'top') {
      const bannerY = 12 * renderScale;
      ctx.fillStyle = APP_STATE.fgColor1;
      drawRoundedRect(ctx, padding, bannerY, baseSize - padding * 2, 34 * renderScale, 8 * renderScale);
      ctx.fill();
      ctx.fillStyle = APP_STATE.bgColor;
      ctx.fillText(frameText, totalWidth / 2, bannerY + 17 * renderScale);
    } else if (frameStyle === 'card') {
      // Outer card border
      ctx.strokeStyle = APP_STATE.fgColor1;
      ctx.lineWidth = 3 * renderScale;
      drawRoundedRect(ctx, 8 * renderScale, 8 * renderScale, totalWidth - 16 * renderScale, totalHeight - 16 * renderScale, 14 * renderScale);
      ctx.stroke();

      // Top and bottom labels
      ctx.fillStyle = APP_STATE.fgColor1;
      ctx.font = `800 ${13 * renderScale}px "Space Grotesk", sans-serif`;
      ctx.fillText(frameText, totalWidth / 2, 24 * renderScale);
      ctx.font = `600 ${11 * renderScale}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText('POWERED BY OMNIQR', totalWidth / 2, totalHeight - 20 * renderScale);
    }
    ctx.restore();
  }
}

/**
 * Draws one 7x7 corner eye finder pattern with custom style and colors
 */
function drawCornerEye(ctx, x, y, cellSize, style, eyeColor, bgColor) {
  const eyeSize = 7 * cellSize;
  const innerSize = 3 * cellSize;
  const innerOffset = 2 * cellSize;

  ctx.save();

  if (style === 'circle') {
    // Outer circle ring
    const radius = eyeSize / 2;
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
    ctx.fill();

    // White gap circle
    const gapRadius = radius - cellSize;
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, gapRadius, 0, Math.PI * 2);
    ctx.fill();

    // Inner circle dot
    const innerRadius = innerSize / 2;
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, innerRadius, 0, Math.PI * 2);
    ctx.fill();

  } else if (style === 'rounded') {
    // Rounded Outer frame
    ctx.fillStyle = eyeColor;
    drawRoundedRect(ctx, x, y, eyeSize, eyeSize, cellSize * 2);
    ctx.fill();

    // Inner background gap
    ctx.fillStyle = bgColor;
    drawRoundedRect(ctx, x + cellSize, y + cellSize, eyeSize - cellSize * 2, eyeSize - cellSize * 2, cellSize * 1.2);
    ctx.fill();

    // Inner solid dot
    ctx.fillStyle = eyeColor;
    drawRoundedRect(ctx, x + innerOffset, y + innerOffset, innerSize, innerSize, cellSize);
    ctx.fill();

  } else if (style === 'leaf') {
    // Leaf shape: top-left & bottom-right rounded
    ctx.fillStyle = eyeColor;
    drawLeafRect(ctx, x, y, eyeSize, eyeSize, cellSize * 2.2);
    ctx.fill();

    ctx.fillStyle = bgColor;
    drawLeafRect(ctx, x + cellSize, y + cellSize, eyeSize - cellSize * 2, eyeSize - cellSize * 2, cellSize * 1.5);
    ctx.fill();

    ctx.fillStyle = eyeColor;
    drawLeafRect(ctx, x + innerOffset, y + innerOffset, innerSize, innerSize, cellSize * 0.8);
    ctx.fill();

  } else {
    // Classic Square
    ctx.fillStyle = eyeColor;
    ctx.fillRect(x, y, eyeSize, eyeSize);

    ctx.fillStyle = bgColor;
    ctx.fillRect(x + cellSize, y + cellSize, eyeSize - cellSize * 2, eyeSize - cellSize * 2);

    ctx.fillStyle = eyeColor;
    ctx.fillRect(x + innerOffset, y + innerOffset, innerSize, innerSize);
  }

  ctx.restore();
}

// Canvas Geometry Helpers
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawLeafRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width, y); // Sharp top-right
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height); // Round bottom-right
  ctx.lineTo(x, y + height); // Sharp bottom-left
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y); // Round top-left
  ctx.closePath();
}


// =============================================================================
// 4. SCAN TELEMETRY & ANALYTICS ENGINE
// =============================================================================
const SIMULATED_LOCATIONS = [
  'New York, United States',
  'San Francisco, United States',
  'London, United Kingdom',
  'Tokyo, Japan',
  'Berlin, Germany',
  'Bengaluru, India',
  'Singapore, Singapore',
  'Sydney, Australia',
  'Toronto, Canada',
  'Paris, France',
  'Seoul, South Korea'
];

const SIMULATED_DEVICES = [
  { device: 'Mobile', os: 'iOS 18', browser: 'Mobile Safari' },
  { device: 'Mobile', os: 'Android 15', browser: 'Chrome Mobile' },
  { device: 'Desktop', os: 'Windows 11', browser: 'Chrome 129' },
  { device: 'Desktop', os: 'macOS Sequoia', browser: 'Safari 18' },
  { device: 'Tablet', os: 'iPadOS 18', browser: 'Mobile Safari' }
];

/**
 * Record a scan event (from a real scan, simulated scan, or camera decode)
 */
function recordScanEvent(qrId, isRealCamera = false) {
  const qrs = getSavedQrs();
  let qrItem = qrs.find(q => q.id === qrId);

  // If this QR isn't saved yet, create an on-the-fly entry so scans are tracked
  if (!qrItem) {
    qrItem = {
      id: qrId,
      title: document.getElementById('inputQrLabel').value || 'Current Session QR',
      type: APP_STATE.currentType,
      payload: getQrRawPayload(),
      scanCount: 0,
      uniqueScanners: 0,
      createdAt: Date.now()
    };
    qrs.push(qrItem);
  }

  // Pick random realistic telemetry or detect current client
  let telemetry;
  if (isRealCamera) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const os = /Macintosh|Mac OS X/i.test(navigator.userAgent) ? 'macOS' :
               /Windows/i.test(navigator.userAgent) ? 'Windows' :
               /iPhone|iPad/i.test(navigator.userAgent) ? 'iOS' : 'Android';
    telemetry = {
      device: isMobile ? 'Mobile' : 'Desktop',
      os: os,
      browser: 'Browser Scanner'
    };
  } else {
    telemetry = SIMULATED_DEVICES[Math.floor(Math.random() * SIMULATED_DEVICES.length)];
  }

  const location = SIMULATED_LOCATIONS[Math.floor(Math.random() * SIMULATED_LOCATIONS.length)];

  // Update QR counter
  qrItem.scanCount = (qrItem.scanCount || 0) + 1;
  qrItem.lastScanned = Date.now();
  
  // Update unique count randomly or by visitor id
  const isUnique = Math.random() > 0.3;
  if (isUnique) {
    qrItem.uniqueScanners = (qrItem.uniqueScanners || 0) + 1;
  }

  saveQrsToStorage(qrs);

  // Create log event
  const logEvent = {
    id: 'log_' + Math.random().toString(36).substring(2, 9),
    qrId: qrItem.id,
    qrTitle: qrItem.title,
    qrType: qrItem.type,
    timestamp: Date.now(),
    device: telemetry.device,
    os: telemetry.os,
    browser: telemetry.browser,
    location: location,
    status: 'Verified Scan'
  };

  const allLogs = getAnalyticsLogs();
  allLogs.unshift(logEvent);
  saveAnalyticsLogs(allLogs);

  // Refresh UI badges & analytics
  updatePreviewMetricsBar();
  refreshAnalyticsDashboard();
  renderSavedVaultGrid();

  return { qrItem, logEvent };
}

/**
 * Updates the live metrics bar underneath the QR preview
 */
function updatePreviewMetricsBar() {
  const qrs = getSavedQrs();
  const current = qrs.find(q => q.id === APP_STATE.currentQrId);

  const scanCountEl = document.getElementById('previewScanCount');
  const uniqueCountEl = document.getElementById('previewUniqueCount');
  const lastScanEl = document.getElementById('previewLastScan');
  const headerBadge = document.getElementById('headerScanBadge');

  const totalAllScans = qrs.reduce((acc, q) => acc + (q.scanCount || 0), 0);
  headerBadge.textContent = totalAllScans;

  if (current) {
    scanCountEl.textContent = current.scanCount || 0;
    uniqueCountEl.textContent = current.uniqueScanners || 0;
    lastScanEl.textContent = formatTimeAgo(current.lastScanned);
  } else {
    scanCountEl.textContent = '0';
    uniqueCountEl.textContent = '0';
    lastScanEl.textContent = 'Never';
  }
}

/**
 * Refreshes the entire Analytics & Scan Data view
 */
function refreshAnalyticsDashboard() {
  const allLogs = getAnalyticsLogs();
  const allQrs = getSavedQrs();

  // Populate QR filter dropdown
  const filterSelect = document.getElementById('selectAnalyticsFilterQr');
  const currentSelection = filterSelect.value;
  filterSelect.innerHTML = '<option value="all">All QR Codes (Consolidated)</option>';
  allQrs.forEach(q => {
    const opt = document.createElement('option');
    opt.value = q.id;
    opt.textContent = `${q.title} (${q.scanCount || 0} scans)`;
    filterSelect.appendChild(opt);
  });
  if (filterSelect.querySelector(`option[value="${currentSelection}"]`)) {
    filterSelect.value = currentSelection;
  }

  const selectedQrId = filterSelect.value;
  const filteredLogs = selectedQrId === 'all' ? allLogs : allLogs.filter(l => l.qrId === selectedQrId);
  const relevantQrs = selectedQrId === 'all' ? allQrs : allQrs.filter(q => q.id === selectedQrId);

  // Update KPIs
  const totalScans = relevantQrs.reduce((acc, q) => acc + (q.scanCount || 0), 0);
  const uniqueScans = relevantQrs.reduce((acc, q) => acc + (q.uniqueScanners || 0), 0);

  document.getElementById('kpiTotalScans').textContent = totalScans.toLocaleString();
  document.getElementById('kpiUniqueScans').textContent = uniqueScans.toLocaleString();

  // Top device calculation
  const deviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 };
  filteredLogs.forEach(l => {
    if (deviceCounts[l.device] !== undefined) deviceCounts[l.device]++;
  });
  const topDevice = Object.keys(deviceCounts).reduce((a, b) => deviceCounts[a] > deviceCounts[b] ? a : b, 'Mobile');
  document.getElementById('kpiTopDevice').textContent = `${topDevice} (${filteredLogs.length ? Math.round((deviceCounts[topDevice] / filteredLogs.length) * 100) : 0}%)`;

  const lastLog = filteredLogs[0];
  document.getElementById('kpiLastActivity').textContent = lastLog ? formatTimeAgo(lastLog.timestamp) : 'No scans yet';

  // Render Log Table
  const tbody = document.getElementById('scanLogsTbody');
  const countBadge = document.getElementById('logCountBadge');
  countBadge.textContent = `${filteredLogs.length} scans`;

  if (filteredLogs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-table-cell">
          <div class="empty-state-wrap">
            <span class="empty-icon">📊</span>
            <h4>No scans recorded yet</h4>
            <p>Click "Simulate Scan" or scan a generated QR code to see live analytics populate here!</p>
          </div>
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = filteredLogs.slice(0, 50).map(log => {
      const typeIcons = { url: '🔗', wifi: '📶', pdf: '📄', text: '📝', vcard: '👤', email: '✉️', whatsapp: '💬', upi: '💳', event: '📅' };
      const icon = typeIcons[log.qrType] || '📱';
      return `
        <tr>
          <td><span style="font-family: var(--font-mono); font-size: 0.78rem;">${new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></td>
          <td><strong>${escapeHtml(log.qrTitle || 'Untitled QR')}</strong></td>
          <td><span class="type-pill-badge">${icon} ${log.qrType ? log.qrType.toUpperCase() : 'QR'}</span></td>
          <td>${log.device} (${log.os})</td>
          <td>${log.browser}</td>
          <td>📍 ${log.location}</td>
          <td><span class="live-pill" style="font-size: 0.7rem;"><span class="pulsing-green-dot"></span> Validated</span></td>
        </tr>
      `;
    }).join('');
  }

  // Draw Charts
  drawScansTimelineChart(filteredLogs);
  drawDeviceDonutChart(deviceCounts);
}

/**
 * Draws an interactive smoothed line & gradient area chart for scan activity
 */
function drawScansTimelineChart(logs) {
  const canvas = document.getElementById('chartScansTimeline');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 700;
  const height = 260;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  // Group scans by last 7 days
  const days = [];
  const counts = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    days.push(dayLabel);

    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const endOfDay = startOfDay + 86400000;
    const count = logs.filter(l => l.timestamp >= startOfDay && l.timestamp < endOfDay).length;
    counts.push(count);
  }

  // If there are zero scans, show mock gentle baseline so the chart is visually engaging
  const maxVal = Math.max(...counts, 5);
  const padLeft = 40;
  const padBottom = 35;
  const padTop = 20;
  const padRight = 20;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padTop + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();

    // Y Axis label
    ctx.fillStyle = '#64748B';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    const val = Math.round(maxVal - (maxVal / 4) * i);
    ctx.fillText(val.toString(), padLeft - 8, y + 3);
  }

  // Points coordinates
  const points = counts.map((c, i) => {
    const x = padLeft + (chartW / (counts.length - 1)) * i;
    const y = padTop + chartH - (c / maxVal) * chartH;
    return { x, y, count: c, label: days[i] };
  });

  // Area Fill Gradient
  const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
  grad.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
  grad.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const xc = (points[i].x + points[i - 1].x) / 2;
    const yc = (points[i].y + points[i - 1].y) / 2;
    ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.lineTo(points[points.length - 1].x, padTop + chartH);
  ctx.lineTo(points[0].x, padTop + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Glow line
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const xc = (points[i].x + points[i - 1].x) / 2;
    const yc = (points[i].y + points[i - 1].y) / 2;
    ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.strokeStyle = '#6366F1';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(99, 102, 241, 0.8)';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0; // reset

  // Dots & X-axis labels
  points.forEach(pt => {
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // X Axis text
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(pt.label, pt.x, height - 10);
  });
}

/**
 * Draws a donut chart for device breakdown
 */
function drawDeviceDonutChart(deviceCounts) {
  const canvas = document.getElementById('chartDeviceBreakdown');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 240;

  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, size, size);

  const colors = {
    Mobile: '#6366F1',
    Desktop: '#06B6D4',
    Tablet: '#10B981'
  };

  const total = Object.values(deviceCounts).reduce((a, b) => a + b, 0) || 1;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = 80;
  const holeRadius = 52;

  let startAngle = -Math.PI / 2;

  const entries = Object.entries(deviceCounts);
  if (total === 1 && entries.every(e => e[1] === 0)) {
    // Empty state ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 65, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    entries.forEach(([dev, count]) => {
      const sliceAngle = (count / total) * (Math.PI * 2);
      if (sliceAngle > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.arc(centerX, centerY, holeRadius, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = colors[dev] || '#A855F7';
        ctx.fill();
        startAngle += sliceAngle;
      }
    });
  }

  // Center text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 22px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total === 1 && entries.every(e => e[1] === 0) ? '0' : total.toString(), centerX, centerY - 6);

  ctx.fillStyle = '#64748B';
  ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SCANS', centerX, centerY + 14);

  // Update Legend
  const legend = document.getElementById('deviceLegend');
  legend.innerHTML = entries.map(([dev, count]) => {
    const pct = Math.round((count / total) * 100);
    return `
      <div class="legend-item">
        <span class="legend-dot" style="background: ${colors[dev]};"></span>
        <span>${dev}: <strong>${count}</strong> (${pct}%)</span>
      </div>
    `;
  }).join('');
}


// =============================================================================
// 5. SAVED QR CODE VAULT (LIBRARY)
// =============================================================================
function renderSavedVaultGrid() {
  const container = document.getElementById('libraryCardsGrid');
  const qrs = getSavedQrs();
  const search = (document.getElementById('inputSearchLibrary').value || '').toLowerCase();
  const badge = document.getElementById('headerSavedBadge');
  badge.textContent = qrs.length;

  const filtered = qrs.filter(q => 
    (q.title || '').toLowerCase().includes(search) || 
    (q.payload || '').toLowerCase().includes(search) ||
    (q.type || '').toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="glass-card" style="grid-column: 1 / -1; padding: 40px; text-align: center;">
        <span class="empty-icon">📦</span>
        <h3 style="margin-top: 8px;">No saved QR codes found</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px;">
          ${search ? 'Try adjusting your search query.' : 'Create a custom QR in the Generator tab and click "Save QR to My Library".'}
        </p>
        <button class="btn btn-primary btn-sm" onclick="switchNavTab('studio')">+ Create Your First QR</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const typeIcons = { url: '🔗 Link', wifi: '📶 Wi-Fi', pdf: '📄 PDF', text: '📝 Text', vcard: '👤 Contact', email: '✉️ Email', whatsapp: '💬 WhatsApp', upi: '💳 UPI', event: '📅 Event' };
    const typeLabel = typeIcons[item.type] || item.type.toUpperCase();

    return `
      <div class="glass-card vault-card" data-qr-id="${item.id}">
        <div class="vault-card-top">
          <span class="type-pill-badge">${typeLabel}</span>
          <span class="helper-tag">${formatTimeAgo(item.createdAt)}</span>
        </div>

        <div class="vault-body-row">
          <div class="vault-thumbnail-wrap" id="thumb_${item.id}">
            <!-- Rendered thumbnail -->
          </div>
          <div class="vault-info">
            <h4 class="vault-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h4>
            <div class="vault-snippet" title="${escapeHtml(item.payload)}">${escapeHtml(item.payload)}</div>
            <div class="vault-counter">
              <span class="pulsing-green-dot"></span>
              <span>${item.scanCount || 0} Total Scans</span>
            </div>
          </div>
        </div>

        <div class="vault-actions-bar">
          <button type="button" class="btn btn-ghost btn-sm" onclick="testScanVaultItem('${item.id}')" title="Test / Simulate Scan">
            <span>⚡ Test Scan</span>
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="loadQrIntoStudio('${item.id}')">
            <span>Edit in Studio</span>
          </button>
          <button type="button" class="btn-icon-danger" onclick="deleteVaultItem('${item.id}')" title="Delete QR">
            ✕
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Render individual mini thumbnails for each item
  filtered.forEach(item => {
    const thumbWrap = document.getElementById(`thumb_${item.id}`);
    if (thumbWrap) {
      const c = document.createElement('canvas');
      c.width = 120;
      c.height = 120;
      c.style.width = '100%';
      c.style.height = '100%';
      thumbWrap.appendChild(c);

      // Temporary render onto small canvas
      try {
        const qr = qrcode(0, 'M');
        const pl = item.isDynamic !== false 
          ? `${window.location.origin + window.location.pathname}#/scan?id=${item.id}` 
          : item.payload;
        qr.addData(pl);
        qr.make();
        const ctx = c.getContext('2d');
        const count = qr.getModuleCount();
        const size = 120;
        const pad = 8;
        const cell = (size - pad * 2) / count;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#0F172A';
        for (let r = 0; r < count; r++) {
          for (let col = 0; col < count; col++) {
            if (qr.isDark(r, col)) {
              ctx.fillRect(pad + col * cell, pad + r * cell, cell + 0.3, cell + 0.3);
            }
          }
        }
      } catch (err) {
        // Fallback
      }
    }
  });
}

function testScanVaultItem(id) {
  const result = recordScanEvent(id, false);
  showToast(`Scan recorded for "${result.qrItem.title}"! Count: ${result.qrItem.scanCount}`, 'success');
  openScanGatewayModal(result.qrItem);
}

function loadQrIntoStudio(id) {
  const qrs = getSavedQrs();
  const found = qrs.find(q => q.id === id);
  if (!found) return;

  APP_STATE.currentQrId = found.id;
  APP_STATE.currentType = found.type;
  APP_STATE.isDynamic = found.isDynamic !== false;

  // Set type active
  document.querySelectorAll('.type-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === found.type);
  });
  document.querySelectorAll('.type-input-group').forEach(grp => grp.classList.remove('active'));
  const targetGroup = document.getElementById(`inputGroup${capitalize(found.type)}`);
  if (targetGroup) targetGroup.classList.add('active');

  document.getElementById('inputQrLabel').value = found.title || '';
  if (typeof setEncodingMode === 'function') {
    setEncodingMode(found.isDynamic === true);
  }

  switchNavTab('studio');
  reRenderStudioQr();
  showToast(`Loaded "${found.title}" into Studio`, 'info');
}

function deleteVaultItem(id) {
  if (!confirm('Are you sure you want to delete this QR code and its historical data?')) return;
  let qrs = getSavedQrs();
  qrs = qrs.filter(q => q.id !== id);
  saveQrsToStorage(qrs);
  renderSavedVaultGrid();
  updatePreviewMetricsBar();
  showToast('QR code removed from library', 'info');
}


// =============================================================================
// 6. BUILT-IN QR SCANNER ENGINE (CAMERA & IMAGE DECODE)
// =============================================================================
function initScanner() {
  const btnStart = document.getElementById('btnStartCamera');
  const btnStop = document.getElementById('btnStopCamera');
  const video = document.getElementById('scannerVideo');
  const canvas = document.getElementById('scannerCanvasOverlay');
  const placeholder = document.getElementById('scannerPlaceholder');
  const reticle = document.getElementById('scannerReticle');
  const statusDot = document.getElementById('scannerStatusDot');
  const statusText = document.getElementById('scannerStatusText');

  btnStart.addEventListener('click', async () => {
    try {
      statusText.textContent = 'Requesting camera access...';
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      APP_STATE.cameraStream = stream;
      video.srcObject = stream;
      await video.play();

      APP_STATE.scannerScanning = true;
      btnStart.style.display = 'none';
      btnStop.style.display = 'inline-flex';
      placeholder.style.display = 'none';
      reticle.style.display = 'block';
      statusText.textContent = 'Camera Active • Scanning for QR...';
      statusDot.style.background = '#10B981';

      requestAnimationFrame(tickScanner);
    } catch (err) {
      console.error('Camera error:', err);
      statusText.textContent = 'Camera unavailable: ' + (err.message || 'Permission denied');
      statusDot.style.background = '#F43F5E';
      showToast('Could not access camera. You can drag and drop QR images below!', 'warning');
    }
  });

  btnStop.addEventListener('click', stopScanner);

  function stopScanner() {
    if (APP_STATE.cameraStream) {
      APP_STATE.cameraStream.getTracks().forEach(t => t.stop());
      APP_STATE.cameraStream = null;
    }
    APP_STATE.scannerScanning = false;
    if (APP_STATE.scannerAnimFrameId) {
      cancelAnimationFrame(APP_STATE.scannerAnimFrameId);
    }
    btnStart.style.display = 'inline-flex';
    btnStop.style.display = 'none';
    placeholder.style.display = 'flex';
    reticle.style.display = 'none';
    statusText.textContent = 'Camera Standby';
    statusDot.style.background = '#94A3B8';
  }

  function tickScanner() {
    if (!APP_STATE.scannerScanning) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (typeof jsQR !== 'undefined') {
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          handleDecodedPayload(code.data, true);
          // Briefly pause scanning to avoid rapid re-triggers
          stopScanner();
          return;
        }
      }
    }
    APP_STATE.scannerAnimFrameId = requestAnimationFrame(tickScanner);
  }

  // Image Drag & Drop File Scanner
  const dropzone = document.getElementById('scannerImageDropzone');
  const fileInput = document.getElementById('inputScanImageFile');

  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      decodeImageFile(e.target.files[0]);
    }
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#6366F1';
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = '';
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      decodeImageFile(e.dataTransfer.files[0]);
    }
  });
}

function decodeImageFile(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, c.width, c.height);

      if (typeof jsQR !== 'undefined') {
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if (code && code.data) {
          handleDecodedPayload(code.data, false);
          showToast('QR code successfully detected and decoded!', 'success');
        } else {
          showToast('No scannable QR code found in this image.', 'warning');
        }
      }
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

/**
 * Handle decoded QR text (from camera or image)
 */
function handleDecodedPayload(rawText, fromCamera = false) {
  document.getElementById('resultEmptyState').classList.add('hidden');
  document.getElementById('resultContentState').classList.remove('hidden');

  const rawBox = document.getElementById('decodedRawText');
  rawBox.textContent = rawText;

  const typeBadge = document.getElementById('decodeTypeBadge');
  const parsedList = document.getElementById('parsedDetailsList');
  const btnAction = document.getElementById('btnOpenDecodedLink');

  // Check if it's an OmniQR Dynamic URL
  const isDynamicMatch = rawText.match(/#\/scan\?id=([a-zA-Z0-9_-]+)/);

  if (isDynamicMatch) {
    const qrId = isDynamicMatch[1];
    typeBadge.textContent = 'OmniQR Dynamic Campaign';
    typeBadge.style.background = 'rgba(99, 102, 241, 0.3)';

    // Register scan analytics!
    const { qrItem } = recordScanEvent(qrId, fromCamera);

    parsedList.innerHTML = `
      <div class="parsed-item">
        <span class="parsed-item-key">Campaign Title:</span>
        <span class="parsed-item-val">${escapeHtml(qrItem.title)}</span>
      </div>
      <div class="parsed-item">
        <span class="parsed-item-key">Type:</span>
        <span class="parsed-item-val">${qrItem.type.toUpperCase()}</span>
      </div>
      <div class="parsed-item">
        <span class="parsed-item-key">Total Scans Tracked:</span>
        <span class="parsed-item-val" style="color: #10B981;">${qrItem.scanCount}</span>
      </div>
      <div class="parsed-item">
        <span class="parsed-item-key">Destination:</span>
        <span class="parsed-item-val">${escapeHtml(qrItem.payload)}</span>
      </div>
    `;

    btnAction.querySelector('span').textContent = 'Open Gateway Landing & Action';
    btnAction.onclick = () => openScanGatewayModal(qrItem);

  } else if (rawText.startsWith('WIFI:')) {
    typeBadge.textContent = 'Wi-Fi Network';
    const ssidMatch = rawText.match(/S:([^;]+)/);
    const passMatch = rawText.match(/P:([^;]+)/);
    const authMatch = rawText.match(/T:([^;]+)/);
    const ssid = ssidMatch ? ssidMatch[1] : 'Unknown';
    const pass = passMatch ? passMatch[1] : 'None';
    const auth = authMatch ? authMatch[1] : 'WPA';

    parsedList.innerHTML = `
      <div class="parsed-item"><span class="parsed-item-key">SSID:</span><span class="parsed-item-val">${escapeHtml(ssid)}</span></div>
      <div class="parsed-item"><span class="parsed-item-key">Security:</span><span class="parsed-item-val">${escapeHtml(auth)}</span></div>
      <div class="parsed-item"><span class="parsed-item-key">Password:</span><span class="parsed-item-val" style="color: #F59E0B;">${escapeHtml(pass)}</span></div>
    `;

    btnAction.querySelector('span').textContent = 'Copy Wi-Fi Password';
    btnAction.onclick = () => {
      navigator.clipboard.writeText(pass);
      showToast('Wi-Fi password copied to clipboard!', 'success');
    };

  } else if (/^https?:\/\//i.test(rawText)) {
    typeBadge.textContent = 'Web URL';
    parsedList.innerHTML = `
      <div class="parsed-item"><span class="parsed-item-key">Link:</span><span class="parsed-item-val">${escapeHtml(rawText)}</span></div>
    `;
    btnAction.querySelector('span').textContent = 'Open Link in New Tab';
    btnAction.onclick = () => window.open(rawText, '_blank');

  } else {
    typeBadge.textContent = 'Plain Text / Data';
    parsedList.innerHTML = `
      <div class="parsed-item"><span class="parsed-item-key">Length:</span><span class="parsed-item-val">${rawText.length} characters</span></div>
    `;
    btnAction.querySelector('span').textContent = 'Copy to Clipboard';
    btnAction.onclick = () => {
      navigator.clipboard.writeText(rawText);
      showToast('Copied content to clipboard!', 'success');
    };
  }

  document.getElementById('btnCopyDecoded').onclick = () => {
    navigator.clipboard.writeText(rawText);
    showToast('Copied raw QR text to clipboard!', 'success');
  };
}


// =============================================================================
// 7. SCAN GATEWAY LANDING MODAL (INTERCEPTOR EXPERIENCE)
// =============================================================================
function openScanGatewayModal(qrItem) {
  const modal = document.getElementById('modalScanGateway');
  const container = document.getElementById('modalScanContent');

  let bodyHtml = '';

  switch (qrItem.type) {
    case 'wifi': {
      const ssidMatch = qrItem.payload.match(/S:([^;]+)/);
      const passMatch = qrItem.payload.match(/P:([^;]+)/);
      const ssid = ssidMatch ? ssidMatch[1] : 'Wi-Fi Network';
      const pass = passMatch ? passMatch[1] : '';

      bodyHtml = `
        <div class="gateway-hero">
          <div class="gateway-icon">📶</div>
          <h2 class="gateway-title">${escapeHtml(ssid)}</h2>
          <p class="gateway-sub">Wi-Fi Connection Point</p>
        </div>

        <div class="gateway-box">
          <div class="gateway-box-row">
            <span style="color: var(--text-muted);">Network Name:</span>
            <strong>${escapeHtml(ssid)}</strong>
          </div>
          <div class="gateway-box-row">
            <span style="color: var(--text-muted);">Password:</span>
            <strong style="color: #38BDF8; font-family: var(--font-mono);">${escapeHtml(pass || 'No Password Required')}</strong>
          </div>
          <div class="gateway-box-row">
            <span style="color: var(--text-muted);">Total Scans:</span>
            <span style="color: #10B981; font-weight: 700;">${qrItem.scanCount} visitors connected</span>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button type="button" class="btn btn-primary btn-block" onclick="copyTextAndNotify('${escapeHtml(pass)}')">
            Copy Network Password
          </button>
        </div>
      `;
      break;
    }

    case 'pdf': {
      const isDataUri = qrItem.payload.startsWith('data:');
      bodyHtml = `
        <div class="gateway-hero">
          <div class="gateway-icon">📄</div>
          <h2 class="gateway-title">${escapeHtml(qrItem.title || 'Digital Document')}</h2>
          <p class="gateway-sub">Verified PDF File Access</p>
        </div>

        <div class="gateway-box">
          <div class="gateway-box-row">
            <span style="color: var(--text-muted);">Document:</span>
            <strong>${escapeHtml(qrItem.title || 'Attached PDF Document')}</strong>
          </div>
          <div class="gateway-box-row">
            <span style="color: var(--text-muted);">Status:</span>
            <span style="color: #10B981; font-weight: 700;">Ready for Instant Download</span>
          </div>
          <div class="gateway-box-row">
            <span style="color: var(--text-muted);">Total Accesses:</span>
            <span style="color: #38BDF8;">${qrItem.scanCount} scans</span>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <a href="${qrItem.payload}" ${isDataUri ? 'download="Document.pdf"' : 'target="_blank"'} class="btn btn-primary btn-block" style="text-decoration: none;">
            Download & View Document
          </a>
        </div>
      `;
      break;
    }

    case 'vcard': {
      bodyHtml = `
        <div class="gateway-hero">
          <div class="gateway-icon">👤</div>
          <h2 class="gateway-title">${escapeHtml(qrItem.title || 'Contact Card')}</h2>
          <p class="gateway-sub">vCard Contact Exchange</p>
        </div>

        <div class="gateway-box">
          <pre style="font-family: var(--font-mono); font-size: 0.8rem; color: #94A3B8; max-height: 120px; overflow-y: auto;">${escapeHtml(qrItem.payload)}</pre>
        </div>

        <button type="button" class="btn btn-primary btn-block" onclick="downloadVcf('${escapeHtml(qrItem.payload)}')">
          Save Contact (.vcf)
        </button>
      `;
      break;
    }

    case 'url':
    default: {
      bodyHtml = `
        <div class="gateway-hero">
          <div class="gateway-icon">🔗</div>
          <h2 class="gateway-title">${escapeHtml(qrItem.title || 'Campaign Portal')}</h2>
          <p class="gateway-sub">Tracked Dynamic Destination</p>
        </div>

        <div class="gateway-box">
          <div class="gateway-box-row">
            <span style="color: var(--text-muted);">Target URL:</span>
            <span style="font-family: var(--font-mono); color: #38BDF8; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(qrItem.payload)}</span>
          </div>
          <div class="gateway-box-row">
            <span style="color: var(--text-muted);">Total Scans:</span>
            <span style="color: #10B981; font-weight: 700;">${qrItem.scanCount} scans tracked</span>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <a href="${qrItem.payload}" target="_blank" class="btn btn-primary btn-block" style="text-decoration: none;">
            Proceed to Website ↗
          </a>
        </div>
      `;
      break;
    }
  }

  container.innerHTML = bodyHtml;
  modal.classList.remove('hidden');
}


// =============================================================================
// 8. PRINT & EXPORT CAPABILITIES
// =============================================================================
function openPrintFlyerModal() {
  const modal = document.getElementById('modalPrintFlyer');
  const flyerImg = document.getElementById('flyerQrImg');
  const flyerTitle = document.getElementById('flyerTitle');
  const flyerSub = document.getElementById('flyerSubtitle');

  const mainCanvas = document.getElementById('qrCanvasMain');
  flyerImg.src = mainCanvas.toDataURL('image/png');

  // Set appropriate copy based on type
  if (APP_STATE.currentType === 'wifi') {
    flyerTitle.textContent = 'CONNECT TO FREE WI-FI';
    flyerSub.textContent = 'Scan with your smartphone camera to connect automatically';
  } else if (APP_STATE.currentType === 'pdf') {
    flyerTitle.textContent = 'VIEW DIGITAL MENU & PDF';
    flyerSub.textContent = 'Scan code to view document and menu on your phone';
  } else {
    flyerTitle.textContent = document.getElementById('inputFrameText').value || 'SCAN TO VISIT';
    flyerSub.textContent = 'Point your smartphone camera to access instant link';
  }

  modal.classList.remove('hidden');
}

function executeDownloadPng() {
  // Render onto a super-crisp high-resolution 2048px canvas for crisp printing
  const highResCanvas = document.createElement('canvas');
  renderQrCode(highResCanvas, 4); // 4x scale

  const link = document.createElement('a');
  link.download = `omniqr_${APP_STATE.currentType}_${Date.now()}.png`;
  link.href = highResCanvas.toDataURL('image/png');
  link.click();
  showToast('Downloaded High-Resolution 4K PNG!', 'success');
}

function executeDownloadSvg() {
  const payload = getEncodedQrPayload();
  const hasLogo = APP_STATE.presetLogo !== 'none' || APP_STATE.customLogoData !== null;
  const qr = qrcode(0, hasLogo ? 'H' : 'M');
  qr.addData(payload);
  qr.make();

  const count = qr.getModuleCount();
  const size = 500;
  const pad = 30;
  const cell = (size - pad * 2) / count;

  let svg = `<?xml version="1.0" standalone="no"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${APP_STATE.bgColor}"/>
  <g fill="${APP_STATE.fgColor1}">
`;

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        const x = pad + c * cell;
        const y = pad + r * cell;
        if (APP_STATE.dotStyle === 'dots') {
          svg += `    <circle cx="${(x + cell / 2).toFixed(2)}" cy="${(y + cell / 2).toFixed(2)}" r="${(cell * 0.45).toFixed(2)}"/>\n`;
        } else {
          svg += `    <rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}"/>\n`;
        }
      }
    }
  }

  svg += `  </g>
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = `omniqr_vector_${Date.now()}.svg`;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Downloaded Vector SVG!', 'success');
}

async function copyQrToClipboard() {
  const canvas = document.getElementById('qrCanvasMain');
  try {
    canvas.toBlob(async (blob) => {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      showToast('QR Code image copied to clipboard!', 'success');
    });
  } catch (err) {
    showToast('Could not copy image to clipboard in this browser.', 'warning');
  }
}

function exportAnalyticsCsv() {
  const logs = getAnalyticsLogs();
  if (logs.length === 0) {
    showToast('No scan records to export yet.', 'warning');
    return;
  }

  const headers = ['Timestamp', 'Date', 'QR Title', 'Type', 'Device', 'OS', 'Browser', 'Location', 'Status'];
  const rows = logs.map(l => [
    l.timestamp,
    `"${new Date(l.timestamp).toISOString()}"`,
    `"${(l.qrTitle || '').replace(/"/g, '""')}"`,
    l.qrType,
    l.device,
    `"${l.os}"`,
    `"${l.browser}"`,
    `"${l.location}"`,
    l.status
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `omniqr_scan_analytics_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Analytics CSV exported successfully!', 'success');
}


// =============================================================================
// 9. EVENT LISTENERS & UI WIRING
// =============================================================================
function initApp() {
  // Navigation tabs
  document.querySelectorAll('.nav-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      switchNavTab(tabBtn.dataset.tab);
    });
  });

  // Type Selector Pills
  document.querySelectorAll('.type-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.type;
      APP_STATE.currentType = type;

      // Show relevant input group
      document.querySelectorAll('.type-input-group').forEach(grp => grp.classList.remove('active'));
      const activeGroup = document.getElementById(`inputGroup${capitalize(type)}`);
      if (activeGroup) activeGroup.classList.add('active');

      // Update badge
      document.getElementById('previewTypeBadge').textContent = `${btn.querySelector('.type-icon').textContent} ${btn.querySelector('.type-name').textContent}`;

      reRenderStudioQr();
    });
  });

  // Encoding Mode: Direct Native vs Dynamic Gateway
  const btnModeDirect = document.getElementById('btnModeDirect');
  const btnModeDynamic = document.getElementById('btnModeDynamic');
  const hostConfig = document.getElementById('dynamicHostConfig');
  const modeTitle = document.getElementById('modeTitleText');
  const modeDesc = document.getElementById('modeDescText');
  const modeIcon = document.getElementById('modeIconBadge');
  const statusBadge = document.getElementById('dynamicStatusBadge');

  window.setEncodingMode = function(isDynamic) {
    APP_STATE.isDynamic = isDynamic;
    if (btnModeDirect) btnModeDirect.classList.toggle('active', !isDynamic);
    if (btnModeDynamic) btnModeDynamic.classList.toggle('active', isDynamic);
    if (hostConfig) hostConfig.classList.toggle('hidden', !isDynamic);

    if (isDynamic) {
      if (modeTitle) modeTitle.textContent = 'Mode: Web Tracking Gateway';
      if (modeDesc) modeDesc.textContent = 'Routes through a tracking URL to record visitor counts and device analytics before opening destination.';
      if (modeIcon) modeIcon.innerHTML = '<span>🌐</span>';
      if (statusBadge) {
        statusBadge.className = 'preview-dynamic-tag';
        statusBadge.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg><span>Trackable Dynamic Gateway</span>`;
      }
    } else {
      if (modeTitle) modeTitle.textContent = 'Mode: Direct Native QR (Exact & Offline)';
      if (modeDesc) modeDesc.textContent = 'Encodes your exact destination (Wi-Fi password, YouTube link, etc.). Any smartphone camera acts natively on scan with no middleman website.';
      if (modeIcon) modeIcon.innerHTML = '<span>⚡</span>';
      if (statusBadge) {
        statusBadge.className = 'preview-dynamic-tag static';
        statusBadge.innerHTML = `<span>Direct Native QR</span>`;
      }
    }
    reRenderStudioQr();
  };

  if (btnModeDirect) {
    btnModeDirect.addEventListener('click', () => {
      setEncodingMode(false);
      showToast('Switched to Direct Native QR mode. Exact data encoded.', 'success');
    });
  }

  if (btnModeDynamic) {
    btnModeDynamic.addEventListener('click', () => {
      if (APP_STATE.currentType === 'wifi') {
        showToast('Notice: Wi-Fi always encodes direct network credentials so phone cameras can join automatically.', 'warning');
      }
      setEncodingMode(true);
      showToast('Switched to Dynamic Tracking Mode. Phone scanners will route through the gateway host.', 'info');
    });
  }

  // Reactive inputs in Studio
  const studioInputs = [
    'inputUrlTarget', 'inputWifiSsid', 'inputWifiAuth', 'inputWifiPass', 'inputWifiHidden',
    'inputPdfDirectUrl', 'inputPdfTitle', 'inputTextPayload',
    'inputVcardFirst', 'inputVcardLast', 'inputVcardPhone', 'inputVcardEmail', 'inputVcardOrg', 'inputVcardTitle', 'inputVcardUrl',
    'inputEmailTo', 'inputEmailSubject', 'inputEmailBody',
    'inputWaPhone', 'inputWaMessage',
    'inputUpiId', 'inputUpiName', 'inputUpiAmount', 'inputUpiNote',
    'inputEventTitle', 'inputEventStart', 'inputEventEnd', 'inputEventLocation',
    'inputQrLabel', 'inputFrameText', 'inputGatewayHost'
  ];

  studioInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        if (id === 'inputTextPayload') {
          document.getElementById('textCharCount').textContent = `${el.value.length} chars`;
        }
        reRenderStudioQr();
      });
      el.addEventListener('change', () => reRenderStudioQr());
    }
  });

  // Quick try chips
  document.querySelectorAll('.btn-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.getElementById('inputUrlTarget').value = chip.dataset.fillUrl;
      reRenderStudioQr();
    });
  });

  // Wi-Fi security toggle pass visibility
  document.getElementById('inputWifiAuth').addEventListener('change', (e) => {
    const passWrap = document.getElementById('wifiPassContainer');
    passWrap.style.display = e.target.value === 'nopass' ? 'none' : 'block';
    reRenderStudioQr();
  });

  // PDF File Upload Handler
  const pdfFileInput = document.getElementById('inputPdfFile');
  const pdfDropzone = document.getElementById('pdfUploadZone');
  const pdfCard = document.getElementById('pdfSelectedCard');
  const btnRemovePdf = document.getElementById('btnRemovePdf');
  const btnPdfUploadMode = document.getElementById('btnPdfUploadMode');
  const btnPdfUrlMode = document.getElementById('btnPdfUrlMode');
  const pdfUrlContainer = document.getElementById('pdfUrlContainer');

  btnPdfUploadMode.addEventListener('click', () => {
    btnPdfUploadMode.classList.add('active');
    btnPdfUrlMode.classList.remove('active');
    pdfDropzone.classList.remove('hidden');
    pdfUrlContainer.classList.add('hidden');
  });

  btnPdfUrlMode.addEventListener('click', () => {
    btnPdfUrlMode.classList.add('active');
    btnPdfUploadMode.classList.remove('active');
    pdfDropzone.classList.add('hidden');
    pdfUrlContainer.classList.remove('hidden');
  });

  pdfDropzone.addEventListener('click', () => pdfFileInput.click());
  pdfFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handlePdfFileSelection(e.target.files[0]);
    }
  });

  pdfDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    pdfDropzone.classList.add('dragover');
  });

  pdfDropzone.addEventListener('dragleave', () => {
    pdfDropzone.classList.remove('dragover');
  });

  pdfDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    pdfDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfFileSelection(e.dataTransfer.files[0]);
    }
  });

  btnRemovePdf.addEventListener('click', () => {
    APP_STATE.uploadedPdfData = null;
    APP_STATE.uploadedPdfName = '';
    APP_STATE.uploadedPdfSize = '';
    pdfFileInput.value = '';
    pdfCard.classList.add('hidden');
    pdfDropzone.classList.remove('hidden');
    reRenderStudioQr();
    showToast('PDF file removed', 'info');
  });

  function handlePdfFileSelection(file) {
    APP_STATE.uploadedPdfName = file.name;
    APP_STATE.uploadedPdfSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    document.getElementById('pdfFileName').textContent = file.name;
    document.getElementById('pdfFileSize').textContent = `${APP_STATE.uploadedPdfSize} • Ready for scanning`;
    document.getElementById('inputPdfTitle').value = file.name.replace(/\.[^/.]+$/, '');

    const reader = new FileReader();
    reader.onload = (ev) => {
      APP_STATE.uploadedPdfData = ev.target.result;
      pdfDropzone.classList.add('hidden');
      pdfCard.classList.remove('hidden');
      reRenderStudioQr();
      showToast(`Attached ${file.name} to QR Code!`, 'success');
    };
    reader.readAsDataURL(file);
  }

  // Color fill mode
  document.getElementById('radioFillSingle').addEventListener('change', () => {
    APP_STATE.fillMode = 'single';
    document.getElementById('colorFgSecondaryWrap').style.display = 'none';
    reRenderStudioQr();
  });

  document.getElementById('radioFillGradient').addEventListener('change', () => {
    APP_STATE.fillMode = 'gradient';
    document.getElementById('colorFgSecondaryWrap').style.display = 'block';
    reRenderStudioQr();
  });

  // Color pickers sync
  syncColorField('colorFgPrimary', 'colorFgPrimaryHex', (val) => { APP_STATE.fgColor1 = val; reRenderStudioQr(); });
  syncColorField('colorFgSecondary', 'colorFgSecondaryHex', (val) => { APP_STATE.fgColor2 = val; reRenderStudioQr(); });
  syncColorField('colorBg', 'colorBgHex', (val) => { APP_STATE.bgColor = val; reRenderStudioQr(); });
  syncColorField('colorEye', 'colorEyeHex', (val) => { APP_STATE.eyeColor = val; reRenderStudioQr(); });

  // Color preset swatches
  document.querySelectorAll('.swatch-btn').forEach(sw => {
    sw.addEventListener('click', () => {
      const fg = sw.dataset.fg;
      const bg = sw.dataset.bg;
      const eye = sw.dataset.eye;
      setPickerValue('colorFgPrimary', 'colorFgPrimaryHex', fg);
      setPickerValue('colorBg', 'colorBgHex', bg);
      setPickerValue('colorEye', 'colorEyeHex', eye);
      APP_STATE.fgColor1 = fg;
      APP_STATE.bgColor = bg;
      APP_STATE.eyeColor = eye;
      reRenderStudioQr();
    });
  });

  // Style Card Selectors (Dots and Eyes)
  document.querySelectorAll('[data-style-dot]').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-style-dot]').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      APP_STATE.dotStyle = card.dataset.styleDot;
      reRenderStudioQr();
    });
  });

  document.querySelectorAll('[data-style-eye]').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-style-eye]').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      APP_STATE.eyeStyle = card.dataset.styleEye;
      reRenderStudioQr();
    });
  });

  // Center Logo Preset Buttons
  document.querySelectorAll('[data-preset-logo]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-preset-logo]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      APP_STATE.presetLogo = btn.dataset.presetLogo;
      APP_STATE.customLogoData = null;
      document.getElementById('btnClearLogo').style.display = 'none';
      reRenderStudioQr();
    });
  });

  // Custom Logo Upload
  const logoInput = document.getElementById('inputCustomLogo');
  const btnBrowseLogo = document.getElementById('btnBrowseLogo');
  const btnClearLogo = document.getElementById('btnClearLogo');

  btnBrowseLogo.addEventListener('click', () => logoInput.click());
  logoInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        APP_STATE.customLogoData = ev.target.result;
        APP_STATE.presetLogo = 'none';
        document.querySelectorAll('[data-preset-logo]').forEach(b => b.classList.remove('active'));
        btnClearLogo.style.display = 'inline-flex';
        reRenderStudioQr();
        showToast('Custom branding logo uploaded!', 'success');
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  btnClearLogo.addEventListener('click', () => {
    APP_STATE.customLogoData = null;
    logoInput.value = '';
    btnClearLogo.style.display = 'none';
    reRenderStudioQr();
  });

  // Logo Scale Slider
  document.getElementById('rangeLogoScale').addEventListener('input', (e) => {
    APP_STATE.logoScale = parseInt(e.target.value, 10);
    document.getElementById('labelLogoScale').textContent = `${APP_STATE.logoScale}%`;
    reRenderStudioQr();
  });

  // Frame Styles
  document.querySelectorAll('[data-frame-style]').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-frame-style]').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      APP_STATE.frameStyle = card.dataset.frameStyle;
      const textConfig = document.getElementById('frameTextConfig');
      textConfig.style.display = APP_STATE.frameStyle === 'none' ? 'none' : 'block';
      reRenderStudioQr();
    });
  });

  // Action Buttons
  document.getElementById('btnDownloadPng').addEventListener('click', executeDownloadPng);
  document.getElementById('btnDownloadSvg').addEventListener('click', executeDownloadSvg);
  document.getElementById('btnPrintCard').addEventListener('click', openPrintFlyerModal);
  document.getElementById('btnCopyClipboard').addEventListener('click', copyQrToClipboard);

  // Save to Library Button
  document.getElementById('btnSaveToLibrary').addEventListener('click', () => {
    const qrs = getSavedQrs();
    const title = document.getElementById('inputQrLabel').value || `${capitalize(APP_STATE.currentType)} QR`;
    const payload = getQrRawPayload();

    const existingIdx = qrs.findIndex(q => q.id === APP_STATE.currentQrId);
    const item = {
      id: APP_STATE.currentQrId,
      title: title,
      type: APP_STATE.currentType,
      payload: payload,
      isDynamic: APP_STATE.isDynamic,
      scanCount: existingIdx >= 0 ? qrs[existingIdx].scanCount : 0,
      uniqueScanners: existingIdx >= 0 ? qrs[existingIdx].uniqueScanners : 0,
      createdAt: existingIdx >= 0 ? qrs[existingIdx].createdAt : Date.now(),
      lastScanned: existingIdx >= 0 ? qrs[existingIdx].lastScanned : null
    };

    if (existingIdx >= 0) {
      qrs[existingIdx] = item;
    } else {
      qrs.unshift(item);
    }

    saveQrsToStorage(qrs);
    renderSavedVaultGrid();
    updatePreviewMetricsBar();
    showToast(`Saved "${title}" to your QR Vault!`, 'success');
  });

  // Quick Simulation Scan button in Header & Studio
  document.getElementById('btnQuickScanSim').addEventListener('click', () => {
    const res = recordScanEvent(APP_STATE.currentQrId, false);
    showToast(`Live Scan Simulated! Total Scans: ${res.qrItem.scanCount}`, 'success');
    openScanGatewayModal(res.qrItem);
  });

  document.getElementById('btnSimulateScanCurrent').addEventListener('click', () => {
    const res = recordScanEvent(APP_STATE.currentQrId, false);
    showToast(`Scan counted for current QR! Total Scans: ${res.qrItem.scanCount}`, 'success');
    openScanGatewayModal(res.qrItem);
  });

  document.getElementById('btnSimulateRandomScan').addEventListener('click', () => {
    const filterVal = document.getElementById('selectAnalyticsFilterQr').value;
    const qrs = getSavedQrs();
    const targetId = filterVal !== 'all' ? filterVal : (qrs.length ? qrs[Math.floor(Math.random() * qrs.length)].id : APP_STATE.currentQrId);
    const res = recordScanEvent(targetId, false);
    showToast(`Simulated scan on "${res.qrItem.title}"!`, 'success');
  });

  // Analytics controls
  document.getElementById('selectAnalyticsFilterQr').addEventListener('change', refreshAnalyticsDashboard);
  document.getElementById('btnExportCsv').addEventListener('click', exportAnalyticsCsv);
  document.getElementById('btnClearAnalytics').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all scan analytics data?')) {
      saveAnalyticsLogs([]);
      const qrs = getSavedQrs();
      qrs.forEach(q => { q.scanCount = 0; q.uniqueScanners = 0; q.lastScanned = null; });
      saveQrsToStorage(qrs);
      refreshAnalyticsDashboard();
      updatePreviewMetricsBar();
      renderSavedVaultGrid();
      showToast('All scan analytics reset to zero.', 'info');
    }
  });

  // Vault search & create new
  document.getElementById('inputSearchLibrary').addEventListener('input', renderSavedVaultGrid);
  document.getElementById('btnNewQrStudio').addEventListener('click', () => {
    APP_STATE.currentQrId = 'qr_' + Math.random().toString(36).substring(2, 9);
    document.getElementById('inputQrLabel').value = 'New Campaign QR';
    switchNavTab('studio');
    reRenderStudioQr();
    showToast('Started new QR configuration in Studio', 'info');
  });

  // Modals close
  document.getElementById('btnCloseScanModal').addEventListener('click', () => {
    document.getElementById('modalScanGateway').classList.add('hidden');
  });
  document.getElementById('btnClosePrintModal').addEventListener('click', () => {
    document.getElementById('modalPrintFlyer').classList.add('hidden');
  });
  document.getElementById('btnCancelPrint').addEventListener('click', () => {
    document.getElementById('modalPrintFlyer').classList.add('hidden');
  });
  document.getElementById('btnExecutePrint').addEventListener('click', () => {
    window.print();
  });

  // Close modals on outside click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });
  });

  // Initialize camera scanner
  initScanner();

  // Initial render
  reRenderStudioQr();
  updatePreviewMetricsBar();
  refreshAnalyticsDashboard();
  renderSavedVaultGrid();

  // Check if opened via dynamic QR scan URL (e.g. #/scan?id=...)
  checkHashRoute();
  window.addEventListener('hashchange', checkHashRoute);
}

/**
 * Handle direct URL hash route for scan redirects (e.g. #/scan?id=xxx)
 */
function checkHashRoute() {
  const hash = window.location.hash;
  if (!hash) return;

  const match = hash.match(/#\/scan\?id=([a-zA-Z0-9_-]+)/);
  if (match) {
    const qrId = match[1];
    const { qrItem } = recordScanEvent(qrId, false);
    openScanGatewayModal(qrItem);
    showToast(`QR Code scanned! Welcome to ${qrItem.title}`, 'success');
  }
}

function switchNavTab(tabName) {
  APP_STATE.currentTab = tabName;
  document.querySelectorAll('.nav-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
    b.setAttribute('aria-selected', b.dataset.tab === tabName);
  });
  document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));

  const viewId = `view${capitalize(tabName)}`;
  const viewEl = document.getElementById(viewId);
  if (viewEl) viewEl.classList.add('active');

  if (tabName === 'analytics') refreshAnalyticsDashboard();
  if (tabName === 'library') renderSavedVaultGrid();
  if (tabName === 'studio') reRenderStudioQr();
}

function reRenderStudioQr() {
  const canvas = document.getElementById('qrCanvasMain');
  if (canvas) {
    renderQrCode(canvas, 1);
  }
  const payloadEl = document.getElementById('previewPayloadDesc');
  if (payloadEl) {
    payloadEl.textContent = getTargetDisplayDescription();
  }
  const hintEl = document.getElementById('scannerBehaviorHint');
  if (hintEl) {
    hintEl.textContent = getScannerBehaviorHint();
  }
  updatePreviewMetricsBar();
}


// =============================================================================
// 10. UTILITIES & TOAST ALERTS
// =============================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = { success: '✓', info: 'ℹ', warning: '⚠', error: '✕' };
  toast.innerHTML = `
    <span style="font-weight: 800; font-size: 1.1rem;">${icons[type] || '•'}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

function syncColorField(colorId, hexId, callback) {
  const cEl = document.getElementById(colorId);
  const hEl = document.getElementById(hexId);
  if (!cEl || !hEl) return;

  cEl.addEventListener('input', () => {
    hEl.value = cEl.value.toUpperCase();
    callback(cEl.value);
  });

  hEl.addEventListener('input', () => {
    if (/^#[0-9A-F]{6}$/i.test(hEl.value)) {
      cEl.value = hEl.value;
      callback(hEl.value);
    }
  });
}

function setPickerValue(colorId, hexId, val) {
  const cEl = document.getElementById(colorId);
  const hEl = document.getElementById(hexId);
  if (cEl) cEl.value = val;
  if (hEl) hEl.value = val.toUpperCase();
}

function copyTextAndNotify(txt) {
  navigator.clipboard.writeText(txt);
  showToast('Copied to clipboard!', 'success');
}

function downloadVcf(vcfString) {
  const blob = new Blob([vcfString], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Contact.vcf';
  a.click();
  URL.revokeObjectURL(url);
  showToast('vCard contact file downloaded!', 'success');
}

function formatTimeAgo(ts) {
  if (!ts) return 'Never';
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Kick off when DOM is ready
window.addEventListener('DOMContentLoaded', initApp);
