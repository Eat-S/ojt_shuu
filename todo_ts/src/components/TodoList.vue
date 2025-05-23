<script setup lang="ts">
import { computed } from 'vue'
import type { Todo } from '../App.vue';

// inherit Todo type from App.vue
const props = defineProps<{
  todos: Todo[]
}>()

// computed property to filter remaining todos (done === false)
const pendingTodos = computed(() => {
  return props.todos.filter((todo) => !todo.done)
})

// emit completed task id to parent
const emit = defineEmits(['complete-task'])
function handleComplete(id: number) {
  emit('complete-task', id)

}
</script>

<template>
  <div id="todo-list-area">
    <h2>TODO:</h2>
    <ul id="todo_list">
      <li v-if="pendingTodos.length === 0">No task</li>
      <template v-else>
        <li v-for="todo in pendingTodos" :key="todo.id">
          <span>{{ todo.content }}</span>
          <span v-if="todo.deadline">{{ todo.deadline }}</span>
          <input type="checkbox" class="todo-checkbox" @change="handleComplete(todo.id)" />
        </li>
      </template>
    </ul>
  </div>
</template>

<style scoped>
.todo-checkbox {
  display: block;
  margin-right: 10px;
}


#todo-list-area {
  display: block;
  margin: 0 auto 20px auto;
  padding: 20px 30px;
  width: 600px;
  max-width: 95%;
  min-height: 30vh;
  background-color: #eeeeee49;
  border: #111 solid 1px;
  border-radius: 15px;
  overflow-y: auto;
}

#todo-list-area li:last-child {
  border-bottom: none;
}
</style>
