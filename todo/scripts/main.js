let todo = [];
let done = [];
let nextTodoId = 0;

function store_info(text, time=""){
    todo.push([text, time, nextTodoId])
    //increment id
    nextTodoId++;
    console.log('Stored new todo:', todo[todo.length - 1])
}


function display_todo_list(){
    // function to refresh todo list
    const toDoListUl = document.getElementById("todo_list");
    toDoListUl.innerHTML = "";
    if (todo.length === 0) {
        // return to default message if empty
        const defaultMessage = document.createElement("li");
        defaultMessage.textContent = "No task";
        toDoListUl.appendChild(defaultMessage);
    }
    else {
        // display existing todo array
        todo.forEach( item => {
            // newTodoItem = document.createElement("li");
            const itemText = item[0];
            const itemTime = item[1];
            const itemId = item[2];

            // create list container:
            const newTodoItem = document.createElement("li");
            newTodoItem.dataset.id = itemId;

            // create span:
            const textSpan = document.createElement("span");
            textSpan.classList.add('todo-text');
            textSpan.textContent = itemText;

            // create time:
            let dateTimeSpan = null;
            if (itemTime){
                dateTimeSpan = document.createElement("span");
                dateTimeSpan.classList.add("todo-datetime");
                dateTimeSpan.textContent = itemTime;
            }

            //create checkbox
            const checkbox = document.createElement("input");
            checkbox.type= 'checkbox';
            checkbox.classList.add('todo-checkbox');
            // add eventlistener
            // checkbox.addEventListener('change', complete_task(newTodoItem.dataset.id))
            // this way to write eventlistener will call complete_task immediately. use the folloing one:
            checkbox.addEventListener('change', () =>{
                complete_task(itemId)
            })

            // apply texts to li:
            newTodoItem.appendChild(textSpan);
            // apply time
            if (itemTime){
                newTodoItem.appendChild(dateTimeSpan);
            }
            // apply checkbox
            newTodoItem.appendChild(checkbox);

            // apply li to ul:
            toDoListUl.appendChild(newTodoItem);
        })
    }
}

function display_done_list(){
    // function to refresh done list
    const doneArea = document.getElementById("done_area");
    doneArea.innerHTML = "";
    if (done.length !== 0) {
        // else display existing done items
        // add h2
        const doneTitle = document.createElement("h2");
        doneTitle.textContent = "Done:";
        doneArea.appendChild(doneTitle);

        // add ul
        const doneUl = document.createElement("ul");
        doneArea.appendChild(doneUl);

        // display done array
        done.forEach( item => {
            const itemText = item[0];
            const itemTime = item[1];
            const itemId = item[2];

            
            // create list container:
            const newDoneItem = document.createElement("li");
            newDoneItem.dataset.id = itemId;

            // create span:
            const textSpan = document.createElement("span");
            textSpan.classList.add('done-text');
            textSpan.textContent = itemText;

            // create time:
            let dateTimeSpan = null;
            if (itemTime){
                dateTimeSpan = document.createElement("span");
                dateTimeSpan.classList.add("done-datetime");
                dateTimeSpan.textContent = itemTime;
            }

            //create button
            const button = document.createElement("button");
            button.type= 'button';
            button.classList.add('delete-botton');
            const icon = document.createElement("i");
            icon.classList.add('fa-solid', 'fa-trash');
            button.appendChild(icon);

            //create eventlistener
            button.addEventListener('click', () =>{
                delete_task(itemId)
            })

            // apply texts to li:
            newDoneItem.appendChild(textSpan);
            // apply time
            if (itemTime){
                newDoneItem.appendChild(dateTimeSpan);
            }
            // apply button
            newDoneItem.appendChild(button);

            // apply li to ul:
            doneUl.appendChild(newDoneItem);
        })
    }
    else{
        console.log("done array is empty, clear done area");
    }
}

function complete_task(id){
    //@param id -- checkbox id that is triggered
    const itemIndex = todo.findIndex(item => item[2]===id);
    let completedTask = todo.splice(itemIndex,1)[0];
    console.log("completed task: ", completedTask);
    done.push(completedTask);
    // refresh both lists
    display_todo_list();
    display_done_list();
}

function delete_task(id){
    //@param id -- button id that is clicked
    // match id and delete corresponding item
    console.log("attempting to delete task: ", id);
    const itemIndex = done.findIndex(item => item[2] === id);
    const deleted = done.splice(itemIndex, 1);
    console.log("deleted item: ", deleted);
    // refresh done list
    display_done_list();
}


document.getElementById("add_todo_form").addEventListener("submit", (event)=> {
    // button does not have submit event so listen to the form element
    event.preventDefault();
    let text = document.getElementById("new_todo_input").value;
    let time = document.getElementById("new_todo_datetime").value;
    if (time){
        store_info(text,time);
    }
    else {
        store_info(text);
    }
    display_todo_list();
})
