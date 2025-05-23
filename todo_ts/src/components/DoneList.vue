<script setup lang="ts">
import { computed } from 'vue'
import type { Todo } from '../App.vue';

// inherit Todo type from App.vue
const props = defineProps<{
  dones: Todo[]
}>()

// computed property to filter completed todos (done === true)
const doneTodos = computed(() => {
  return props.dones.filter((todo) => todo.done)
})

// emit completed task id to parent
const emits = defineEmits(['delete-task'])
function handleDelete(id: number): void {
  emits('delete-task', id)
}
</script>

<template>
  <div id="done_area">
    <template v-if="doneTodos.length !== 0">
      <h2>Done:</h2>
      <ul>
        <li v-for="dones in doneTodos" :key="dones.id">
          <span>{{ dones.content }}</span>
          <span v-if="dones.deadline">{{ dones.deadline }}</span>
          <button class="delete-button" @click="handleDelete(dones.id)">
            <img src="../assets/trash.svg" alt="delete" />
          </button>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
#done_area {
  display: block;
  margin: 0 auto 20px auto;
  padding: 20px 30px;
  width: 600px;
  max-width: 95%;
  min-height: 30vh;
  border: none;
  overflow-y: auto;
}

#done-area .delete-button {
  display: block;
  margin-right: 10px;
  height: 1rem;
  width: 1rem;
}


img {
  display: block;
  width: 1.2rem;
  height: 1.2rem;
  object-fit: contain;
}
</style>
