<script setup lang="ts">
import { ref } from 'vue'
import SubmitTodo from './components/SubmitTodo.vue'
import DoneList from './components/DoneList.vue'
import TodoList from './components/TodoList.vue'

// const todoList = ref([])
// using typescript:
export type Todo = {
  id: number
  done: boolean
  content: string
  deadline: string
}
const todoList = ref<Todo[]>([])
// todo list for the app
const nextTodoId = ref(1)
// unique id for each todo

function appendTodo(todoData: { content: string; deadline: string }): void {
  // function to append input task to existing todo list
  console.log(todoData)
  console.log(todoData.content)
  const newTodo: Todo = {
    id: nextTodoId.value,
    done: false,
    // content: todoData.content,
    // deadline: todoData.deadline,
    // use spread
    ...todoData,
  }
  todoList.value.push(newTodo)
  console.log(`Adding: ${todoData.content} to todo list`)
  console.log(`Todo ID: ${nextTodoId.value++}`)
}

function completeTodo(id: number): void {
  // function to mark task as done
  const target = todoList.value.find((todo) => todo.id === id)
  console.log("checkbox clicked")
  if (target) {
    target.done = true
    console.log(`Completed: ${target.content}`)
  }
}

function deleteTodo(id: number): void {
  // function to delete task from list
  const target = todoList.value.find((todo) => todo.id === id)
  console.log("delete button clicked")
  if (target) {
    todoList.value = todoList.value.filter((todo) => todo.id !== id)
    console.log(`Deleted: ${target.content}`)
  }
}
</script>

<template>
  <div>
    <header>
      <h1>TODO List</h1>
    </header>

    <main>
      <TodoList :todos="todoList" @complete-task="completeTodo" />
      <DoneList :dones="todoList" @delete-task="deleteTodo" />
      <SubmitTodo @append-todo="appendTodo" />
    </main>

    <footer>
      <p>&copy; 2025.5 周稲</p>
    </footer>
  </div>
</template>

<style scoped></style>
