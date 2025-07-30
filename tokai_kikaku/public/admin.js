import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyDlo942_HW-RxF3B1uEuB1msR1dr4cPTB0",
  authDomain: "tokai-kikaku.firebaseapp.com",
  projectId: "tokai-kikaku",
  storageBucket: "tokai-kikaku.appspot.com",
  messagingSenderId: "185594261514",
  appId: "1:185594261514:web:06b47ccfa1e2f0efa16ff3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const opinionsRef = collection(db, "opinions");

// ログインフォームの処理
const loginForm = document.getElementById("login-form");
const adminContent = document.getElementById("admin-content");

const loginButton = document.getElementById("login-button");
loginButton.addEventListener("click", async () => {
  const email = document.getElementById("admin-email").value.trim();
  const password = document.getElementById("admin-password").value.trim();
  const errorMessage = document.getElementById("login-error");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    errorMessage.textContent = "";
  } catch (error) {
    errorMessage.textContent = "ログインに失敗しました。メールアドレスまたはパスワードを確認してください。";
  }
});

// 認証状態に応じて表示制御
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginForm.style.display = "none";
    adminContent.style.display = "block";
    loadAdminOpinions();
  } else {
    loginForm.style.display = "block";
    adminContent.style.display = "none";
  }
});

// 投稿読み込みと削除
async function loadAdminOpinions() {
  const container = document.getElementById("opinion-list");
  container.innerHTML = "";

  const snapshot = await getDocs(opinionsRef);
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.className = "opinion-card";

    div.innerHTML = `
      <h3>${escapeHTML(data.title)}</h3>
      <p>${escapeHTML(data.content)}</p>
      <p><strong>カテゴリ:</strong> ${escapeHTML(data.category || '未分類')}</p>
      <button class="delete-btn" data-id="${docSnap.id}">❌ 削除</button>
    `;

    div.querySelector(".delete-btn").addEventListener("click", async () => {
      if (confirm("本当に削除しますか？")) {
        await deleteDoc(doc(db, "opinions", docSnap.id));
        loadAdminOpinions();
      }
    });

    container.appendChild(div);
  });
}

// HTMLエスケープ関数
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function (m) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m];
  });
}
