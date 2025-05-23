<script setup>
import { ref } from 'vue'
import SubmitForm from './components/SubmitForm.vue'
import TodoList from './components/TodoList.vue'
import DoneList from './components/DoneList.vue'

const todoList = ref([])
// todo list for the app
const nextTodoId = ref(1)
// unique id for each todo

function appendTodo(todoData) {
  console.log(todoData)
  console.log(todoData.content)
  const newTodo = {
    id: nextTodoId.value,
    done: false,
    // content: todoData.content,
    // deadline: todoData.deadline,
    ...todoData,
  }
  todoList.value.push(newTodo)
  console.log(`Adding: ${todoData.content} to todo list`)
  console.log(`Todo ID: ${nextTodoId.value++}`)
}

function markAsDone(nextTodoId) {}

function deleteTodo(nextTodoId) {}
</script>

<template>
  <div>
    <header>
      <h1>TODO List</h1>
    </header>

    <main>
      <TodoList :list="todoList" />
      <DoneList :list="todoList" />
      <SubmitForm @append-todo="appendTodo" />
    </main>

    <footer>
      <p>&copy; 2025.5 周稲</p>
    </footer>
  </div>
</template>

<style scoped>
</style>
