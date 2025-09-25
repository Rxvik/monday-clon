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
const auth = firebase.auth();

//Elementos del DOM para las tareas
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
//const taskList = document.getElementById("taskList");
const pendingTask = document.getElementById("pendingTask");
const doneTask = document.getElementById("doneTask");

//Referencias al tablero
const boardTitle = document.getElementById("boardTitle");
const boardList = document.getElementById("boardList");
const boardInput = document.getElementById("boardInput");
const addBoardBtn = document.getElementById("addBoardBtn");

//Botones para Google
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");

//Variable global para el id del tablero actual
let currentBoardId = null;
let currentUser = null;

//Funciones para login y logout con Google
loginBtn.addEventListener("click", async() => {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
});

logoutBtn.addEventListener("click", async() => {
    await auth.signOut();
});

//Evento que escucha cuando cambia de estado la autenticación
auth.onAuthStateChanged((user) => {
    console.log('ruvik user ==>', user);
    if (user) {
        currentUser = user;
        userInfo.textContent = user.email;
        loginBtn.style.display = "none";
        logoutBtn.style.display = "block";
        boardInput.disabled = false;
        addBoardBtn.disabled = false;
        boardList.disabled = false;
        loadBoards();
        loadTasks();
    } else {
        currentUser = null;
        userInfo.textContent = "No Autenticado";
        loginBtn.style.display = "block";
        logoutBtn.style.display = "none";
        boardInput.disabled = true;
        addBoardBtn.disabled = true;
        boardList.disabled = true;
        boardList.innerHTML = "";
        boardTitle.textContent = "Inicia sesion para ver tus tableros";
        taskInput.disabled = true;
        addTaskBtn.disabled = true;
        pendingTask.innerHTML = "";
        doneTask.innerHTML = "";
    }
});

addBoardBtn.addEventListener("click", async() => {
    const name = boardInput.value.trim();
    if (name) {
        await db.collection("boards").add({name});
        boardInput.value = "";
    }
});

const loadBoards = () => {
    db.collection("boards").onSnapshot((tableros) => {
    boardList.innerHTML = "";
    tableros.forEach((doc) => {
        const board = doc.data();
        const li = document.createElement("li");
        li.classList = "list-group-item list-group-item-action";
        li.textContent = board.name;
        li.onclick = () => selectBoard(doc.id, board.name);
        boardList.appendChild(li);
    });
});
}

db.collection("boards").onSnapshot((tableros) => {
    boardList.innerHTML = "";
    tableros.forEach((doc) => {
        const board = doc.data();
        const li = document.createElement("li");
        li.classList = "list-group-item list-group-item-action";
        li.textContent = board.name;
        li.onclick = () => selectBoard(doc.id, board.name);
        boardList.appendChild(li);
    });
});

const selectBoard = (id, name) => {
    currentBoardId = id;
    boardTitle.textContent = `${name}`;
    addTaskBtn.disabled = false;
    taskInput.disabled = false;
    loadTasks();
}

//Evento para clik al boton agregar
addTaskBtn.addEventListener("click", async() => {
    const text = taskInput.value.trim();
    if (text && currentBoardId) {
        await db.collection("tasks").add({
            text, 
            done: false,
            boardId: currentBoardId
        });
        taskInput.value = "";
    } else {
        alert("Por favor selecciona un tablero y escribe una tarea");
    }
});

//Funcion para escuchar en tiempo real la BD
/*
db.collection("tasks").onSnapshot((tareas) => {
    //taskList.innerHTML = "";
    pendingTask.innerHTML = "";
    doneTask.innerHTML = "";
    tareas.forEach((doc) => {
        const task = doc.data();
        const li = document.createElement("li");
        li.classList = "list-group-item d-flex justify-content-between align-items-center";

        const leftDiv = document.createElement("div");
        leftDiv.classList = "d-flex align-items-center";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList = "from-check-input me-2";
        checkbox.checked = task.done;
        checkbox.onchange = () => db.collection("tasks").doc(doc.id).update({ done: checkbox.checked });

        const span = document.createElement("span");
        span.textContent = task.text;
        if (task.done) {
            span.style.textDecoration = "line-through";
        }

        leftDiv.appendChild(checkbox);
        leftDiv.appendChild(span);

        li.textContent = doc.data().text;

        const delBtn = document.createElement("button");
        delBtn.classList = "btn btn-danger btn-sm";
        delBtn.textContent = "Eliminar";
        delBtn.onclick = () => db.collection("tasks").doc(doc.id).delete();

        li.appendChild(leftDiv);
        li.appendChild(delBtn);
        if (task.done) {
            doneTask.appendChild(li);
        } else {
            pendingTask.appendChild(li);
        }
    });
});
*/

//Funcion para escuchar en tiempo real la BD
const loadTasks = () => {
    db.collection("task").where('boardId', '==', currentBoardId).onSnapshot((tasks) => {
        pendingTask.innerHTML = "";
        doneTask.innerHTML = "";
        tasks.forEach((doc) => {
            const task = doc.data();
            const li = document.createElement("li");
            li.classList = "list-group-item d-flex justify-content-between align-items-center";

            const leftDiv = document.createElement("div");
            leftDiv.classList = "d-flex align-items-center";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList = "from-check-input me-2";
            checkbox.checked = task.done;
            checkbox.onchange = () => db.collection("tasks").doc(doc.id).update({ done: checkbox.checked });

            const span = document.createElement("span");
            span.textContent = task.text;
            if (task.done) {
                span.style.textDecoration = "line-through";
            }

            leftDiv.appendChild(checkbox);
            leftDiv.appendChild(span);

            li.textContent = doc.data().text;

            const delBtn = document.createElement("button");
            delBtn.classList = "btn btn-danger btn-sm";
            delBtn.textContent = "Eliminar";
            delBtn.onclick = () => db.collection("tasks").doc(doc.id).delete();

            li.appendChild(leftDiv);
            li.appendChild(delBtn);
            if (task.done) {
                doneTask.appendChild(li);
            } else {
                pendingTask.appendChild(li);
            }
        });
    });
}