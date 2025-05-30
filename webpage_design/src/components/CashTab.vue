<script setup lang="ts">
import { ref, computed, watch, watchEffect } from 'vue';
import type { Cash } from "@/types";

// define props to inherit from parent
const props = defineProps<{
  currentCash: Cash|null;
  pendingCashChange: Cash;
  totalCashValue: number;
  currentBalance: number;
  isCash: boolean;
  amount: number;
  activeButton: number;
}>()

// backup of pending cash in child
const customizedCash = ref<Cash>(props.pendingCashChange)
watch(() => props.pendingCashChange, (newValue) => {
  console.log("pendingCashChange changed ", customizedCash.value);
  customizedCash.value = { ...newValue }
})

// computed sum of customized cash
const cashSum = computed(() => {
  let sum = 0;
  Object.keys(customizedCash.value).forEach((key) => {
    // convert string key to number key for type security
    const numKey = Number(key) as keyof Cash;
    // calculate total cash value
    sum += numKey * customizedCash.value[numKey];
  })
  return sum
})

// warning if pendingCashChange+currentCash<0 for specific key and set to value of currentCash[key]
watchEffect(() => {
  for (const key in customizedCash.value) {
    const numKey = Number(key) as keyof Cash;
    // check if current cash is less than 0
    if (props.currentCash && props.currentCash[numKey] + customizedCash.value[numKey] < 0) {
      console.warn(`現金が不足しています: ${key}円`);
      customizedCash.value[numKey] = -props.currentCash[numKey]
    }
  }
})

// emit event to parent
const emits = defineEmits(['submitCashChange'])
function submitCashChange() {
  // submit only if cashSum equals to amount or balance
  if (props.isCash && cashSum.value !== props.amount) {
    console.warn("金額が一致しません");
    return
  }
  console.log("現金精算の内容", customizedCash.value);
  emits('submitCashChange', customizedCash.value)
}

</script>

<template>
  <div class="cash-component">
    <section class="cash-detail">
      <h2>現金精算：</h2>
      <ul>
        <li v-for="(_, key) in customizedCash" :key="key">
          <label class="denomination" for="cash-quantity">{{ key }}円： (現在{{ currentCash?.[key] ?? 0 }}枚)</label>
          <input type="number" id="cash-quantity" v-model="customizedCash[key]" :disabled="!isCash" placeholder="-" />枚
        </li>
      </ul>
      <span class="cash-count">合計{{ cashSum }} / {{ props.amount }}円</span>
    </section>
    <section class="balance-detail">
      <h2>残高精算：</h2>
      <div class="balance-info-row">
        <span class="account-balance">
          <span class="balance-label">口座残高：</span>
          <span class="current-balance">{{ props.currentBalance }}円</span>
        </span>
        <span class="balance-change">(+{{ isCash ? "-" : amount }}円)</span>
      </div>
    </section>
    <button v-if="activeButton === 2" @click="submitCashChange">確認</button>
  </div>
</template>

<style scoped>
label {
  margin-left: 1rem;
  font-size: 1.4rem;
}

h2 {
  margin-left: auto;
  margin-right: 46%;
  top: 0.5rem;
  font-size: 1.4rem;
}

ul {
  list-style-type: none;
}

li {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 0;
  margin-right: 3rem;
  font-size: 1rem;
}

.cash-component {
  display: box;
  gap: 1rem;
  padding: 1rem;
  color: black;
  background-color: #F49367;
  min-height: 80vh;
}

input {
  min-width: 10%;
  padding: 0.5rem;
  margin-left: auto;
  margin-right: 2rem;
  min-height: 2rem;
  background-color: #f5b8a4;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
  text-align: right;
}

input:disabled {
  cursor: not-allowed
}

button {
  position: absolute;
  right: 50%;
  bottom: 0.5rem;
  display: block;
  /* margin: 0 auto; */
  border: solid 1px #f5b8a4;
  border-radius: 25px;
  min-width: 100px;
  min-height: 50px;
  color: white;
  font-size: large;
  background-color: #F36E2A;
}

/* TODO: edit button position */

button:hover {
  background-color: #F36E2A;
  cursor: pointer;
}

.cash-detail {
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  margin: 2rem;
  gap: 1rem;
}

.balance-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem;
  gap: 1rem;
}

.cash-count {
  margin-left: auto;
  margin-right: 3rem;
  font-size: 1.4rem;
}

.balance-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 600px;
}

.account-balance {
  display: flex;
  align-items: center;
  flex-grow: 1;
  justify-content: space-between;
}

.balance-label {
  font-size: 1.4rem;
  font-weight: bold;
}

.current-balance {
  font-size: 1.4rem;
  font-weight: bold;
  margin-right: 4rem;
}

.balance-change {
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
