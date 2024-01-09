/**
 * [
 *    {
 *      id: <int>
 *      task: <string>
 *      timestamp: <string>
 *      isCompleted: <boolean>
 *    }
 * ]
 */
const todos = [];
const RENDER_EVENT = 'render-todo';

function generateId() {
  return +new Date();
}

function generateTodoObject(id, task, timestamp, isCompleted) {
  return {
    id,
    task,
    timestamp,
    isCompleted
  }
}

function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
}

function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }
  return -1;
}

function makeTodo(todoObject) {
  const row = document.createElement('div');
  row.classList.add('row');

  const { id, task, timestamp, isCompleted } = todoObject;
  const textTitle = document.createElement('h4');
  textTitle.innerText = task;

  const textTimestamp = document.createElement('p');
  textTimestamp.classList.add('timestamp')
  textTimestamp.innerText = 'Target Selesai:\n' + timestamp;

  const textContainer = document.createElement('div');
  textContainer.classList.add('col-sm-10');
  textContainer.append(textTitle, textTimestamp);

  const rowBtn = document.createElement('div');
  rowBtn.classList.add('col-sm-2');

  row.append(textContainer, rowBtn);

  const container = document.createElement('div');
  container.classList.add('card', 'shadow', 'p-3', 'col-sm-12');
  container.append(row);
  container.setAttribute('id', `todo-${id}`);

  if (isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('btn', 'btn-warning', 'text-white', 'px-3', 'btn-lg', 'ms-auto'); // Gunakan 'ms-auto' untuk posisi tombol
    undoButton.addEventListener('click', function () {
      undoTaskFromCompleted(id);
    });
    const undoIcon = document.createElement('i');
    undoIcon.classList.add('fa', 'fa-undo');
    undoButton.append(undoIcon);

    const trashButton = document.createElement('button');
    trashButton.classList.add('btn', 'btn-danger', 'px-3', 'btn-lg');
    trashButton.addEventListener('click', function () {
      removeTaskFromCompleted(id);
    });
    const trashIcon = document.createElement('i');
    trashIcon.classList.add('fa', 'fa-trash');
    trashButton.append(trashIcon);

    rowBtn.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('btn', 'btn-success', 'px-3', 'btn-lg', 'ms-auto'); // Gunakan 'ms-auto' untuk posisi tombol
    checkButton.addEventListener('click', function () {
      addTaskToCompleted(id);
    });
    const checkIcon = document.createElement('i');
    checkIcon.classList.add('fa', 'fa-check');
    checkButton.append(checkIcon);

    rowBtn.append(checkButton);
  }

   // Cek timestamp dan ubah background card jika perlu
   const timestampDate = new Date(timestamp); // Parse timestamp menjadi Date object
   const today = new Date();
   const isDueTomorrow = today.getTime() < timestampDate.getTime() && timestampDate.getDate() === today.getDate() + 1;
   if (isDueTomorrow && !isCompleted) {
     container.classList.add('bg-danger','text-white');

    // Tambahkan tulisan peringatan
    const warningText = document.createElement('p');
    warningText.classList.add('bg-secondary','p-2','mb-auto');
    warningText.innerText = 'Peringatan, masa targetnya sudah mau selesai!!';
    warningText.style.width = '100%';
    container.append(row,warningText);
   }

  return container;
}


function addTodo() {
  const textTodo = document.getElementById('title').value;
  const timestamp = document.getElementById('date').value;

  const generatedID = generateId();
  const todoObject = generateTodoObject(generatedID, textTodo, timestamp, false)
  todos.push(todoObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addTaskToCompleted(todoId /* HTMLELement */) {

  const todoTarget = findTodo(todoId);
  if (todoTarget == null) return;

  todoTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeTaskFromCompleted(todoId /* HTMLELement */) {
  const todoTarget = findTodoIndex(todoId);

  if (todoTarget === -1) return;

  todos.splice(todoTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(todoId /* HTMLELement */) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm /* HTMLFormElement */ = document.getElementById('form');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addTodo();
  });
});


document.addEventListener(RENDER_EVENT, function () {
  const uncompletedTODOList = document.getElementById('todos');
  const listCompleted = document.getElementById('completed-todos');

  // clearing list item
  uncompletedTODOList.innerHTML = '';
  listCompleted.innerHTML = '';

  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem);
    if (todoItem.isCompleted) {
      listCompleted.append(todoElement);
    } else {
      uncompletedTODOList.append(todoElement);
    }
  }
});

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APPS';
 
function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
  alert("Data Berhasil Diubah!!");
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
 
  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }
 
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', function () {
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

