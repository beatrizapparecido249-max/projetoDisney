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

// -------------------------------------------------------------
// Controle da Tela de Abertura (Intro Disney)
// -------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  const introOverlay = document.getElementById('intro-overlay');
  
  setTimeout(() => {
    introOverlay.classList.add('fade-out');
    setTimeout(() => {
      introOverlay.style.display = 'none';
    }, 1000);
  }, 3200);
});

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAfpGoMRw29CCtYhb1MIyqd81p8YpRPoT0",
  authDomain: "projetodisney-8842a.firebaseapp.com",
  projectId: "projetodisney-8842a",
  storageBucket: "projetodisney-8842a.firebasestorage.app",
  messagingSenderId: "770288807692",
  appId: "1:770288807692:web:e12b072e805d68c93de329"
};

// Inicialização Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const favoritesRef = collection(db, "favoritos_disney");

// Elementos da DOM Principais
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const userNameInput = document.getElementById('user-name');
const characterCard = document.getElementById('character-card');
const charImg = document.getElementById('char-img');
const charName = document.getElementById('char-name');
const charSummary = document.getElementById('char-summary');
const charFilms = document.getElementById('char-films');
const favoriteBtn = document.getElementById('favorite-btn');
const favoritesGrid = document.getElementById('favorites-grid');

let currentCharacter = null;

