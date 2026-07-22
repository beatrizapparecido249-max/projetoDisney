import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAfpGoMRw29CCtYhb1MIyqd81p8YpRPoT0",
  authDomain: "projetodisney-8842a.firebaseapp.com",
  projectId: "projetodisney-8842a",
  storageBucket: "projetodisney-8842a.firebasestorage.app",
  messagingSenderId: "770288807692",
  appId: "1:770288807692:web:e12b072e805d68c93de329"
};

// Inicialização
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const favoritesRef = collection(db, "favoritos_disney");

// Elementos da DOM
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const userNameInput = document.getElementById('user-name');
const characterCard = document.getElementById('character-card');
const charImg = document.getElementById('char-img');
const charName = document.getElementById('char-name');
const charFilms = document.getElementById('char-films');
const favoriteBtn = document.getElementById('favorite-btn');
const favoritesGrid = document.getElementById('favorites-grid');

// Estado local
let currentCharacter = null;

// -------------------------------------------------------------
// Dicionário de Tradução (PT-BR -> EN)
// Mapeia termos comuns em português para a busca na Disney API
// -------------------------------------------------------------
const nameTranslations = {
  "branca de neve": "snow white",
  "cinderela": "cinderella",
  "bela adormecida": "sleeping beauty",
  "aurora": "aurora",
  "pequena sereia": "ariel",
  "bela": "belle",
  "fera": "beast",
  "pato donald": "donald duck",
  "pateta": "goofy",
  "margarida": "daisy duck",
  "tio patinhas": "scrooge mcduck",
  "chapeuzinho vermelho": "little red riding hood",
  "urso pooh": "winnie the pooh",
  "pooh": "winnie the pooh",
  "sininho": "tinker bell",
  "tinkerbell": "tinker bell",
  "capitao gancho": "captain hook",
  "capitão gancho": "captain hook",
  "pinoquio": "pinocchio",
  "pinóquio": "pinocchio",
  "gatão": "cheshire cat",
  "gato de cheshire": "cheshire cat",
  "coelho branco": "white rabbit",
  "chapeleiro maluco": "mad hatter",
  "rainha de copas": "queen of hearts",
  "cruela": "cruella de vil",
  "cruella": "cruella de vil",
  "rei leao": "simba",
  "rei leão": "simba",
  "mufasa": "mufasa",
  "scar": "scar",
  "corcunda de notre dame": "quasimodo",
  "enrolados": "rapunzel",
  "valente": "merida",
  "homem de ferro": "iron man",
  "capitao america": "captain america",
  "capitão américa": "captain america"
};

// Função para normalizar texto (remove acentos e caixa alta/baixa)
function normalizeText(text) {
  return text
    ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
    : "";
}

// -------------------------------------------------------------
// Integração Avançada com a Disney API
// -------------------------------------------------------------
async function searchCharacter() {
  const rawInput = searchInput.value.trim();
  if (!rawInput) return alert("Digite o nome de um personagem!");

  const normalizedInput = normalizeText(rawInput);

  // Traduz para o inglês se existir no dicionário, senão usa o texto digitado
  const searchTermEN = nameTranslations[normalizedInput] || rawInput;

  try {
    const response = await fetch(`https://api.disneyapi.dev/character?name=${encodeURIComponent(searchTermEN)}`);
    const json = await response.json();

    let results = [];
    if (Array.isArray(json.data)) {
      results = json.data;
    } else if (json.data && typeof json.data === 'object') {
      results = [json.data];
    }

    if (results.length === 0) {
      alert("Personagem não encontrado! Verifique a ortografia do nome.");
      characterCard.classList.add('hidden');
      return;
    }

    // Algoritmo de seleção do melhor resultado
    const searchTarget = normalizeText(searchTermEN);

    let bestMatch = results.find(item => normalizeText(item.name) === searchTarget && item.imageUrl);

    if (!bestMatch) {
      bestMatch = results.find(item => normalizeText(item.name).includes(searchTarget) && item.imageUrl);
    }

    if (!bestMatch) {
      bestMatch = results.find(item => item.imageUrl);
    }

    if (!bestMatch) {
      bestMatch = results[0];
    }

    // Monta o objeto local
    currentCharacter = {
      name: bestMatch.name,
      imageUrl: bestMatch.imageUrl || "https://via.placeholder.com/200x250?text=Sem+Foto",
      films: [
        ...(bestMatch.films || []),
        ...(bestMatch.shortFilms || []),
        ...(bestMatch.tvShows || [])
      ]
    };

    // Atualiza a DOM
    charImg.src = currentCharacter.imageUrl;
    charName.textContent = currentCharacter.name;
    charFilms.innerHTML = "";

    if (currentCharacter.films.length > 0) {
      currentCharacter.films.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        charFilms.appendChild(li);
      });
    } else {
      charFilms.innerHTML = "<li>Nenhuma aparição catalogada</li>";
    }

    characterCard.classList.remove('hidden');

  } catch (error) {
    console.error("Erro na busca:", error);
    alert("Ocorreu um erro ao conectar com a API da Disney.");
  }
}

searchBtn.addEventListener('click', searchCharacter);

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchCharacter();
});

// -------------------------------------------------------------
// Salvar no Firebase
// -------------------------------------------------------------
favoriteBtn.addEventListener('click', async () => {
  if (!currentCharacter) return;

  const savedBy = userNameInput.value.trim() || "Anônimo";

  try {
    await addDoc(favoritesRef, {
      name: currentCharacter.name,
      imageUrl: currentCharacter.imageUrl,
      savedBy: savedBy,
      createdAt: serverTimestamp()
    });
    alert(`${currentCharacter.name} adicionado aos favoritos da turma!`);
  } catch (error) {
    console.error("Erro ao favoritar:", error);
  }
});

// -------------------------------------------------------------
// Excluir do Firebase
// -------------------------------------------------------------
async function removeFavorite(id) {
  try {
    const docRef = doc(db, "favoritos_disney", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao remover:", error);
  }
}

// -------------------------------------------------------------
// Sincronização em Tempo Real (Sem exigir índices no Firestore)
// -------------------------------------------------------------
onSnapshot(favoritesRef, (snapshot) => {
  favoritesGrid.innerHTML = "";

  // Converte para array e ordena via JavaScript no navegador
  const docs = [];
  snapshot.forEach((docSnapshot) => {
    docs.push({ id: docSnapshot.id, ...docSnapshot.data() });
  });

  // Ordena por data de criação (mais recente primeiro)
  docs.sort((a, b) => {
    const timeA = a.createdAt ? a.createdAt.toMillis() : Date.now();
    const timeB = b.createdAt ? b.createdAt.toMillis() : Date.now();
    return timeB - timeA;
  });

  docs.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'fav-card';

    card.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}">
      <p>${item.name}</p>
      <small>Por: ${item.savedBy || 'Anônimo'}</small><br>
      <button class="btn-delete" data-id="${item.id}">Excluir</button>
    `;

    card.querySelector('.btn-delete').addEventListener('click', () => removeFavorite(item.id));

    favoritesGrid.appendChild(card);
  });
});