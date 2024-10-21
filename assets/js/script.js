// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
    return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
    const taskCard = $(`
        <div class="card mb-2" data-id="${task.id}" style="background-color: ${task.isOverdue ? 'red' : (task.isNearingDeadline ? 'yellow' : 'white')}">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text"><small class="text-muted">Due: ${dayjs(task.dueDate).format('MM/DD/YYYY')}</small></p>
                <button class="btn btn-danger delete-btn">Delete</button>
            </div>
        </div>
    `);

    return taskCard;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
    $('#todo-cards').empty();
    $('#in-progress-cards').empty();
    $('#done-cards').empty();

    taskList.forEach(task => {
        const taskCard = createTaskCard(task);
        if (task.status === 'To Do') {
            $('#todo-cards').append(taskCard);
        } else if (task.status === 'In Progress') {
            $('#in-progress-cards').append(taskCard);
        } else if (task.status === 'Done') {
            $('#done-cards').append(taskCard);
        }

        // Make the cards draggable
        taskCard.draggable({
            revert: "invalid",
            start: function(event, ui) {
                $(this).css('z-index', 1000);
            },
            stop: function(event, ui) {
                $(this).css('z-index', '');
            }
        });
    });

    // Make lanes droppable
    $(".lane").droppable({
        accept: ".card",
        hoverClass: "lane-hover",
        drop: function(event, ui) {
            const droppedCardId = ui.draggable.data('id');
            const newStatus = $(this).data('status');

            updateTaskStatus(droppedCardId, newStatus);
            renderTaskList(); // Refresh task list to reflect new status
        }
    });
}

// Function to update the task status when it's dropped in a different lane
function updateTaskStatus(taskId, newStatus) {
    const task = taskList.find(task => task.id === taskId);

    if (task) {
        task.status = newStatus;
        saveTasks();
    }
}

// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();
    
    const title = $('#taskTitle').val();
    const description = $('#taskDescription').val();
    const dueDate = $('#taskDueDate').val();

    const task = {
        id: generateTaskId(),
        title: title,
        description: description,
        dueDate: dueDate,
        status: 'To Do',
        isNearingDeadline: dayjs().isSame(dayjs(dueDate).subtract(3, 'days'), 'day'),
        isOverdue: dayjs().isAfter(dueDate),
    };
    
    taskList.push(task);
    saveTasks();
    $('#formModal').modal('hide');
    renderTaskList();
}

// Function to handle deleting a task
function handleDeleteTask(event) {
    const id = $(event.target).closest('.card').data('id');
    taskList = taskList.filter(task => task.id !== id);
    saveTasks();
    renderTaskList();
}

// Function to save tasks to localStorage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));
}

// When the page loads, render the task list and add event listeners
$(document).ready(function () {
    renderTaskList();

    // Add event listeners
    $('#formModal .save-btn').click(handleAddTask);
    $(document).on('click', '.delete-btn', handleDeleteTask);

    // Initialize datepicker for the due date input
    $('#taskDueDate').datepicker();
});
