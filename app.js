document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let tasks = JSON.parse(localStorage.getItem('premiumTasks')) || [];

    // --- DOM Elements ---
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const addTaskForm = document.getElementById('add-task-form');

    // Lists
    const scheduledList = document.getElementById('scheduled-list');
    const inProgressList = document.getElementById('in-progress-list');
    const completedList = document.getElementById('completed-list');

    // --- Navigation Logic ---
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));

            // Add active class to clicked
            item.classList.add('active');
            const tabId = item.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // Refresh lists on tab switch
            renderTasks();
        });
    });

    // --- Task Attributes ---
    // Statuses: 'scheduled', 'in-progress', 'completed'

    // --- Add Task Logic ---
    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-desc').value;
        const dueDate = document.getElementById('task-date').value;

        const newTask = {
            id: Date.now(),
            title,
            description,
            dueDate,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        tasks.push(newTask);
        saveTasks();

        // Reset form
        addTaskForm.reset();

        // Show success feedback (optional, for now just redirect/alert)
        alert('Task added successfully!');

        // Switch to Scheduled tab to see it
        document.querySelector('[data-tab="scheduled"]').click();
    });

    // --- Render Logic ---
    function renderTasks() {
        // Clear all lists
        scheduledList.innerHTML = '';
        inProgressList.innerHTML = '';
        completedList.innerHTML = '';

        tasks.forEach(task => {
            const card = createTaskCard(task);

            if (task.status === 'scheduled') {
                scheduledList.appendChild(card);
            } else if (task.status === 'in-progress') {
                inProgressList.appendChild(card);
            } else if (task.status === 'completed') {
                completedList.appendChild(card);
            }
        });
    }

    function createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';

        // Format Date
        const dateObj = new Date(task.dueDate);
        const dateString = dateObj.toLocaleDateString();

        let actionButtons = '';
        let statusBadge = '';

        // Determine actions based on status
        if (task.status === 'scheduled') {
            actionButtons = `
                <button class="action-btn" onclick="updateTaskStatus(${task.id}, 'in-progress')" title="Start Task">
                    <i class="fa-solid fa-play"></i>
                </button>
                <button class="action-btn" onclick="deleteTask(${task.id})" title="Delete Task">
                     <i class="fa-solid fa-trash"></i>
                </button>
            `;
        } else if (task.status === 'in-progress') {
            actionButtons = `
                <button class="action-btn" onclick="updateTaskStatus(${task.id}, 'completed')" title="Complete Task">
                    <i class="fa-solid fa-check"></i>
                </button>
                 <button class="action-btn" onclick="deleteTask(${task.id})" title="Delete Task">
                     <i class="fa-solid fa-trash"></i>
                </button>
            `;
        } else if (task.status === 'completed') {
            // Check if on time
            const due = new Date(task.dueDate);
            // Set due time to end of day so completion on the same day counts as on time
            due.setHours(23, 59, 59, 999);

            const completed = new Date(task.completedAt);
            const isLate = completed > due;

            statusBadge = isLate
                ? `<span class="status-badge badge-late">Late</span>`
                : `<span class="status-badge badge-ontime">On Time</span>`;

            actionButtons = `
                <button class="action-btn" onclick="deleteTask(${task.id})" title="Delete Task">
                     <i class="fa-solid fa-trash"></i>
                </button>
            `;
        }

        card.innerHTML = `
            <div class="task-info">
                <h3>${task.title} ${statusBadge}</h3>
                <p>${task.description || 'No description provided.'}</p>
                <div class="meta-data">
                    <span><i class="fa-regular fa-clock"></i> Due: ${dateString}</span>
                </div>
            </div>
            <div class="task-actions">
                ${actionButtons}
            </div>
        `;

        return card;
    }

    // --- Data Persistence ---
    function saveTasks() {
        localStorage.setItem('premiumTasks', JSON.stringify(tasks));
    }

    // --- Global Helpers (attached to window for onclick access) ---
    window.updateTaskStatus = (id, newStatus) => {
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex > -1) {
            tasks[taskIndex].status = newStatus;

            if (newStatus === 'completed') {
                tasks[taskIndex].completedAt = new Date().toISOString();
            }

            saveTasks();
            renderTasks();
        }
    };

    window.deleteTask = (id) => {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        }
    };

    // Initial render
    renderTasks();
});
