// --- Dados genéticos COMPACTADOS (Corrigido para 3 opções) ---
const data = {
    olhos: {
        // Opções: Preto (PP), Castanho (AA/Aa), Verde (aa)
        phenToGen: {
            "Preto": "PP",
            "Castanho": "AA",
            "Verde": "aa"
        },
        // O genótipo híbrido (Aa) resultará em Castanho
        options: ["Preto", "Castanho", "Verde"],
        instructions: "Escolha as características dos dois 'pais' e veja como a 'mistura' acontece!"
    },

    cabelo: {
        // Opções: Preto (BB), Castanho (Bb), Loiro (bb) - Co-dominância/Dominância Incompleta
        phenToGen: {
            "Preto": "BB",
            "Castanho": "Bb",
            "Loiro": "bb",
        },
        options: ["Preto", "Castanho", "Loiro"],
        instructions: "Escolha as cores de cabelo dos dois 'pais' e veja o resultado."
    },

    pele: {
        // Opções: Preta (DD), Parda (Dd), Branca (dd) - Herança quantitativa simplificada
        phenToGen: {
            "Preta": "DD",
            "Parda": "Dd",
            "Branca": "dd",
        },
        // Mapeamento de Genótipo-Fenótipo para os resultados F1/F2 (Lógica Reversa)
        genToPhenMap: {
            "DD": "Preta",
            "Dd": "Parda",
            "dd": "Branca"
        },
        options: ["Preta", "Parda", "Branca"],
        instructions: "Escolha os tons de pele dos dois 'pais' e veja o que pode acontecer. Lembre-se que o tom de pele é uma herança complexa com muitos genes!"
    },

    // --- CATEGORIA PERSONALIZADA (Inalterada) ---
    aa: {
        phenToGen: {
            "AA (Forte)": "AA",
            "Aa (Misto)": "Aa",
            "aa (Fraco)": "aa"
        },
        options: ["AA (Forte)", "Aa (Misto)", "aa (Fraco)"],
        instructions: "1. Dê um nome divertido ao traço Dominante (Mãe) e ao traço Recessivo (Pai). 2. Escolha os Genótipos."
    }
};

// --- Seletores da interface (Inalterados) ---
const telaInicial = document.getElementById("tela-inicial");
const telaMistura = document.getElementById("tela-mistura");
const tituloCategoria = document.getElementById("tituloCategoria");
const instrucoesEl = document.getElementById("instrucoes");

const selectMae = document.getElementById("selectMae");
const selectPai = document.getElementById("selectPai");
const formRowSelect = document.getElementById("formRowSelect");

const formRowCustom = document.getElementById("formRowCustom");
const resultadoEl = document.getElementById("resultado");

let categoriaAtual = null;

// --- Eventos (Inalterados) ---
document.getElementById("btnOlhos").addEventListener("click", () => abrirCategoria("olhos"));
document.getElementById("btnPele").addEventListener("click", () => abrirCategoria("pele"));
document.getElementById("btnCabelo").addEventListener("click", () => abrirCategoria("cabelo"));
document.getElementById("btnAa").addEventListener("click", () => abrirCategoria("aa"));
document.getElementById("voltarBtn").addEventListener("click", voltarInicio);
document.getElementById("misturarBtn").addEventListener("click", () => misturar(categoriaAtual));
document.getElementById("resetarBtn").addEventListener("click", resetarForm);


// --- Funções de UI (Inalteradas) ---

function renderCustomUI() {
    formRowCustom.innerHTML = `
        <div class="form-group">
            <label for="nomeTracoMae">Mãe</label>
            <input type="text" id="nomeTracoMae" placeholder="Nome do Traço Dominante" required>

            <label for="maeGenCustomSelect" style="margin-top: 15px;">Genótipo Mãe</label>
            <select id="maeGenCustomSelect" required>
                ${data.aa.options.map(opt => `<option value="${data.aa.phenToGen[opt]}">${opt}</option>`).join('')}
            </select>
        </div>

        <div class="form-group">
            <label for="nomeTracoPai">Pai</label>
            <input type="text" id="nomeTracoPai" placeholder="Nome do Traço Recessivo" required>

            <label for="paiGenCustomSelect" style="margin-top: 15px;">Genótipo do Pai</label>
            <select id="paiGenCustomSelect" required>
                ${data.aa.options.map(opt => `<option value="${data.aa.phenToGen[opt]}">${opt}</option>`).join('')}
            </select>
        </div>
    `;
    formRowSelect.classList.add('oculto');
    formRowCustom.classList.remove('oculto');
}

