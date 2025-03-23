const categoriesContainer = document.getElementById('categories-container');

function addCategory() 
{
    const categoryInput = document.getElementById('category-input');
    const categoryName = categoryInput.value.trim();

    if (categoryName === '') 
    {
        alert("You must write a category name");
        return;
    }

    //CREATE NEW CATEGORY
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category-box';
    categoryDiv.style.backgroundColor = getRandomColor(); 
    
    
    const categoryTitle = document.createElement('h3');
    categoryTitle.innerText = categoryName;
    categoryDiv.appendChild(categoryTitle);

    
    const addTaskButton = document.createElement('button');
    addTaskButton.innerText = 'Add Task';
    addTaskButton.onclick = () => addTask(categoryDiv); 
    categoryDiv.appendChild(addTaskButton);

    // INPUT 
    const taskInput = document.createElement('input');
    taskInput.type = 'text';
    taskInput.placeholder = 'Add your task';
    categoryDiv.appendChild(taskInput);

    categoriesContainer.appendChild(categoryDiv);

    categoryInput.value = ''; 
}

function addTask(categoryDiv) 
{
    const taskInput = categoryDiv.querySelector('input[type="text"]');
    const task = taskInput.value.trim();

    
    if (task === '') 
    {
        alert("You must write a task");
        return;
    }

    
    const listContainer = categoryDiv.querySelector('.task-list') || document.createElement('ul');
    listContainer.className = 'task-list';
    categoryDiv.appendChild(listContainer);

   
    const li = document.createElement('li');
    li.innerText = task;

    // DEL BUTTON
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => li.remove(); // 
    li.appendChild(closeBtn);

   
    listContainer.appendChild(li);

    
    taskInput.value = ''; 
}

function clearAllTasks() 
{
    categoriesContainer.innerHTML = ''; 
}

///RANDOM COLOUR FOR CATEGORY BOX
function getRandomColor() 
{
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) 
    {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}