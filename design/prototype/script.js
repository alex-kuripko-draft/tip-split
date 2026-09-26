// Design prototype only. Mirrors the CP-3 / CP-4 acceptance criteria closely
// enough to demonstrate the UI states, but is not the unit-tested production
// implementation — the Developer owns that in src/.

const billInput = document.getElementById("bill");
const billError = document.getElementById("bill-error");
const chips = Array.from(document.querySelectorAll(".chip[data-percent]"));
const customInput = document.getElementById("custom-percent");
const percentError = document.getElementById("percent-error");
const tipAmountEl = document.getElementById("tip-amount");
const totalAmountEl = document.getElementById("total-amount");
const peopleInput = document.getElementById("people");
const peopleError = document.getElementById("people-error");
const peopleDown = document.getElementById("people-down");
const peopleUp = document.getElementById("people-up");
const splitEmpty = document.getElementById("split-empty");
const splitLedger = document.getElementById("split-ledger");
const splitNote = document.getElementById("split-note");

let tipSource = null; // 'preset' | 'custom' | null
let tipPercent = null;

function parseBillToCents(raw) {
  const value = raw.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const [intPart, decPart = ""] = value.split(".");
  const cents = decPart.padEnd(2, "0");
  return Number(intPart) * 100 + Number(cents);
}

function parsePercent(raw) {
  const value = raw.trim();
  if (!/^\d+(\.\d+)?$/.test(value)) return null;
  const num = Number(value);
  if (num < 0 || num > 100) return null;
  return num;
}

function tipCentsFor(billCents, percent) {
  return Math.floor((billCents * percent) / 100 + 0.5 + 1e-9);
}

function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function setError(el, message) {
  if (message) {
    el.textContent = message;
    el.hidden = false;
  } else {
    el.textContent = "";
    el.hidden = true;
  }
}

function selectPreset(percent) {
  tipSource = "preset";
  tipPercent = percent;
  customInput.value = "";
  setError(percentError, null);
  render();
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => selectPreset(Number(chip.dataset.percent)));
});

customInput.addEventListener("input", () => {
  chips.forEach((chip) => chip.setAttribute("aria-checked", "false"));
  if (customInput.value.trim() === "") {
    tipSource = null;
    tipPercent = null;
    setError(percentError, null);
  } else {
    tipSource = "custom";
    tipPercent = customInput.value;
  }
  render();
});

billInput.addEventListener("input", render);

function clampPeople(n) {
  return Math.min(20, Math.max(1, n));
}

peopleDown.addEventListener("click", () => {
  const current = Number.parseInt(peopleInput.value, 10);
  peopleInput.value = String(clampPeople((Number.isFinite(current) ? current : 1) - 1));
  render();
});

peopleUp.addEventListener("click", () => {
  const current = Number.parseInt(peopleInput.value, 10);
  peopleInput.value = String(clampPeople((Number.isFinite(current) ? current : 1) + 1));
  render();
});

peopleInput.addEventListener("input", render);

function render() {
  chips.forEach((chip) => {
    chip.setAttribute("aria-checked", String(tipSource === "preset" && tipPercent === Number(chip.dataset.percent)));
  });

  // Bill
  const billRaw = billInput.value.trim();
  let billCents = null;
  if (billRaw === "") {
    setError(billError, null);
  } else {
    billCents = parseBillToCents(billRaw);
    setError(billError, billCents === null ? "Enter a bill of 0 or more, with up to 2 decimal places." : null);
  }

  // Tip percent
  let percent = null;
  if (tipSource === "preset") {
    percent = tipPercent;
    setError(percentError, null);
  } else if (tipSource === "custom") {
    percent = parsePercent(String(tipPercent));
    setError(percentError, percent === null ? "Enter a percentage from 0 to 100." : null);
  }

  const totalsValid = billCents !== null && percent !== null;
  let totalCents = null;
  if (totalsValid) {
    const tipCents = tipCentsFor(billCents, percent);
    totalCents = billCents + tipCents;
    tipAmountEl.textContent = formatCents(tipCents);
    totalAmountEl.textContent = formatCents(totalCents);
  } else {
    tipAmountEl.textContent = "—.——";
    totalAmountEl.textContent = "—.——";
  }

  // Guests
  const peopleRaw = peopleInput.value.trim();
  let people = null;
  if (peopleRaw === "" || !/^\d+$/.test(peopleRaw)) {
    setError(peopleError, "Enter a whole number of guests from 1 to 20.");
  } else {
    const n = Number(peopleRaw);
    if (n < 1 || n > 20) {
      setError(peopleError, "Enter a whole number of guests from 1 to 20.");
    } else {
      people = n;
      setError(peopleError, null);
    }
  }

  // Split
  splitLedger.innerHTML = "";
  if (!totalsValid) {
    splitEmpty.hidden = false;
    splitEmpty.textContent = "Add a bill to split the total.";
    splitLedger.hidden = true;
    splitNote.hidden = true;
    return;
  }
  if (people === null) {
    splitEmpty.hidden = false;
    splitEmpty.textContent = "Fix the guest count to see the split.";
    splitLedger.hidden = true;
    splitNote.hidden = true;
    return;
  }

  splitEmpty.hidden = true;
  splitLedger.hidden = false;

  const base = Math.floor(totalCents / people);
  const remainder = totalCents % people;

  if (remainder === 0) {
    const li = document.createElement("li");
    li.innerHTML = `<span>All guests</span><span class="amount">${formatCents(base)} each</span>`;
    splitLedger.append(li);
    splitNote.hidden = true;
  } else {
    const higherLabel = remainder === 1 ? "Person 1" : `Persons 1–${remainder}`;
    const lowerCount = people - remainder;
    const lowerLabel = lowerCount === 1 ? `Person ${people}` : `Persons ${remainder + 1}–${people}`;

    const liHigh = document.createElement("li");
    liHigh.innerHTML = `<span>${higherLabel}</span><span class="amount">${formatCents(base + 1)}</span>`;
    const liLow = document.createElement("li");
    liLow.innerHTML = `<span>${lowerLabel}</span><span class="amount">${formatCents(base)}</span>`;
    splitLedger.append(liHigh, liLow);

    const higherVerb = remainder === 1 ? "pays" : "pay";
    const lowerVerb = lowerCount === 1 ? "pays" : "pay";
    splitNote.hidden = false;
    splitNote.textContent = `${higherLabel} ${higherVerb} ${formatCents(base + 1)}; ${lowerLabel.toLowerCase()} ${lowerVerb} ${formatCents(base)}. Parts always sum to the total.`;
  }
}

render();