function abrirCategoria(cat) {
    categoriaAtual = cat;
    const info = data[cat];
    tituloCategoria.innerText = cat === 'aa' ? 'MISTURA CRIATIVA' : cat.toUpperCase();
    instrucoesEl.innerText = info.instructions;
    resultadoEl.innerHTML = "";

    if (cat === 'aa') {
        renderCustomUI();
    } else {
        formRowCustom.classList.add('oculto');
        formRowSelect.classList.remove('oculto');

        selectMae.innerHTML = "";
        selectPai.innerHTML = "";

        // **Ajuste para garantir que as opções do select apareçam e tenham o FENÓTIPO como valor**
        // Isso é necessário para que a função `calcularGeracoes` consiga buscar o genótipo correto.
        info.options.forEach(phenotype => {
            const o1 = document.createElement("option");
            o1.value = phenotype;
            o1.textContent = phenotype;
            selectMae.appendChild(o1);

            const o2 = document.createElement("option");
            o2.value = phenotype;
            o2.textContent = phenotype;
            selectPai.appendChild(o2);
        });
    }

    // Oculta a tela inicial e mostra a tela de mistura
    telaInicial.classList.add("oculto");
    telaMistura.classList.remove("oculto");
}

function voltarInicio() {
    categoriaAtual = null;
    telaMistura.classList.add("oculto");
    telaInicial.classList.remove("oculto");
    resultadoEl.innerHTML = "";
    formRowSelect.classList.remove('oculto');
    formRowCustom.classList.add('oculto');
}

function resetarForm() {
    if (!categoriaAtual) return;
    resultadoEl.innerHTML = "";

    if (categoriaAtual === 'aa') {
        document.getElementById("nomeTracoMae").value = '';
        document.getElementById("nomeTracoPai").value = '';
        document.getElementById("maeGenCustomSelect").selectedIndex = 0;
        document.getElementById("paiGenCustomSelect").selectedIndex = 0;
    } else {
        selectMae.selectedIndex = 0;
        selectPai.selectedIndex = 0;
    }
}


// --- Funções de Genética Corrigidas ---

function punnettSquare(genA, genB) {
    const gamA = [genA[0], genA[1]];
    const gamB = [genB[0], genB[1]];
    const filhos = [];
    for (let a of gamA) {
      for (let b of gamB) {
        // Garante que o genótipo seja sempre ordenado (ex: bB vira Bb)
        filhos.push([a, b].sort((x, y) => x.localeCompare(y, undefined, { sensitivity: 'base' })).join(""));
      }
    }
    return filhos;
}

/**
 * Converte genótipo para Fenótipo (APENAS o nome) para categorias padrão.
 */
function genotypeToPhenotype(genotype, cat) {
    const info = data[cat];
    const genP = genotype;

    // LÓGICA DE PELE: Usa o genToPhenMap.
    if (cat === 'pele') {
        return info.genToPhenMap[genP];
    }

    // Lógica para Cabelo (Dominância Incompleta/Co-dominância)
    if (cat === 'cabelo') {
        if (genP === 'BB') return "Preto";
        if (genP === 'Bb') return "Castanho";
        if (genP === 'bb') return "Loiro";
        return "Resultado Não Mapeado"; // Retorno de segurança
    }

    // Lógica para 'olhos' (Simplificada)
    if (cat === 'olhos') {
        if (genP === 'PP') return "Preto";
        // 'AA' é o genótipo Castanho puro, mas o híbrido é 'Pa' (do cruzamento) ou 'Aa' (depende do seu alelo)
        // O seu mapa genético simplificado (P = Preto, A = Castanho, a = Verde) é um pouco incomum.
        // Vamos manter a lógica original: AA ou qualquer 'A' domina sobre 'a' (Verde).
        // Aqui, os cruzamentos podem gerar: PP, PA, Pa, Aa, aa.
        
        // CORREÇÃO: Vamos usar o genótipo que o Punnett Square gerou:
        // Se usar (P, A, a):
        if (genP.includes('P')) return "Preto"; // Ex: PP, PA, Pa
        if (genP.includes('A')) return "Castanho"; // Ex: AA, Aa (Sem P)
        if (genP === 'aa') return "Verde";
        
        return "Resultado Não Mapeado"; // Retorno de segurança
    }

    return "Resultado Não Mapeado"; // Retorna para ser ignorado
}

