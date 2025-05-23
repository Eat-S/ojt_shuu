<script setup>
import { ref, defineEmits } from 'vue'

const inputText = ref('')
const inputDatetime = ref('')

// define emits for parent
const emit = defineEmits(['append-todo'])

// apply input values
function handleSubmit() {
  emit('append-todo', {
    content: inputText.value,
    deadline: inputDatetime.value,
  })
  // reset input values
  inputText.value = ''
}
</script>
<template>
  <h2>New Task:</h2>
  <div class="input-wrapper">
    <label for="new_todo_input">Task: </label>
    <input
      type="text"
      id="newTodoInput"
      v-model="inputText"
      placeholder="ここでタスクを追加"
      required
      autofocus
    />
    <label for="new_todo_datetime">Deadline (optional): </label>
    <input type="datetime-local" id="new_todo_datetime" required v-model="inputDatetime" />
  </div>
  <button id="submit_todo" @click="handleSubmit()">追加</button>
</template>