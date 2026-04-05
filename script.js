const dollarInput = document.getElementById('dollar');
const resultSpan = document.getElementById('result');
const rateDiv = document.querySelector('.rate');
const lastUpdatedDiv = document.querySelector('.last-updated');

let currentRate = null;

// fetch rate dari Google Sheet (kode lu tetap sama)
fetch(
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIefvbp0yDlYWWzhw-gnVjKgyh0GvADomMb_0yqhXpArd-29mVfVNWdHACI8kJ9TtPd1LBTOVW7YEc/pub?output=csv',
)
.then(res => res.text())
.then(csvText => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV kosong atau tidak lengkap');

  const headers = lines[0].split(',');
  const values = lines[1].split(',');

  const rateIndex = headers.findIndex(h => h.toLowerCase().trim() === 'rate');
  const lastUpdatedIndex = headers.findIndex(h => h.toLowerCase().trim() === 'lastupdated');

  const rateValue = values[rateIndex]?.replace(/"/g,'').trim() || '0';
  const lastUpdatedValue = values[lastUpdatedIndex]?.replace(/"/g,'').trim() || '-';

  currentRate = parseFloat(rateValue.replace(/,/g,'')) || 0;

  rateDiv.textContent = `RATE : Rp${currentRate.toLocaleString('id-ID')}`;
  lastUpdatedDiv.textContent = `Last Updated : ${lastUpdatedValue}`;
})
.catch(err => {
  console.error('Gagal fetch Google Sheet CSV:', err);
  currentRate = 0;
  rateDiv.textContent = 'RATE : -';
  lastUpdatedDiv.textContent = 'Last Updated : -';
});

// ✅ live conversion tanpa tombol
dollarInput.addEventListener('input', () => {
  if (currentRate === null || currentRate === 0) {
    resultSpan.textContent = '-';
    return;
  }

  const dollar = parseFloat(dollarInput.value);
  if (isNaN(dollar)) {
    resultSpan.textContent = '-';
    return;
  }

  const hasil = currentRate * dollar;
  resultSpan.textContent = hasil.toLocaleString('id-ID');
});

const overlay = document.createElement("div");
overlay.id = "inspectAlertOverlay";
overlay.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  backdrop-filter: blur(3px);
  background: rgba(42,36,5,0.4);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  opacity: 0;
  transition: opacity 0.3s ease;
`;
document.body.appendChild(overlay);

const box = document.createElement("div");
box.id = "inspectAlertBox";
box.style.cssText = `
  background: #2a2405;
  padding: 15px 25px;
  border-radius: 12px;
  text-align: center;      
  display: flex;          
  flex-direction: column;
  justify-content: center;    
  align-items: center;    
  border: 1px solid rgba(252,208,31,0.3);
  box-shadow: 0 0 15px rgba(252,208,31,0.45);
  color: white;
  font-family: 'Poppins', sans-serif;
  width: 250px;
  height: 100px;     
`;

box.innerHTML = `
  <h2 style="font-size:18px;margin-bottom:8px;color:#fcd01f;text-shadow: 0 0 4px rgba(252,208,31,0.5);">⚠️ Warning!</h2>
  <p style="font-size:13px;opacity:.85;margin-bottom:0;">Inspect element terdeteksi.</p>
`;
overlay.appendChild(box);

function showInspectWarning() {
    overlay.style.display = "flex";
    overlay.style.opacity = 1;

    setTimeout(() => {
        overlay.style.opacity = 0;
        setTimeout(() => overlay.style.display = "none", 200);
    }, 500);
}

document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  showInspectWarning();
});

document.addEventListener('keydown', function (e) {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && e.key === 'I') ||
    (e.ctrlKey && e.shiftKey && e.key === 'J') ||
    (e.ctrlKey && e.key === 'U')
  ) {
    e.preventDefault();
    showInspectWarning();
  }
});

(function() {
  const threshold = 160;
  setInterval(() => {
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      showInspectWarning();
    }
  }, 800);
})();