function genotypeToPhenotypeCustom(genotype) {
    const nomeTracoDominante = document.getElementById("nomeTracoMae").value.trim() || "Traço Dominante";
    const nomeTracoRecessivo = document.getElementById("nomeTracoPai").value.trim() || "Traço Recessivo";

    // Genótipos: AA (Dominante), Aa (Misto), aa (Recessivo)
    // Para a categoria 'aa', o fenótipo deve ser diferente para 'Aa'
    if (genotype === 'AA') {
        return nomeTracoDominante;
    }
    if (genotype === 'Aa') {
        return `${nomeTracoDominante} e ${nomeTracoRecessivo} (Misto)`;
    }
    if (genotype === 'aa') {
        return nomeTracoRecessivo;
    }

    return "Resultado Não Mapeado"; // Retorna para ser ignorado
}

function contarFenotipos(lista) {
    const cont = {};
    lista.forEach(f => cont[f] = (cont[f] || 0) + 1);

    const total = lista.length; // Sempre 4 resultados
    const porcentagens = {};

    Object.keys(cont).forEach(k => {
        // Cálculo da porcentagem sobre 4 resultados (25%, 50%, 75%, 100%)
        porcentagens[k] = ((cont[k] / total) * 100).toFixed(1);
    });

    return porcentagens;
}

function calcularGeracoes(cat, mae, pai) {
    let genMae, genPai;

    if (cat === 'aa') {
      genMae = mae; // Já é o genótipo (ex: AA)
      genPai = pai; // Já é o genótipo (ex: aa)
    } else {
      const info = data[cat];
      // mae e pai são os FENÓTIPOS (ex: "Preto")
      genMae = info.phenToGen[mae];
      genPai = info.phenToGen[pai];
    }

    const filhosF1 = punnettSquare(genMae, genPai);
    const fenotiposF1 = filhosF1.map(f => {
      return cat === 'aa' ? genotypeToPhenotypeCustom(f) : genotypeToPhenotype(f, cat);
    }).filter(f => f && f !== "Resultado Não Mapeado"); // Filtra resultados inválidos
    const contF1 = contarFenotipos(fenotiposF1);

    const genotiposContF1 = contarFenotipos(filhosF1);
    const sortedGenotiposF1 = Object.entries(genotiposContF1).sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));

    // Lógica F2: Cruza o genótipo de maior frequência com o segundo maior (ou ele mesmo se 100%).
    const genF2_Pai1 = sortedGenotiposF1[0] ? sortedGenotiposF1[0][0] : genMae;

    let genF2_Pai2;
    if (sortedGenotiposF1.length === 1 && parseFloat(sortedGenotiposF1[0][1]) === 100.0) {
        // Se 100% de um genótipo, cruza ele com ele mesmo (ex: Dd x Dd)
        genF2_Pai2 = genF2_Pai1;
    } else {
        // Caso contrário, cruza o 1º maior com o 2º maior
        genF2_Pai2 = sortedGenotiposF1[1] ? sortedGenotiposF1[1][0] : genF2_Pai1;
    }

    const filhosF2 = punnettSquare(genF2_Pai1, genF2_Pai2);

    const fenotiposF2 = filhosF2.map(f => {
      return cat === 'aa' ? genotypeToPhenotypeCustom(f) : genotypeToPhenotype(f, cat);
    }).filter(f => f && f !== "Resultado Não Mapeado");
    const contF2 = contarFenotipos(fenotiposF2);

    return {
        F1: contF1,
        F2: contF2,
        genF2_Pai1: genF2_Pai1,
        finalGenF2_Pai2: genF2_Pai2
    };
}

