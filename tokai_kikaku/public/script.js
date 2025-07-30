import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyDlo942_HW-RxF3B1uEuB1msR1dr4cPTB0",
  authDomain: "tokai-kikaku.firebaseapp.com",
  projectId: "tokai-kikaku",
  storageBucket: "tokai-kikaku.firebasestorage.app",
  messagingSenderId: "185594261514",
  appId: "1:185594261514:web:06b47ccfa1e2f0efa16ff3",
  measurementId: "G-WJJEHEZPZ2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const opinionsRef = collection(db, "opinions");

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("filter-category").addEventListener("change", reloadOpinions);
  reloadOpinions();
});

document.getElementById("sort-select").addEventListener("change", reloadOpinions);

document.getElementById("submit").addEventListener("click", async () => {
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const category = document.getElementById("category").value;

  if (!title || !content) {
    alert("タイトルと内容を入力してください");
    return;
  }

  const newOpinion = {
    title,
    content,
    category,
    good: 0,
    comments: [],
    createdAt: new Date().toISOString()
  };

  await addDoc(opinionsRef, newOpinion);

  document.getElementById("title").value = "";
  document.getElementById("content").value = "";
  reloadOpinions();
});

async function reloadOpinions() {
  const list = document.getElementById("opinion-list");
  list.innerHTML = "";

  const snapshot = await getDocs(opinionsRef);
  const sort = document.getElementById("sort-select").value;
  const selectedCategory = document.getElementById("filter-category").value;

  let opinions = [];
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (selectedCategory === "all" || data.category === selectedCategory) {
      opinions.push({ id: docSnap.id, ...data });
    }
  });

  if (sort === "rating") {
    opinions.sort((a, b) => b.good - a.good);
  } else {
    opinions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  opinions.forEach(op => {
    addOpinionToList(op);
  });
}

function addOpinionToList(op) {
  const card = document.createElement("div");
  card.className = "opinion-card";
  card.dataset.id = op.id;

  const formattedDate = formatDate(op.createdAt);
  const shareUrl = `${location.origin}/detail.html?id=${op.id}`;
  const shareText = encodeURIComponent(`東海オンエアにやってほしいこと：「${op.title}」`);

  card.innerHTML = `
    <h3>${escapeHTML(op.title)}</h3>
    <p class="post-date">${formattedDate}</p>
    <p>${escapeHTML(op.content)}</p>
    <p><strong>カテゴリ:</strong> ${escapeHTML(op.category || '未分類')}</p>
    <div class="opinion-meta">
      <button class="good-btn">
        <i class="fas fa-thumbs-up"></i> ${op.good}
      </button>
      <span class="comment-count">
        <i class="fas fa-comment"></i> ${(op.comments || []).length}件
      </span>
    </div>
    <div class="share-buttons">
      <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}"
         target="_blank" rel="noopener noreferrer" class="sns-share-btn">
        <i class="fab fa-x-twitter"></i> で共有
      </a>
    </div>
  `;

  card.querySelector(".good-btn").addEventListener("click", async (e) => {
    e.stopPropagation();
    const opinionDoc = doc(db, "opinions", op.id);
    await updateDoc(opinionDoc, { good: op.good + 1 });
    reloadOpinions();
  });

  card.addEventListener("click", (e) => {
    if (!e.target.classList.contains("good-btn") && !e.target.closest(".good-btn")) {
      window.location.href = `detail.html?id=${op.id}`;
    }
  });

  document.getElementById("opinion-list").appendChild(card);
}

function formatDate(isoStr) {
  const date = new Date(isoStr);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
}

function escapeHTML(str) {
  return str.replace(/[&<>"]|'/g, function (m) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m];
  });
}