// =============================================================
// 🧩 SISTEMA DE QUIZ DISNEY (3 NÍVEIS x 15 PERGUNTAS)
// =============================================================
const quizData = {
  facil: [
    { question: "Qual foi o primeiro longa-metragem animado da Disney?", options: ["Cinderela", "Branca de Neve", "Pinóquio", "Bambi"], answer: 1 },
    { question: "Qual é o nome do sapatinho de Cinderela?", options: ["De Cristal", "De Prata", "De Ouro", "De Diamante"], answer: 0 },
    { question: "Em 'O Rei Leão', qual é o nome do pai de Simba?", options: ["Scar", "Rafiki", "Mufasa", "Kovu"], answer: 2 },
    { question: "Qual princesa Disney tem cabelos mágicos dourados?", options: ["Ariel", "Bela", "Rapunzel", "Aurora"], answer: 2 },
    { question: "Qual o nome do boneco de neve que adora abraços quentinhos?", options: ["Sven", "Kristoff", "Olaf", "Marshmallow"], answer: 2 },
    { question: "Qual é o verdadeiro nome da Bela Adormecida?", options: ["Cinderela", "Aurora", "Branca de Neve", "Tiana"], answer: 1 },
    { question: "Qual o dragão que acompanha Mulan em sua jornada?", options: ["Mushu", "Toothless", "Elliot", "Sisu"], answer: 0 },
    { question: "Quem é o vilão principal do filme 'Aladdin'?", options: ["Gaston", "Jafar", "Hades", "Dr. Facilier"], answer: 1 },
    { question: "Qual é a frase famosa do Buzz Lightyear em 'Toy Story'?", options: ["Até logo, parceiro", "Eu sou o rei do mundo", "Ao infinito e além!", "Para o alto e avante"], answer: 2 },
    { question: "Como se chama a robô por quem WALL-E se apaixona?", options: ["EVA", "ROSA", "LISA", "MAYA"], answer: 0 },
    { question: "Qual é a princesa que vive no reino de Motunui?", options: ["Rapunzel", "Moana", "Merida", "Pocahontas"], answer: 1 },
    { question: "Quem é o melhor amigo do Mickey Mouse?", options: ["Pato Donald", "Pateta", "Pluto", "Bafo de Onça"], answer: 1 },
    { question: "Qual o nome do caranguejo amigo de Ariel em 'A Pequena Sereia'?", options: ["Linguado", "Sebastião", "Sabidão", "Tritão"], answer: 1 },
    { question: "Em 'Procurando Nemo', qual a espécie do Nemo?", options: ["Peixe-palhaço", "Peixe-cirurgião", "Tubarão", "Atum"], answer: 0 },
    { question: "Quem perde o sapato de cristal à meia-noite?", options: ["Bela", "Aurora", "Cinderela", "Jasmine"], answer: 2 }
  ],
  medio: [
    { question: "Qual é a raça do cãozinho Pluto?", options: ["Beagle", "Bloodhound", "Dalmata", "Poodle"], answer: 1 },
    { question: "Qual o nome da cidade fictícia onde se passa 'Monstros S.A.'?", options: ["Monstro polis", "Monstrópolis", "Metroville", "Zootopia"], answer: 1 },
    { question: "Qual animal é o Stitch da franquia 'Lilo & Stitch'?", options: ["Um urso", "Um cachorro", "Uma Experiência Alienígena", "Um coelho"], answer: 2 },
    { question: "Em que ano Mickey Mouse fez sua estreia com 'Steamboat Willie'?", options: ["1928", "1937", "1940", "1950"], answer: 0 },
    { question: "Qual a primeira princesa de origem indígena americana?", options: ["Mulan", "Pocahontas", "Moana", "Tiana"], answer: 1 },
    { question: "Qual o nome do camaleão de estimação da Rapunzel?", options: ["Pascal", "Sven", "Meeko", "Ray"], answer: 0 },
    { question: "Quem canta 'Livre Estou' na versão brasileira de Frozen?", options: ["Taryn Szpilman", "Idina Menzel", "Wanessa Camargo", "Sandy"], answer: 0 },
    { question: "Em 'Zootopia', qual animal é a protagonista Judy Hopps?", options: ["Raposa", "Coelha", "Ovelha", "Preguiça"], answer: 1 },
    { question: "Qual o nome da cidade onde vive Os Incríveis?", options: ["San Fransokyo", "Metroville", "Radiator Springs", "Danville"], answer: 1 },
    { question: "Qual é o nome da mãe de Simba em 'O Rei Leão'?", options: ["Sarabi", "Nala", "Sarafina", "Kiara"], answer: 0 },
    { question: "Por quantos anos a bruxa faz Aurora dormir na maldição?", options: ["50 anos", "100 anos", "10 anos", "Para sempre"], answer: 1 },
    { question: "Em 'Viva: A Vida é uma Festa', qual instrumento Miguel toca?", options: ["Violino", "Violão", "Piano", "Trompete"], answer: 1 },
    { question: "Qual a profissão do pai da Bela em 'A Bela e a Fera'?", options: ["Ferreiro", "Padeiro", "Inventor", "Médico"], answer: 2 },
    { question: "Qual o nome do urso mentor do Mogli?", options: ["Kaa", "Bagheera", "Baloo", "King Louie"], answer: 2 },
    { question: "Qual o nome do guaxinim de estimação da Pocahontas?", options: ["Flit", "Meeko", "Percy", "Kenai"], answer: 1 }
  ],
  dificil: [
    { question: "Qual foi o primeiro longa da Pixar nos cinemas?", options: ["Vida de Inseto", "Toy Story", "Monstros S.A.", "Carros"], answer: 1 },
    { question: "Em 'A Nova Onda do Imperador', Kuzco vira qual animal?", options: ["Lhama", "Jaguaretê", "Sapo", "Condor"], answer: 0 },
    { question: "Qual o nome da ilha onde fica o esconderijo do Síndrome em 'Os Incríveis'?", options: ["Nomanisan", "Pala", "Isla Nublar", "Motunui"], answer: 0 },
    { question: "Qual é o nome do meio oficial do Pato Donald?", options: ["Fauntleroy", "Duck Jr.", "von Drake", "McDuck"], answer: 0 },
    { question: "Em 'Hércules', quais os nomes dos dois capangas de Hades?", options: ["Pânico e Agonia", "Dor e Pânico", "Caos e Pânico", "Raiva e Agonia"], answer: 1 },
    { question: "Em 'Detona Ralph', qual o jogo de corrida da Vanellope?", options: ["Sugar Rush", "Hero's Duty", "Fix-It Felix", "Speed Racer"], answer: 0 },
    { question: "Em que ano a Walt Disney Company celebrou seu centenário?", options: ["2023", "2022", "2020", "2024"], answer: 0 },
    { question: "Qual o nome do estúdio fundado em 1923 por Walt e Roy Disney?", options: ["Disney Brothers Cartoon Studio", "Walt Disney Productions", "Hyperion Studios", "Mickey Mouse Studio"], answer: 0 },
    { question: "Em qual cidade se passa 'A Princesa e o Sapo'?", options: ["Nova York", "Nova Orleans", "Chicago", "Atlanta"], answer: 1 },
    { question: "Em 'Valente', qual o nome dos três irmãos de Merida?", options: ["Hubert, Hamish e Harris", "John, Michael e Peter", "Huey, Dewey e Louie", "Leo, Raph e Donnie"], answer: 0 },
    { question: "Qual a única princesa Disney com irmãos biológicos no filme principal?", options: ["Merida", "Ariel", "Cinderela", "Mulan"], answer: 0 },
    { question: "Qual o nome do restaurante 5 estrelas em 'Ratatouille'?", options: ["Le Rat", "Gusteau's", "La Ratatouille", "Chez Gusteau"], answer: 1 },
    { question: "Qual o primeiro longa 100% em computação gráfica 3D do Disney Animation Studios?", options: ["Toy Story", "Dinossauro", "O Galinho Chicken Little", "Bolt"], answer: 2 },
    { question: "Em 'Big Hero 6', em qual cidade fictícia a história se passa?", options: ["Metroville", "San Fransokyo", "Zootopia", "New Yolk"], answer: 1 },
    { question: "Qual foi o último filme supervisionado pessoalmente por Walt Disney antes de falecer?", options: ["Mogli - O Menino Lobo", "A Espada Era a Lei", "Aristogatas", "101 Dálmatas"], answer: 0 }
  ]
};

