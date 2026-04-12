const dollarInput = document.getElementById('dollar');
const resultSpan = document.getElementById('result');
const rateDiv = document.querySelector('.rate');
const lastUpdatedDiv = document.querySelector('.last-updated');

const toastContainer = document.getElementById('toast-container');


let currentRate = null;

fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRIefvbp0yDlYWWzhw-gnVjKgyh0GvADomMb_0yqhXpArd-29mVfVNWdHACI8kJ9TtPd1LBTOVW7YEc/pub?output=csv')
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


dollarInput.addEventListener('input', () => {
  if (!currentRate) {
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


const bubble = document.getElementById('contact-bubble');
const popup = document.getElementById('contact-popup');

bubble.addEventListener('click', function() {
  popup.classList.toggle('show');
});

document.addEventListener('click', function(e) {
  if (!bubble.contains(e.target) && !popup.contains(e.target)) {
    popup.classList.remove('show');
  }
});


const BUYER_API = 'https://script.google.com/macros/s/AKfycbwhdlGULaYiVDYh2vQ5OLVKLy4HTQYDUGWPpHb4J3eFypYAG9CHYjbP2mJ121tFwAgu/exec';

let buyerData = [];
let index = 0;
let fakeCounter = 0;

function maskName(name) {
  if (!name) return "";

  const clean = name.trim().toUpperCase();

  if (clean.length <= 3) return clean;

  const first = clean.slice(0, 2);
  const stars = "*****";

  return first + stars;
}

function getFakeTime() {
  fakeCounter++;

  if (fakeCounter % 5 === 0) return "just now";
  if (fakeCounter % 5 === 1) return "2s ago";
  if (fakeCounter % 5 === 2) return "5s ago";
  if (fakeCounter % 5 === 3) return "moments ago";
  return "recently";
}

async function loadBuyerData() {
  try {
    const res = await fetch(BUYER_API);
    buyerData = shuffleArray(await res.json());
index = Math.floor(Math.random() * buyerData.length);
  } catch (err) {
    console.error('Buyer API error:', err);
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showToast(data) {
  if (!toastContainer) return;

  const el = document.createElement('div');
  el.classList.add('toast');

  const amount = Number(data.amount ?? 0);
  const currency = data.currency ?? "";

  el.innerHTML = `
    💰 <b>${maskName(data.name)}</b> bought <b>${amount.toLocaleString()}</b> ${currency}
    <small>${getFakeTime()}</small>
  `;

  toastContainer.appendChild(el);

  setTimeout(() => {
    el.style.animation = "toastOut 0.4s ease forwards";
    setTimeout(() => el.remove(), 400);
  }, 3000);
}

function startBuyerLoop() {
  setInterval(() => {
    if (!buyerData.length) return;

    showToast(buyerData[index]);

    index++;
    if (index >= buyerData.length) {
  buyerData = shuffleArray(buyerData);
  index = 0;
}

  }, 8000);
}

loadBuyerData().then(() => {
  startBuyerLoop();
});
