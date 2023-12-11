// tasks.js

document.addEventListener('DOMContentLoaded', function () {
    const taskContainer = document.getElementById('taskContainer');
    const taskForm = document.getElementById('taskForm');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskList = document.getElementById('taskList');
    const logoutButton = document.getElementById('logoutButton');
    const taskFilterSelect = document.getElementById('taskFilter');
    const showTaskFormButton = document.getElementById('showTaskFormButton');
    const taskModal = document.getElementById('taskModal');
    const closeTaskFormButton = document.getElementById('closeTaskFormButton');

    let authToken = null;

    const apiUrl = 'https://65708cfd09586eff664198e0.mockapi.io';

    // Check if the user is already logged in
    const storedAuthToken = localStorage.getItem('authToken');
    if (storedAuthToken) {
        authToken = storedAuthToken;
        showTaskContainer();
        fetchTasks();
    }

    taskForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const title = taskTitleInput.value;
        const description = taskDescriptionInput.value;

        // Check if the taskForm is in update mode (taskId is set)
        if (taskForm.getAttribute('data-task-id')) {
            const taskId = taskForm.getAttribute('data-task-id');
            updateTask(taskId, title, description);
        } else {
            addTask(title, description);
        }
    });

    taskFilterSelect.addEventListener('change', function () {
        fetchTasks();
    });

    logoutButton.addEventListener('click', function () {
        event.preventDefault();
        console.log('Logout button clicked.');
        logout();
    });

    showTaskFormButton.addEventListener('click', function () {
        showTaskForm();
    });

    closeTaskFormButton.addEventListener('click', function () {
        hideTaskForm();
    });

    function showTaskForm() {
        taskForm.style.display = 'block';
        taskModal.style.display = 'block';
    }

    function hideTaskForm() {
        taskForm.style.display = 'none';
        taskModal.style.display = 'none';
    }

    function showTaskContainer() {
        taskContainer.style.display = 'block';
    }

    function showAuthContainer() {
        authContainer.style.display = 'block';
        taskContainer.style.display = 'none';
    }

    function logout() {
        authToken = null;
        localStorage.removeItem('authToken');
        showAuthContainer();
    }

    function addTask(title, description) {
        fetch(`${apiUrl}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                title,
                description,
                completed: false,
            }),
        })
        .then(response => response.json())
        .then(task => {
            fetchTasks();
            resetTaskForm(); // Reset the taskForm
        })
        .catch(error => {
            console.error('Error adding task:', error);
            alert('Error adding task. Please try again.');
        });
    }

    function updateTaskForm(taskId) {
        console.log('Updating task form for task ID:', taskId);

        // Check if taskId is provided
        if (!taskId) {
            // If taskId is not provided, reset the form
            resetTaskForm();
            return;
        }

        // Fetch the task details for the given taskId
        fetch(`${apiUrl}/tasks/${taskId}`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Task not found (status ${response.status}).`);
            }
            return response.json();
        })
        .then(task => {
            console.log('Fetched task details for update:', task);

            // Populate the task form with the task details
            taskTitleInput.value = task.title;
            taskDescriptionInput.value = task.description;

            // Set the task ID as a data attribute in the form for reference during the update
            taskForm.setAttribute('data-task-id', taskId);

            // Show the task form
            showTaskForm();
        })
        .catch(error => {
            console.error('Error fetching task details for update:', error);
            alert(`Error fetching task details for update: ${error.message}`);
        });
    }

    function resetTaskForm() {
        hideTaskForm();
        taskTitleInput.value = '';
        taskDescriptionInput.value = '';
        taskForm.removeAttribute('data-task-id');
    }

    function fetchTasks() {
        const filter = taskFilterSelect.value;
        let url;

        if (filter === 'completed') {
            url = `${apiUrl}/tasks?completed=true`;
        } else if (filter === 'active') {
            url = `${apiUrl}/tasks?completed=false`;
        } else {
            url = `${apiUrl}/tasks`;
        }

        fetch(url, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        })
        .then(response => response.json())
        .then(tasks => displayTasks(tasks))
        .catch(error => {
            console.error('Error fetching tasks:', error);
            alert('Error fetching tasks. Please try again.');
        });
    }

    function displayTasks(tasks) {
        taskList.innerHTML = '';
        tasks.forEach(task => displayTask(task));
    }

    function displayTask(task) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="task_name">${task.title}</span>
            <span>${task.completed ? 'Completed' : 'Pending'}</span>
            <button class="toggle-status-button" data-task-id="${task.id}" data-completed="${task.completed ? 'true' : 'false'}">
                ${task.completed ? 'Mark Pending' : 'Mark Completed'}
            </button>
            <button class="update-button" data-task-id="${task.id}">Update</button>
            <button class="delete-button" data-task-id="${task.id}">Delete</button>
        `;
        li.classList.toggle('completed', task.completed);

        // Add event listeners dynamically
        addTaskEventListeners(li, task);

        // Append the new task to the list
        taskList.appendChild(li);
    }

    function addTaskEventListeners(li, task) {
        li.querySelector('.toggle-status-button').addEventListener('click', function () {
            const taskId = this.getAttribute('data-task-id');
            const completed = this.getAttribute('data-completed') === 'true';
            toggleTaskStatus(taskId, completed);
        });

        li.querySelector('.delete-button').addEventListener('click', function () {
            const taskId = this.getAttribute('data-task-id');
            deleteTask(taskId);
        });

        // Add the event listener for the update button here
        li.querySelector('.update-button').addEventListener('click', function () {
            const taskId = this.getAttribute('data-task-id');
            updateTaskForm(taskId);
        });
    }

    function updateTask(taskId, title, description) {
        fetch(`${apiUrl}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                title,
                description,
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to update task (status ${response.status}).`);
            }
            return response.json();
        })
        .then(updatedTask => {
            // Fetch only the updated task instead of all tasks
            fetchUpdatedTask(updatedTask.id);
            resetTaskForm();
            setTimeout(() => {
                fetchTasks();
            }, 5);
        })
        .catch(error => {
            console.error('Error updating task:', error);
            alert(`Error updating task. Please try again. ${error.message}`);
        });
    }

    function fetchUpdatedTask(taskId) {
        fetch(`${apiUrl}/tasks/${taskId}`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        })
        .then(response => response.json())
        .then(updatedTask => {
            // Update the task in the task list
            updateTaskInList(updatedTask);
        })
        .catch(error => {
            console.error('Error fetching updated task details:', error);
            alert('Error fetching updated task details. Please try again.');
        });
    }

    function updateTaskInList(updatedTask) {
        const existingTaskElement = document.querySelector(`[data-task-id="${updatedTask.id}"]`);
        if (existingTaskElement) {
            // Replace the existing task in the list with the updated task
            displayTask(updatedTask, existingTaskElement);
        } else {
            // Handle the case where the task is not found in the list
            console.warn('Task not found in the list:', updatedTask.id);
        }
    }

    function toggleTaskStatus(taskId, completed) {
        fetch(`${apiUrl}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                completed: !completed,
            }),
        })
        .then(response => response.json())
        .then(updatedTask => {
            fetchTasks();
        })
        .catch(error => {
            console.error('Error toggling task status:', error);
            alert('Error toggling task status. Please try again.');
        });
    }

    function deleteTask(taskId) {
        fetch(`${apiUrl}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        })
        .then(response => {
            if (response.ok) {
                fetchTasks();
            } else {
                throw new Error('Failed to delete task.');
            }
        })
        .catch(error => {
            console.error('Error deleting task:', error);
            alert('Error deleting task. Please try again.');
        });
    }

    window.fetchTasks = fetchTasks;
});
