"use strict";

/**
 * generate random text in order to use it as an ID
 * @returns {string} - given id
 */
function generateID() {
    return Math.random().toString(36).substring(2, 15);
}

/**
 * handle submit on "Add task" button press
 */
$(".task-form").submit((event) => {
    event.preventDefault();
    const taskContent = $("#task-value").val();
    const taskPriority = $("input:checked").val();
    const deadline = $("#datepicker").val();

    if (taskContent.length > 0) {
        // create task prior to add
        const task = {
            id: generateID(),
            content: taskContent,
            priority: taskPriority,
            timestamp: new Date(),
            deadline
        };

        // add task to the tasks list
        app.addTask(task);
    }
});

$(function () {
    $("#datepicker").datepicker();
});

// App code
const app = {
    tasks: [],

    // sort of app backed and DB
    getTasksFromLocalStorage() {
        if (localStorage.getItem("tasks")) {
            const tasksFromLocalStorage = (JSON.parse(localStorage.getItem("tasks")));
            this.tasks = tasksFromLocalStorage.sort((a, b) => b.timestamp < a.timestamp ? 1 : -1);
            this.renderAllTasks();
        }
    },

    renderAllTasks() {
        if (this.tasks.length > 0) {
            this.tasks.forEach(task => {
                this.renderTask(task);
            });
        }
    },

    renderTask(task) {
        const item = $(`
            <li data-id=${task.id} class="item-container">
              <span data-id=${task.id} class="task-content">${task.content}</span>
              <textarea data-id=${task.id} hidden class="task-content">${task.content}</textarea>
              <strong data-id=${task.id} class="task-priority">${task.priority}</strong>
              <select data-id=${task.id} name="priority" class="task-priority" hidden>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
              </select>
              <strong data-deadline-id=${task.id} class="task-priority">${task.deadline}</strong>
              <input 
                  data-deadline-id=${task.id} 
                  type="text" 
                  class="task-priority datepicker1" 
                  hidden 
                  autocomplete="off"
                  value=${task.deadline}
              >
              <button data-edit-btn-id=${task.id} class="edit-btn">Edit</button>
              <button data-save-btn-id=${task.id} class="save-btn" hidden>Save</button>
              <button data-delete-btn-id=${task.id} class="delete-btn">Delete</button>
            </li>
        `);
        item.prependTo(".task-list");

        // add onClick listener
        this.buttonsEventHandler(task.id);
    },

    addTask(task) {
        this.tasks = [task, ...this.tasks];
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
        this.renderTask(task);
        $("#task-value").val("");
        $("#datepicker").val("");

    },

    toggleVisibility(id) {
        $(`span[data-id|=${id}]`).toggle();
        $(`strong[data-id|=${id}]`).toggle();
        $(`strong[data-deadline-id|=${id}]`).toggle();
        $(`input[data-deadline-id|=${id}]`).toggle();
        $(`select[data-id|=${id}]`).toggle();
        $(`textarea[data-id|=${id}]`).toggle();
        $(`button[data-edit-btn-id|=${id}]`).toggle();
        $(`button[data-save-btn-id|=${id}]`).toggle();

        $(function () {
            $(".datepicker1").datepicker();
        });
    },

    saveAlteredTask(id) {
        const alteredTask = $(`textarea[data-id|=${id}]`).val();
        const alteredTaskPriority = $(`select[data-id|=${id}]`).val();
        const alteredTaskDeadline = $(`input[data-deadline-id|=${id}]`).val();

        // change inner html of altered fields
        $(`span[data-id|=${id}]`).html(alteredTask);
        $(`strong[data-id|=${id}]`).html(alteredTaskPriority);
        $(`strong[data-deadline-id|=${id}]`).html(alteredTaskDeadline);

        const task = {
            id,
            content: alteredTask,
            priority: alteredTaskPriority,
            timestamp: new Date(),
            deadline: alteredTaskDeadline
        };

        // change tasks list in DB
        this.tasks = [task, ...this.tasks.filter(task => task.id !== id)];
        localStorage.setItem("tasks", JSON.stringify(this.tasks));

        // set normal view
        this.toggleVisibility(id);
    },

    removeTask(id) {
        $(`li[data-id|=${id}]`).remove();
        this.tasks = this.tasks.filter(task => task.id !== id);
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
    },

    buttonsEventHandler(id) {
        $(`button[data-edit-btn-id|=${id}]`).click(() => {
            this.toggleVisibility(id);
        });
        $(`button[data-save-btn-id|=${id}]`).click(() => {
            this.saveAlteredTask(id);
        });
        $(`button[data-delete-btn-id|=${id}]`).click(() => {
            this.removeTask(id);
        })
    },
};

// start-up the App
window.onload = function () {
    app.getTasksFromLocalStorage();
};