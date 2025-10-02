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

//Elementos nuevos
const assignedInput = document.getElementById("assignedInput");
const statusInput = document.getElementById("statusInput");
const priorityInput = document.getElementById("priorityInput");

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
    enableTaskForm();
    loadTasks();
}

//Funcion para habilitar el formulario de tareas
const enableTaskForm = () => {
    addTaskBtn.disabled = false;
    taskInput.disabled = false;
    assignedInput.disabled = false;
    statusInput.disabled = false;
    priorityInput.disabled = false;
}

//Funcion para deshabilitar el formulario de tareas
const disableTaskForm = () => {
    addTaskBtn.disabled = true;
    taskInput.disabled = true;
    assignedInput.disabled = true;
    statusInput.disabled = true;
    priorityInput.disabled = true;
}

//Helper para color de prioridad y status
const getStatusColor = (status) => {
    switch (status) {
        case "Pendiente":
            return "secondary";
        case "En Progreso":
            return "info";
        case "Bloqueado":
            return "warning";
        case "Hecho":
            return "success";
        default:
            return "dark";
    }
}

const getpriorityColor = (priority) => {
    switch (priority) {
        case "Alta":
            return "danger";
        case "Media":
            return "primary";
        case "Baja":
            return "success";
        default:
            return "secondary";
    }
}

//Evento para clik al boton agregar
addTaskBtn.addEventListener("click", async() => {
    const text = taskInput.value.trim();
    const assigned = assignedInput.value.trim();
    const status = statusInput.value;
    const priority = priorityInput.value;

    if (text && currentBoardId && assigned && currentUser) {
        await db.collection("tasks").add({
            text, 
            assigned,
            status,
            priority,
            done: status === "Hecho",
            boardId: currentBoardId,
            userId: currentUser.uid
        });
        taskInput.value = "";
        assignedInput.value = "";
        statusInput.value = "Pendiente";
        priorityInput.value = "Media";
    } else {
        alert("Por favor selecciona un tablero y escribe una tarea");
    }
});

//Funcion para escuchar en tiempo real la BD
const loadTasks = () => {
    db.collection("tasks").where('boardId', '==', currentBoardId).onSnapshot((tasks) => {
        pendingTask.innerHTML = "";
        doneTask.innerHTML = "";
        tasks.forEach((doc) => {
            const task = doc.data();
            const li = document.createElement("li");
            li.className = "list-group-item";
            //Card de tarea
            li.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${task.text}</strong>
                        <small>🥷 ${task.assigned}</small>
                        <span class="badge bg-${getStatusColor(task.status)}">${task.status}
                        </span>
                        <span class="badge bg-${getpriorityColor(task.priority)}">${task.priority}
                        </span>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-danger">🗑️</button>
                    </div>
                </div>
            `;

            li.querySelector("button").onclick = () => db.collection("tasks").doc(doc.id).delete();
            
            if (task.done) {
                doneTask.appendChild(li);
            } else {
                pendingTask.appendChild(li);
            }
        });
    });
}