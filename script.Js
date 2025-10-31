// --- Dados genéticos completos e equilibrados ---
const data = {
  olhos: {
    phenToGen: {
      "Preto": "PP",
      "Castanho": "AA",
      "Mel": "Aa",
      "Verde": "aa",
      "Azul": "bb"
    },
    dominance: ["P", "A", "a", "b"],
    alleleToPhen: {
      P: "Preto",
      A: "Castanho",
      a: "Mel",
      b: "Azul"
    },
    options: ["Preto", "Castanho", "Mel", "Verde", "Azul"],
    instructions: "Escolha as cores dos olhos dos pais e clique em Misturar."
  },

  cabelo: {
    phenToGen: {
      "Preto": "BB",
      "Castanho": "Bb",
      "Loiro": "aa",
      "Ruivo": "rr",
      "Branco": "ww"
    },
    dominance: ["B", "b", "r", "a", "w"],
    alleleToPhen: {
      B: "Preto",
      b: "Castanho",
      r: "Ruivo",
      a: "Loiro",
      w: "Branco"
    },
    options: ["Preto", "Castanho", "Loiro", "Ruivo", "Branco"],
    instructions: "Escolha as cores do cabelo dos pais e clique em Misturar."
  },

  pele: {
    phenToGen: {
      "Preta": "DD",
      "Parda": "Dd",
      "Branca": "dd",
      "Amarela": "Aa",
      "Indígena": "Ii"
    },
    dominance: ["D", "A", "I", "d"],
    alleleToPhen: {
      D: "Preta",
      A: "Amarela",
      I: "Indígena",
      d: "Branca"
    },
    options: ["Preta", "Parda", "Branca", "Amarela", "Indígena"],
    instructions: "Escolha os tons de pele dos pais e clique em Misturar."
  }
};

// --- Seletores da interface ---
const telaInicial = document.getElementById("tela-inicial");
const telaMistura = document.getElementById("tela-mistura");
const tituloCategoria = document.getElementById("tituloCategoria");
const instrucoesEl = document.getElementById("instrucoes");
const selectMae = document.getElementById("selectMae");
const selectPai = document.getElementById("selectPai");
const resultadoEl = document.getElementById("resultado");

let categoriaAtual = null;

// --- Eventos ---
document.getElementById("btnOlhos").addEventListener("click", () => abrirCategoria("olhos"));
document.getElementById("btnPele").addEventListener("click", () => abrirCategoria("pele"));
document.getElementById("btnCabelo").addEventListener("click", () => abrirCategoria("cabelo"));
document.getElementById("voltarBtn").addEventListener("click", voltarInicio);
document.getElementById("misturarBtn").addEventListener("click", () => misturar(categoriaAtual));
document.getElementById("resetarBtn").addEventListener("click", resetarForm);

// --- Funções de UI ---
function abrirCategoria(cat) {
  categoriaAtual = cat;
  const info = data[cat];
  tituloCategoria.innerText = cat.toUpperCase();
  instrucoesEl.innerText = info.instructions;

  selectMae.innerHTML = "";
  selectPai.innerHTML = "";

  info.options.forEach(opt => {
    const o1 = document.createElement("option");
    o1.value = opt;
    o1.textContent = opt;
    selectMae.appendChild(o1);

    const o2 = document.createElement("option");
    o2.value = opt;
    o2.textContent = opt;
    selectPai.appendChild(o2);
  });

  telaInicial.classList.add("oculto");
  telaMistura.classList.remove("oculto");
  resultadoEl.innerHTML = "";
}

function voltarInicio() {
  categoriaAtual = null;
  telaMistura.classList.add("oculto");
  telaInicial.classList.remove("oculto");
  resultadoEl.innerHTML = "";
}

function resetarForm() {
  if (!categoriaAtual) return;
  selectMae.selectedIndex = 0;
  selectPai.selectedIndex = 0;
  resultadoEl.innerHTML = "";
}

// --- Genética ---
function punnettSquare(genA, genB) {
  const gamA = [genA[0], genA[1]];
  const gamB = [genB[0], genB[1]];
  const filhos = [];
  for (let a of gamA) {
    for (let b of gamB) {
      filhos.push([a, b].sort().join(""));
    }
  }
  return filhos;
}

function genotypeToPhenotype(genotype, cat) {
  const info = data[cat];
  for (let allele of info.dominance) {
    if (genotype.includes(allele)) {
      return info.alleleToPhen[allele];
    }
  }
  return info.alleleToPhen[genotype[1]] || "Desconhecido";
}

function calcularGeracoes(cat, mae, pai) {
  const info = data[cat];
  const genMae = info.phenToGen[mae];
  const genPai = info.phenToGen[pai];

  // F1
  const filhosF1 = punnettSquare(genMae, genPai);
  const fenotiposF1 = filhosF1.map(f => genotypeToPhenotype(f, cat));
  const contF1 = contarFenotipos(fenotiposF1);

  // F2 — cruzando F1 entre si
  const filhosF2 = [];
  for (let i = 0; i < filhosF1.length; i++) {
    for (let j = i; j < filhosF1.length; j++) {
      filhosF2.push(...punnettSquare(filhosF1[i], filhosF1[j]));
    }
  }
  const fenotiposF2 = filhosF2.map(f => genotypeToPhenotype(f, cat));
  const contF2 = contarFenotipos(fenotiposF2);

  return { F1: contF1, F2: contF2 };
}

function contarFenotipos(lista) {
  const cont = {};
  lista.forEach(f => cont[f] = (cont[f] || 0) + 1);
  Object.keys(cont).forEach(k => cont[k] = ((cont[k] / lista.length) * 100).toFixed(1));
  return cont;
}

// --- Misturar ---
function misturar(cat) {
  if (!cat) return;
  const mae = selectMae.value;
  const pai = selectPai.value;
  const { F1, F2 } = calcularGeracoes(cat, mae, pai);

  let html = `<p><strong>Combinações possíveis — ${cat.toUpperCase()}</strong></p>`;
  html += `<p><strong>1ª Geração (F1):</strong></p>`;
  for (const [p, v] of Object.entries(F1)) html += `<p>${p}: ${v}%</p>`;

  html += `<p><strong>2ª Geração (F2):</strong></p>`;
  for (const [p, v] of Object.entries(F2)) html += `<p>${p}: ${v}%</p>`;

  resultadoEl.innerHTML = html;
}
