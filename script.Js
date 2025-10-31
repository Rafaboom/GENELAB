// --- Dados genéticos completos e equilibrados (AJUSTADOS - MEL REMOVIDO) ---
const data = {
  olhos: {
    phenToGen: {
      "Preto": "PP",
      "Castanho": "AA",
      // "Mel": "Aa", <-- REMOVIDO
      "Verde": "aa",
      "Azul": "bb" // Azul é outro alelo recessivo
    },
    // Ordem de dominância: P > A > b > a. ('A' é Castanho, 'a' é Verde, 'b' é Azul)
    // Se 'A' e 'a' cruzam (Aa), resulta em Castanho. Se 'a' e 'b' cruzam (ab), resulta em Azul (b domina a).
    dominance: ["P", "A", "b", "a"], 
    alleleToPhen: {
      P: "Preto",
      A: "Castanho",
      a: "Verde",   // 'a' agora representa Verde
      b: "Azul"
    },
    // REMOVIDO: "Mel"
    options: ["Preto", "Castanho", "Verde", "Azul"],
    instructions: "Escolha as cores dos olhos dos pais e clique em Misturar."
  },

  cabelo: {
    phenToGen: {
      "Preto": "BB",
      "Castanho": "Bb",
      "Ruivo": "Rr",
      "Loiro": "rr"
    },
    // Ordem ajustada de dominância: Ruivo > Preto > Castanho > Loiro
    dominance: ["R", "B", "b", "r"],
    alleleToPhen: {
      R: "Ruivo",
      B: "Preto",
      b: "Castanho",
      r: "Loiro"
    },
    options: ["Preto", "Castanho", "Ruivo", "Loiro"],
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

// --- Seletores da interface (Assumindo que estes IDs estão no seu HTML) ---
const telaInicial = document.getElementById("tela-inicial");
const telaMistura = document.getElementById("tela-mistura");
const tituloCategoria = document.getElementById("tituloCategoria");
const instrucoesEl = document.getElementById("instrucoes");
const selectMae = document.getElementById("selectMae");
const selectPai = document.getElementById("selectPai");
const resultadoEl = document.getElementById("resultado");
const btnPersonalizado = document.getElementById("btnPersonalizado");
const telaPersonalizada = document.getElementById("tela-personalizada");
const voltarPersonalizadoBtn = document.getElementById("voltarPersonalizadoBtn");
const misturarPersonalizadoBtn = document.getElementById("misturarPersonalizadoBtn");
const resetarPersonalizadoBtn = document.getElementById("resetarPersonalizadoBtn");
const resultadoPersonalizado = document.getElementById("resultadoPersonalizado");
const genMae = document.getElementById("genMae");
const genPai = document.getElementById("genPai");


let categoriaAtual = null;

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

  if(telaInicial) telaInicial.classList.add("oculto");
  if(telaMistura) telaMistura.classList.remove("oculto");
  if(resultadoEl) resultadoEl.innerHTML = "";
}

function voltarInicio() {
  categoriaAtual = null;
  if(telaMistura) telaMistura.classList.add("oculto");
  if(telaInicial) telaInicial.classList.remove("oculto");
  if(resultadoEl) resultadoEl.innerHTML = "";
}

function resetarForm() {
  if (!categoriaAtual) return;
  if(selectMae) selectMae.selectedIndex = 0;
  if(selectPai) selectPai.selectedIndex = 0;
  if(resultadoEl) resultadoEl.innerHTML = "";
}

// --- Genética ---
function punnettSquare(genA, genB) {
  const gamA = [genA[0], genA[1]];
  const gamB = [genB[0], genB[1]];
  const filhos = [];
  for (let a of gamA) {
    for (let b of gamB) {
      // Ordena o genótipo para facilitar a comparação, ex: 'ba' vira 'ab'
      filhos.push([a, b].sort().join("")); 
    }
  }
  return filhos;
}

function genotypeToPhenotype(genotype, cat) {
  const info = data[cat];
  
  // 1. Verifica se o genótipo completo está explicitamente definido (ex: "PP", "aa", "bb")
  const genKey = Object.keys(info.phenToGen).find(key => info.phenToGen[key] === genotype);
  if (genKey) {
    return genKey;
  }
  
  // 2. Aplica a regra de dominância (do mais dominante ao menos)
  for (let allele of info.dominance) {
    if (genotype.includes(allele)) {
      return info.alleleToPhen[allele];
    }
  }
  
  return "Desconhecido";
}

function contarFenotipos(lista) {
  const cont = {};
  // Filtra resultados "Mel" se ainda houver algum resíduo, embora a lógica deva evitar.
  const filteredList = lista.filter(p => p !== "Mel");
  
  filteredList.forEach(f => cont[f] = (cont[f] || 0) + 1);
  
  // Garante que o cálculo de porcentagem use a lista filtrada (se necessário)
  const total = filteredList.length > 0 ? filteredList.length : lista.length; 
  
  Object.keys(cont).forEach(k => cont[k] = ((cont[k] / total) * 100).toFixed(1));
  return cont;
}


function calcularGeracoes(cat, mae, pai) {
  const info = data[cat];
  const genMae = info.phenToGen[mae];
  const genPai = info.phenToGen[pai];

  // --- OVERRIDE SOLICITADO: Tratamento especial para o cruzamento Olhos Verde (aa) x Azul (bb) ---
  if (cat === "olhos" && 
      ((mae === "Verde" && pai === "Azul") || (mae === "Azul" && pai === "Verde"))) {
    
    // Força o resultado 50.0% Verde e 50.0% Azul na F1 (Conforme sua primeira solicitação)
    const contF1Corrigido = {
      "Verde": "50.0",
      "Azul": "50.0"
    };

    // F2: Neste cenário, o genótipo F1 seria 100% 'ab'. Sem "Mel", 'ab' se resolve para "Azul" (b > a).
    // Para a F2, cruzamos 'ab' x 'ab', que resulta em: AA, Ab, Ab, bb. 
    // Que se traduz em: Castanho (A domina b e a), Azul (b domina a), Azul (b domina a), Azul (bb).
    // O resultado F2 será baseado no cálculo normal (punnettSquare('ab', 'ab'))
    const filhosF1Genotipos = ["ab", "ab", "ab", "ab"]; 
    
    const filhosF2 = [];
    // Para simplificar, fazemos um cruzamento de todos os genótipos F1 entre si
    for (let i = 0; i < filhosF1Genotipos.length; i++) {
        for (let j = i; j < filhosF1Genotipos.length; j++) {
            // Cruza o genótipo F1 (ab) x F1 (ab)
            filhosF2.push(...punnettSquare(filhosF1Genotipos[i], filhosF1Genotipos[j])); 
        }
    }
    const fenotiposF2 = filhosF2.map(f => genotypeToPhenotype(f, cat));
    const contF2 = contarFenotipos(fenotiposF2);


    return { F1: contF1Corrigido, F2: contF2 };
  }
  // --- FIM DO TRATAMENTO ESPECIAL ---

  // F1 (Cálculo normal para os outros casos)
  const filhosF1 = punnettSquare(genMae, genPai);
  const fenotiposF1 = filhosF1.map(f => genotypeToPhenotype(f, cat));
  const contF1 = contarFenotipos(fenotiposF1);

  // F2 — cruzando F1 entre si (Cálculo normal)
  const filhosF2 = [];
  const genotiposF1Unicos = [...new Set(filhosF1)];
  
  for (let i = 0; i < genotiposF1Unicos.length; i++) {
    for (let j = 0; j < genotiposF1Unicos.length; j++) {
      filhosF2.push(...punnettSquare(genotiposF1Unicos[i], genotiposF1Unicos[j]));
    }
  }
  
  const fenotiposF2 = filhosF2.map(f => genotypeToPhenotype(f, cat));
  const contF2 = contarFenotipos(fenotiposF2);

  return { F1: contF1, F2: contF2 };
}


// --- Misturar (função principal) ---
function misturar(cat) {
  if (!cat) return;
  const mae = selectMae.value;
  const pai = selectPai.value;
  
  const { F1, F2 } = calcularGeracoes(cat, mae, pai);

  let html = `<p><strong>Combinações possíveis — ${cat.toUpperCase()}</strong></p>`;
  html += `<p><strong>1ª Geração (F1):</strong></p>`;
  const sortedF1 = Object.entries(F1).sort((a, b) => b[1] - a[1]);
  for (const [p, v] of sortedF1) html += `<p>${p}: ${v}%</p>`;

  html += `<p><strong>2ª Geração (F2):</strong></p>`;
  const sortedF2 = Object.entries(F2).sort((a, b) => b[1] - a[1]);
  for (const [p, v] of sortedF2) html += `<p>${p}: ${v}%</p>`;

  if(resultadoEl) resultadoEl.innerHTML = html;
}

// --- Funções para a mistura personalizada (se presentes no HTML) ---
function misturarPersonalizado() {
  if (!genMae || !genPai || !resultadoPersonalizado) return;
  const mae = genMae.value.replace("_", "A"); // trata o A_ como dominante
  const pai = genPai.value.replace("_", "A");

  const filhos = punnettSquare(mae, pai);

  // conta resultados
  const cont = {};
  filhos.forEach(f => cont[f] = (cont[f] || 0) + 1);
  Object.keys(cont).forEach(k => cont[k] = ((cont[k] / filhos.length) * 100).toFixed(1));

  let html = `<p><strong>Combinações possíveis — Genótipos</strong></p>`;
  for (const [g, v] of Object.entries(cont)) {
    html += `<p>${g}: <strong>${v}%</strong></p>`;
  }

  resultadoPersonalizado.innerHTML = html;
}


// --- Eventos ---
if(document.getElementById("btnOlhos")) document.getElementById("btnOlhos").addEventListener("click", () => abrirCategoria("olhos"));
if(document.getElementById("btnPele")) document.getElementById("btnPele").addEventListener("click", () => abrirCategoria("pele"));
if(document.getElementById("btnCabelo")) document.getElementById("btnCabelo").addEventListener("click", () => abrirCategoria("cabelo"));
if(document.getElementById("voltarBtn")) document.getElementById("voltarBtn").addEventListener("click", voltarInicio);
if(document.getElementById("misturarBtn")) document.getElementById("misturarBtn").addEventListener("click", () => misturar(categoriaAtual));
if(document.getElementById("resetarBtn")) document.getElementById("resetarBtn").addEventListener("click", resetarForm);

// Eventos da tela personalizada
if(btnPersonalizado) {
    btnPersonalizado.addEventListener("click", () => {
        if(telaInicial) telaInicial.classList.add("oculto");
        if(telaPersonalizada) telaPersonalizada.classList.remove("oculto");
        if(resultadoPersonalizado) resultadoPersonalizado.innerHTML = "";
    });
}

if(voltarPersonalizadoBtn) {
    voltarPersonalizadoBtn.addEventListener("click", () => {
        if(telaPersonalizada) telaPersonalizada.classList.add("oculto");
        if(telaInicial) telaInicial.classList.remove("oculto");
    });
}

if(resetarPersonalizadoBtn) {
    resetarPersonalizadoBtn.addEventListener("click", () => {
        if(genMae) genMae.selectedIndex = 0;
        if(genPai) genPai.selectedIndex = 0;
        if(resultadoPersonalizado) resultadoPersonalizado.innerHTML = "";
    });
}

if(misturarPersonalizadoBtn) {
    misturarPersonalizadoBtn.addEventListener("click", misturarPersonalizado);
}