function gerarPunnettHTML(genA, genB) {
    const gamA = [genA[0], genA[1]];
    const gamB = [genB[0], genB[1]];
    const filhos = punnettSquare(genA, genB);

    let html = `
        <table class="punnett-square">
            <tr>
                <th></th>
                <th>${gamB[0]}</th>
                <th>${gamB[1]}</th>
            </tr>
            <tr>
                <th>${gamA[0]}</th>
                <td>${filhos[0]}</td>
                <td>${filhos[1]}</td>
            </tr>
            <tr>
                <th>${gamA[1]}</th>
                <td>${filhos[2]}</td>
                <td>${filhos[3]}</td>
            </tr>
        </table>
    `;
    return html;
}


// --- Função Principal de Mistura (Termos de Geração e Exibição Corrigidos) ---

function misturar(cat) {
    if (!cat) return;

    let F1, F2;
    let nomeTraco;
    let genMae, genPai;
    let mae, pai;

    if (cat === 'aa') {
        const nomeMae = document.getElementById("nomeTracoMae").value;
        const nomePai = document.getElementById("nomeTracoPai").value;

        nomeTraco = `TRAÇOS: ${nomeMae.trim()} e ${nomePai.trim()}`;

        mae = document.getElementById("maeGenCustomSelect").value;
        pai = document.getElementById("paiGenCustomSelect").value;
        genMae = mae;
        genPai = pai;

        if (!nomeMae || !nomePai || !mae || !pai) {
            resultadoEl.innerHTML = '<p style="color: red; font-weight: bold;">Ops! Não esqueça de preencher os nomes e genótipos.</p>';
            return;
        }

        const resultados = calcularGeracoes(cat, mae, pai);
        F1 = resultados.F1;
        F2 = resultados.F2;

    } else {
        mae = selectMae.value;
        pai = selectPai.value;
        const info = data[cat];

        // Obtém o Genótipo a partir do Fenótipo selecionado
        genMae = info.phenToGen[mae];
        genPai = info.phenToGen[pai];
        
        // Verifica se os genótipos foram encontrados
        if (!genMae || !genPai) {
             resultadoEl.innerHTML = '<p style="color: red; font-weight: bold;">Erro: Genótipo não encontrado para a combinação de fenótipos.</p>';
             return;
        }

        const resultados = calcularGeracoes(cat, mae, pai);
        F1 = resultados.F1;
        F2 = resultados.F2;

        nomeTraco = cat.toUpperCase();
    }

    // --- Exibição CORRIGIDA ---

    let html = `<div class="resultado-box"><p><strong>O que acontece quando misturamos ${nomeTraco}?</strong></p>`;

    // Quadrado de Punnett
    html += gerarPunnettHTML(genMae, genPai);

    // Formatar F1 -> Primeira Ninhada (Filhotes)
    html += `<p class="result-title"><strong>Primeiro filho:</strong></p>`;
    const entriesF1 = Object.entries(F1).sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));
    entriesF1.forEach(([phen, perc]) => {
        if (phen !== "Resultado Não Mapeado") {
            html += `<p>${phen}: <strong>${perc}%</strong> (Chance)</p>`;
        }
    });

    // Formatar F2 -> Segunda Ninhada (Netos dos Pais)
    html += `<p class="result-title" style="margin-top: 25px;"><strong>Netos dos Pais</strong></p>`;
    const entriesF2 = Object.entries(F2).sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));
    entriesF2.forEach(([phen, perc]) => {
        if (phen !== "Resultado Não Mapeado") {
            html += `<p>${phen}: <strong>${perc}%</strong> (Chance)</p>`;
        }
    });

    html += `</div>`;
    resultadoEl.innerHTML = html;
}
