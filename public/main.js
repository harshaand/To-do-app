let token = localStorage.getItem('token')
const apiBase = '/'

const authSection = document.getElementById('auth-section')
const authError = document.getElementById('auth-error')
const authEmail = document.getElementById('auth-email-input')
const authPassword = document.getElementById('auth-password-input')
const authToggleBtn = document.getElementById('auth-toggle-btn')
const authBtn = document.getElementById('auth-btn')

const nav = document.querySelector('nav')
const header = document.querySelector('header')
const logoutBtn = document.getElementById('logout-btn')
const todoList = document.getElementById('to-do-list')
const navButtons = document.querySelectorAll('.tab-button')
const addTodoBtn = document.getElementById('addTodoBtn')

let isLoading = false
let isAuthenticating = false
let isRegistration = false
let selectedTab = 'All'
let todos = []
// const deleteBtn = document.getElementById('')
// const updateBtn = 

// AUTH LOGIC
function toggleIsRegister() {
    isRegistration = !isRegistration
    authToggleBtn.innerText = isRegistration ? 'Sign in' : 'Sign up'
    document.querySelector('#auth-section > div h2').innerText = isRegistration ? 'Sign Up' : 'Login'
    document.querySelector('#auth-section > div p').innerText = isRegistration ? 'Create an account!' : 'Sign in to your account!'
    document.querySelector('.auth-toggle-subtext p').innerText = isRegistration ? 'Already have an account?' : 'Don\'t have an account?'
    document.querySelector('.auth-toggle-subtext button').innerText = isRegistration ? 'Sign in' : 'Sign up'
}

async function authenticate() {
    const emailVal = authEmail.value
    const passVal = authPassword.value

    // guard clauses... if authenticating, return
    if (
        isLoading ||
        isAuthenticating ||
        !emailVal ||
        !passVal ||
        passVal.length < 6 ||
        !emailVal.includes('@')
    ) { return }

    authError.style.display = 'none'
    isAuthenticating = true
    authBtn.innerText = 'Authenticating...'

    try {
        let authData
        if (isRegistration) {
            // register an account
            const response = await fetch(apiBase + 'auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: emailVal, password: passVal })
            })
            authData = await response.json()
        } else {
            // login an account
            const response = await fetch(apiBase + 'auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: emailVal, password: passVal })
            })
            authData = await response.json()
        }

        // save token and display dashboard
        if (authData.token) {
            token = authData.token
            localStorage.setItem('token', token)

            authBtn.innerText = 'Loading...'

            await fetchTodos()
            renderTodos()

            showDashboard()
        } else {
            throw Error('❌ Failed to authenticate...')
        }

    } catch (err) {
        console.log(err.message)
        authError.innerText = err.message
        authError.style.display = 'block'
    } finally {
        authBtn.innerText = 'Submit'
        isAuthenticating = false
    }

}

// PAGE RENDERING LOGIC
async function showDashboard() {
    nav.style.display = 'block'
    header.style.display = 'flex'
    logoutBtn.style.display = 'block'
    todoList.style.display = 'flex'
    authSection.style.display = 'none'

    await fetchTodos()
    renderTodos()
}

function updateHeaderText() {
    const todosLength = todos.filter((todo) => todo.completed === false).length
    const noOfOpenTasksString = todosLength === 1 ? `You have 1 open task` : `You have ${todosLength} open tasks`
    header.querySelector('h1').innerText = noOfOpenTasksString
}

function updateNavCount() {
    navButtons.forEach(button => {
        const btnText = button.innerText.split(' ')[0]

        const count = todos.filter(todo => {
            if (btnText === 'All') {
                return true
            }
            return btnText === 'Complete' ? todo.completed : !todo.completed
        }).length

        button.querySelector('span').innerText = `(${count})`
    })
}

function changeTab(tab) {
    selectedTab = tab
    navButtons.forEach(button => {
        if (button.innerText.includes(tab)) {
            button.classList.add('selected-tab')
        } else {
            button.classList.remove('selected-tab')
        }
    })
    renderTodos()
}

function renderTodos() {
    updateNavCount()
    updateHeaderText()

    let todoListHTML = ``

    //identify user's current tab
    const currentTabTodos = todos.filter(todo => {
        if (selectedTab === 'All') { return true }
        if (selectedTab === 'Complete') { return todo.completed }
        else { return !todo.completed }
    })

    //add html to todoList div depending on user's current tab
    currentTabTodos.forEach((todo, todoIndex) => {
        const taskIndex = todo.id
        todoListHTML += `
        <div class="card todo-item ${todo.completed ? 'todo-item-completed' : ''}">
            <p>${todo.task}</p>
            <div class="todo-buttons">
                <button onclick="updateTodo(${taskIndex})" ${todo.completed ? 'class="task-completed-btn"' : ''}>
                    <h6>Done</h6>
                </button>
                <button onclick="deleteTodo(${taskIndex})">
                    <h6>Delete</h6>
                </button>
            </div>
        </div>
        `
    })
    todoListHTML += `
    <div class="input-container">
        <input id="todoInput" placeholder="Add task" />
        <button onclick="addTodo()">
            <i class="fa-solid fa-plus"></i>
        </button>
    </div>
    `
    todoList.innerHTML = todoListHTML
}


// CRUD LOGIC
async function fetchTodos() {
    isLoading = true
    const response = await fetch(apiBase + 'todos', {
        headers: { 'Authorization': token }
    })
    const todosData = await response.json()
    todos = todosData
    isLoading = false
}

async function updateTodo(index) {
    const currentTodo = todos.find((todo) => todo.id === index)

    if (currentTodo.completed === true) {
        await fetch(apiBase + 'todos' + '/' + index, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ task: currentTodo.task, completed: false })
        })
    }
    else {
        await fetch(apiBase + 'todos' + '/' + index, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ task: currentTodo.task, completed: true })
        })
    }

    await fetchTodos()
    renderTodos()
}

async function deleteTodo(index) {
    await fetch(apiBase + 'todos' + '/' + index, {
        method: 'DELETE',
        headers: {
            'Authorization': token
        },
    })
    await fetchTodos()
    renderTodos()
}

async function addTodo() {

    const todoInput = document.getElementById('todoInput')
    const task = todoInput.value

    if (!task) { return }

    await fetch(apiBase + 'todos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({ task })
    })
    todoInput.value = ''
    await fetchTodos()
    renderTodos()
}


// UTILITY FUNCTIONS
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

// if is authenticated, show todo app
if (token) {
    async function run() {
        await fetchTodos()
        renderTodos()
        showDashboard()
    }
    run()
}