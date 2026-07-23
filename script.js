import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp 
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

let currentCharacter = null;

// -------------------------------------------------------------
// Dicionário Ampliado de Tradução (PT-BR -> EN)
// -------------------------------------------------------------
const nameTranslations = {
  // Clássicos Disney
  "mickey": "mickey mouse",
  "minnie": "minnie mouse",
  "pato donald": "donald duck",
  "pateta": "goofy",
  "margarida": "daisy duck",
  "tio patinhas": "scrooge mcduck",
  "pluto": "pluto",
  
  // Princesas e Heróis Clássicos
  "branca de neve": "snow white",
  "cinderela": "cinderella",
  "bela adormecida": "sleeping beauty",
  "aurora": "aurora",
  "pequena sereia": "ariel",
  "ariel": "ariel",
  "bela": "belle",
  "fera": "beast",
  "aladdin": "aladdin",
  "genio": "genie",
  "gênio": "genie",
  "jasmin": "jasmine",
  "jasmim": "jasmine",
  "mulan": "mulan",
  "pocahontas": "pocahontas",
  "tarzan": "tarzan",
  "hercules": "hercules",
  "hércules": "hercules",
  "pinoquio": "pinocchio",
  "pinóquio": "pinocchio",
  "peter pan": "peter pan",
  "sininho": "tinker bell",
  "tinkerbell": "tinker bell",
  "capitao gancho": "captain hook",
  "capitão gancho": "captain hook",
  "chapeuzinho vermelho": "little red riding hood",
  
  // O Rei Leão & Filmes Animados
  "rei leao": "simba",
  "rei leão": "simba",
  "simba": "simba",
  "mufasa": "mufasa",
  "scar": "scar",
  "timão": "timon",
  "timao": "timon",
  "pumba": "pumbaa",
  "stitch": "stitch",
  "lilo": "lilo",
  "urso pooh": "winnie the pooh",
  "pooh": "winnie the pooh",
  "tigrão": "tigger",
  "tigrao": "tigger",
  "bambi": "bambi",
  "dumbo": "dumbo",
  "corcunda de notre dame": "quasimodo",
  "quasimodo": "quasimodo",
  "gatão": "cheshire cat",
  "gato de cheshire": "cheshire cat",
  "coelho branco": "white rabbit",
  "chapeleiro maluco": "mad hatter",
  "rainha de copas": "queen of hearts",
  "cruela": "cruella de vil",
  "cruella": "cruella de vil",
  "malévola": "maleficent",
  "malevola": "maleficent",

  // Animações Modernas & Pixar
  "elsa": "elsa",
  "anna": "anna",
  "olaf": "olaf",
  "frozen": "elsa",
  "enrolados": "rapunzel",
  "rapunzel": "rapunzel",
  "flynn rider": "flynn rider",
  "moana": "moana",
  "maui": "maui",
  "valente": "merida",
  "merida": "merida",
  "detona ralph": "wreck-it ralph",
  "ralph": "wreck-it ralph",
  "vanellope": "vanellope",
  "baymax": "baymax",
  "judy hopps": "judy hopps",
  "nick wilde": "nick wilde",
  "zootopia": "judy hopps",
  "rayo mcqueen": "lightning mcqueen",
  "relampago mcqueen": "lightning mcqueen",
  "relâmpago mcqueen": "lightning mcqueen",
  "woody": "woody",
  "buzz": "buzz lightyear",
  "buzz lightyear": "buzz lightyear",
  "wall-e": "wall-e",
  "walle": "wall-e",
  "ratatouille": "remy",
  "remy": "remy",

  // Marvel / Outros incorporados na API
  "homem de ferro": "iron man",
  "capitao america": "captain america",
  "capitão américa": "captain america",
  "thor": "thor",
  "homem aranha": "spider-man"
};

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

    currentCharacter = {
      name: bestMatch.name,
      imageUrl: bestMatch.imageUrl || "https://via.placeholder.com/200x250?text=Sem+Foto",
      films: [
        ...(bestMatch.films || []),
        ...(bestMatch.shortFilms || []),
        ...(bestMatch.tvShows || [])
      ]
    };

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
// Sincronização em Tempo Real
// -------------------------------------------------------------
onSnapshot(favoritesRef, (snapshot) => {
  favoritesGrid.innerHTML = "";

  const docs = [];
  snapshot.forEach((docSnapshot) => {
    docs.push({ id: docSnapshot.id, ...docSnapshot.data() });
  });

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

// -------------------------------------------------------------
// Efeito 3D Parallax Tilt no Card Principal
// -------------------------------------------------------------
const cardElement = document.getElementById('character-card');

cardElement.addEventListener('mousemove', (e) => {
  const rect = cardElement.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const rotateX = ((y - centerY) / centerY) * -15;
  const rotateY = ((x - centerX) / centerX) * 15;
  
  cardElement.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

cardElement.addEventListener('mouseleave', () => {
  cardElement.style.transform = `rotateX(0deg) rotateY(0deg)`;
});