/**
 * Ranking 100% estático — abre index.html no navegador, sem servidor.
 * Fonte padrão: #lista-fonte no HTML. Opcional: carregar um .txt pelo botão.
 * Formato: 5.98 | Bloodlust   |   7.31 | Peer Gynt ?
 */

function parseLista(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const sep = line.indexOf("|");
      if (sep === -1) return null;
      const score = Number.parseFloat(line.slice(0, sep).trim().replace(",", "."));
      let name = line.slice(sep + 1).trim();
      if (!Number.isFinite(score) || !name) return null;

      const pending = /\?\s*$/.test(name);
      if (pending) name = name.replace(/\s*\?\s*$/, "").trim();

      return { score, name, pending };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}

function tierFor(score) {
  if (score >= 7) return 7;
  if (score >= 6) return 6;
  if (score >= 5) return 5;
  if (score >= 4) return 4;
  if (score >= 3) return 3;
  if (score >= 2) return 2;
  return 1;
}

function formatScore(score) {
  return score.toFixed(2);
}

function fillName(el, entry) {
  el.textContent = "";
  el.append(document.createTextNode(entry.name));
  if (entry.pending) {
    const mark = document.createElement("span");
    mark.className = "rank-pending";
    mark.textContent = "?";
    mark.title = "Ainda não batido — progresso avançado";
    el.append(" ", mark);
  }
}

function render(entries) {
  const list = document.getElementById("ranking");
  list.replaceChildren();

  entries.forEach((entry, index) => {
    const li = document.createElement("li");
    li.className = "rank-row";
    li.style.animationDelay = `${Math.min(index, 24) * 35}ms`;

    const pos = document.createElement("span");
    pos.className = "rank-pos";
    pos.textContent = String(index + 1).padStart(2, "0");

    const score = document.createElement("span");
    score.className = `rank-score tier-${tierFor(entry.score)}`;
    score.textContent = formatScore(entry.score);

    const name = document.createElement("span");
    name.className = "rank-name";
    fillName(name, entry);

    li.append(pos, score, name);
    list.appendChild(li);
  });
}

function setStatus(message, show = true) {
  const el = document.getElementById("status");
  el.hidden = !show;
  el.textContent = message;
}

function loadFromText(text) {
  const entries = parseLista(text);
  if (!entries.length) {
    setStatus("Nenhuma linha válida. Use o formato: 5.98 | Nome");
    return;
  }
  setStatus("", false);
  render(entries);
}

document.getElementById("file-input").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => loadFromText(String(reader.result ?? ""));
  reader.onerror = () => setStatus("Não foi possível ler o arquivo.");
  reader.readAsText(file);
});

loadFromText(document.getElementById("lista-fonte").textContent);