let currentLevel = "facil";
let currentQuizIndex = 0;
let quizScore = 0;

const quizQuestionEl = document.getElementById('quiz-question');
const quizOptionsEl = document.getElementById('quiz-options');
const quizProgressEl = document.getElementById('quiz-progress');
const quizContainer = document.getElementById('quiz-container');
const quizResultEl = document.getElementById('quiz-result');
const quizScoreEl = document.getElementById('quiz-score');
const restartQuizBtn = document.getElementById('restart-quiz-btn');
const cryingOverlay = document.getElementById('crying-overlay');
const levelSelectEl = document.getElementById('quiz-level-select');

function loadQuizQuestion() {
  const questions = quizData[currentLevel];
  const currentQ = questions[currentQuizIndex];

  quizProgressEl.textContent = `Nível: ${currentLevel.toUpperCase()} | Pergunta ${currentQuizIndex + 1} de ${questions.length}`;
  quizQuestionEl.textContent = currentQ.question;
  quizOptionsEl.innerHTML = "";

  currentQ.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-btn-option';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAnswer(idx));
    quizOptionsEl.appendChild(btn);
  });
}

function handleAnswer(selectedIndex) {
  const questions = quizData[currentLevel];
  const correctIndex = questions[currentQuizIndex].answer;

  if (selectedIndex === correctIndex) {
    quizScore++;
    triggerConfetti();
  } else {
    triggerCryingEmoji();
  }

  currentQuizIndex++;

  if (currentQuizIndex < questions.length) {
    setTimeout(loadQuizQuestion, 1200);
  } else {
    setTimeout(showQuizResult, 1200);
  }
}

// Efeito de Confete ao acertar
function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

// Efeito de Carinhas Chorando ao errar
function triggerCryingEmoji() {
  cryingOverlay.classList.remove('hidden');
  for (let i = 0; i < 20; i++) {
    const emoji = document.createElement('div');
    emoji.className = 'crying-emoji';
    emoji.textContent = '😭';
    emoji.style.left = `${Math.random() * 100}vw`;
    emoji.style.animationDuration = `${1.2 + Math.random() * 1}s`;
    cryingOverlay.appendChild(emoji);

    setTimeout(() => emoji.remove(), 2200);
  }
  setTimeout(() => cryingOverlay.classList.add('hidden'), 2200);
}

function showQuizResult() {
  quizContainer.classList.add('hidden');
  quizResultEl.classList.remove('hidden');
  quizScoreEl.textContent = `Você acertou ${quizScore} de ${quizData[currentLevel].length} perguntas no nível ${currentLevel.toUpperCase()}!`;
}

function resetQuiz() {
  currentQuizIndex = 0;
  quizScore = 0;
  quizResultEl.classList.add('hidden');
  quizContainer.classList.remove('hidden');
  loadQuizQuestion();
}

restartQuizBtn.addEventListener('click', resetQuiz);

if (levelSelectEl) {
  levelSelectEl.addEventListener('change', (e) => {
    currentLevel = e.target.value;
    resetQuiz();
  });
}

// Inicializa o Quiz
loadQuizQuestion();

// =============================================================
// DEMAIS FUNCIONALIDADES (API BUSCA + FIREBASE)
// =============================================================

