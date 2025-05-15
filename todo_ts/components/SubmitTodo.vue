<script setup lang="ts">
import { ref } from 'vue'

// take input text as task
const inputText = ref('')
// take input datetime as deadline
const inputDatetime = ref('')

// define emits for parent
const emit = defineEmits(['append-todo'])

// apply input values
function handleSubmit() {
  if (inputText.value === '') {
    // input taxt cannot be empty
    alert('Please enter a task')
    return
  }
  else {
    // emit input values to parent
    emit('append-todo', {
      content: inputText.value,
      deadline: inputDatetime.value,
    })
    // reset input values
    inputText.value = ''
  }



}
</script>
<template>
  <div id="submit_area">

    <h2>New Task:</h2>
    <div id="submit_form">
      <div class="input-wrapper">
        <label for="new_todo_input">Task: </label>
        <input type="text" id="new_todo_input" v-model="inputText" placeholder="ここでタスクを追加" autofocus />
        <label for="new_todo_datetime">Deadline (optional): </label>
        <input type="datetime-local" id="new_todo_datetime" required v-model="inputDatetime" />
      </div>
      <button id="submit_button" @click="handleSubmit()">追加</button>
    </div>
  </div>
</template>

<style scoped>
.input_wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input {
  width: 100%;
  border-radius: 4px;
  font-family: inherit;
  /* Inherit body font */
  font-size: 1rem;
}

#submit_area {
  padding: 15px 20px;
  border-radius: 15px 15px 0 0;
  width: 600px;
  max-width: 95%;
  position: fixed;
  left: 50%;
  transform: translate(-50%);
  bottom: 0;
  background: #e0e0e0;
  display: flex;
  flex-direction: column;
}

#submit_form {
  display: flex;
  align-items: stretch;
  gap: 2rem;
}


#submit_button {
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-width: 100px;
  aspect-ratio: 1/1;
}
</style>
