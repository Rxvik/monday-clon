//Credenciales de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD81Q4-BUuWbyf8IO-msYeAQMkdHIsOoE8",
    authDomain: "ruvik-aplicaciones-ad2025.firebaseapp.com",
    projectId: "ruvik-aplicaciones-ad2025",
    storageBucket: "ruvik-aplicaciones-ad2025.firebasestorage.app",
    messagingSenderId: "1039217085569",
    appId: "1:1039217085569:web:54142209ab1ee7ef5d9180",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

//Elementos del DOM para las tareas
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

//Evento para clik al boton agregar
addTaskBtn.addEventListener("click", async() => {
    const text = taskInput.value.trim();
    if (text) {
        await db.collection("tasks").add({
            text, done: false
        });
        taskInput.value = "";
    }
});

//Funcion para escuchar en tiempo real la BD
db.collection("tasks").onSnapshot((tareas) => {
    taskList.innerHTML = "";
    tareas.forEach((doc) => {
        const li = document.createElement("li");
        li.classList = "list-group-item d-flex justify-content-between align-items-center";
        li.textContent = doc.data().text;
        const delBtn = document.createElement("button");
        delBtn.classList = "btn btn-danger btn-sm";
        delBtn.textContent = "Eliminar";
        delBtn.onclick = () => db.collection("tasks").doc(doc.id).delete();
        li.appendChild(delBtn);
        taskList.appendChild(li);
    });
});