const nameTranslations = {
  "mickey": "mickey mouse", "minnie": "minnie mouse", "pato donald": "donald duck", "pateta": "goofy",
  "margarida": "daisy duck", "tio patinhas": "scrooge mcduck", "pluto": "pluto", "branca de neve": "snow white",
  "cinderela": "cinderella", "bela adormecida": "sleeping beauty", "aurora": "aurora", "pequena sereia": "ariel",
  "ariel": "ariel", "bela": "belle", "fera": "beast", "aladdin": "aladdin", "genio": "genie", "gênio": "genie",
  "jasmin": "jasmine", "jasmim": "jasmine", "mulan": "mulan", "pocahontas": "pocahontas", "tarzan": "tarzan",
  "hercules": "hercules", "pinoquio": "pinocchio", "peter pan": "peter pan", "sininho": "tinker bell",
  "tinkerbell": "tinker bell", "capitao gancho": "captain hook", "rei leao": "simba", "simba": "simba",
  "mufasa": "mufasa", "scar": "scar", "timão": "timon", "pumba": "pumbaa", "stitch": "stitch", "lilo": "lilo",
  "urso pooh": "winnie the pooh", "pooh": "winnie the pooh", "elsa": "elsa", "anna": "anna", "olaf": "olaf",
  "rapunzel": "rapunzel", "enrolados": "rapunzel", "flynn rider": "flynn rider", "moana": "moana",
  "maui": "maui", "merida": "merida", "woody": "woody", "buzz": "buzz lightyear"
};

const characterSummaries = {
  "rapunzel": "Uma princesa de longos cabelos dourados com poderes mágicos de cura, trancada numa torre que busca realizar o sonho de ver as lanternas flutuantes.",
  "elsa": "A Rainha de Arendelle que possui o poder mágico de criar neve e gelo, aprendendo a aceitar e controlar suas habilidades.",
  "anna": "Irmã destemida e otimista de Elsa, disposta a enfrentar qualquer desafio para proteger sua família e seu reino.",
  "olaf": "Um boneco de neve criado pela magia de Elsa que adora abraços quentinhos e sonha em conhecer o verão.",
  "simba": "Um jovem leão destinado a ser o Rei da Pedra do Orgulho, precisando superar o passado para assumir seu trono.",
  "scar": "O invejoso e calculista tio de Simba, guiado por sua ambição de dominar as Terras do Orgulho a qualquer custo.",
  "mickey mouse": "O camundongo mais famoso do mundo, conhecido por seu otimismo, espírito aventureiro e lealdade aos amigos.",
  "minnie mouse": "A meiga e elegante companheira de Mickey Mouse, conhecida por seu estilo clássico e grande simpatia.",
  "stitch": "A Experiência 626, uma criatura alienígena geneticamente criada para causar caos que descobre o valor da família (Ohana).",
  "ariel": "Uma jovem sereia curiosa apaixonada pelo mundo humano que faz um acordo perigoso para viver na terra firme.",
  "wood": "O corajoso e leal xerife brinquedo que faz de tudo para cuidar dos seus amigos e do seu dono.",
  "buzz lightyear": "Um destemido patrulheiro espacial em brinquedo que acredita firmemente em proteger o universo 'ao infinito e além!'"
};

function normalizeText(text) {
  return text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
}

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
    let bestMatch = results.find(item => normalizeText(item.name) === searchTarget && item.imageUrl)
                 || results.find(item => normalizeText(item.name).includes(searchTarget) && item.imageUrl)
                 || results.find(item => item.imageUrl)
                 || results[0];

    const lookupKey = normalizeText(bestMatch.name);
    const summaryText = characterSummaries[lookupKey] 
                     || characterSummaries[normalizedInput] 
                     || "Um icônico personagem do universo mágico da Disney!";

    currentCharacter = {
      name: bestMatch.name,
      imageUrl: bestMatch.imageUrl || "https://via.placeholder.com/200x250?text=Sem+Foto",
      summary: summaryText,
      films: [
        ...(bestMatch.films || []),
        ...(bestMatch.shortFilms || []),
        ...(bestMatch.tvShows || [])
      ]
    };

    charImg.src = currentCharacter.imageUrl;
    charName.textContent = currentCharacter.name;
    charSummary.textContent = currentCharacter.summary;
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

// Salvar no Firebase
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

// Excluir do Firebase
async function removeFavorite(id) {
  try {
    const docRef = doc(db, "favoritos_disney", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao remover:", error);
  }
}

// Sincronização em Tempo Real
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

// Efeito 3D Parallax Tilt
const cardElement = document.getElementById('character-card');

cardElement.addEventListener('mousemove', (e) => {
  const rect = cardElement.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const rotateX = ((y - centerY) / centerY) * -10;
  const rotateY = ((x - centerX) / centerX) * 10;
  
  cardElement.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

cardElement.addEventListener('mouseleave', () => {
  cardElement.style.transform = `rotateX(0deg) rotateY(0deg)`;
});