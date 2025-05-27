<script setup lang="ts">
import type { Item, Cash } from "@/types";

// define props to inherit from parent
const props = defineProps<{
  inventory: Item[];
  currentCash: Cash;
  totalCashValue: number;
  currentBalance: number;
  activeButton: number;
}>();

// emit event to parent
const emit = defineEmits(['registerTrade']);
function handleNewTrade(): void {
  console.log('registerTrade event emitted');
  emit('registerTrade')
}
</script>

<template>
  <div class="detail-component">
    <h2>商品：</h2>
    <ul>
      <li v-if="props.inventory.filter(item => item.stock !== 0).length ===0">在庫はありません</li>
      <template v-else>
        <li v-for="item in props.inventory.filter(item => item.stock !== 0)" :key="item.id">
          <span class="item-name">{{ item.name }}</span>
          <span class="item-stock">{{ item.stock }}</span>
        </li>
      </template>
    </ul>

    <h2>現金：</h2>
    <ul>
      <template v-for="(value, key) in props.currentCash" :key="key">
        <li v-if="value > 0">
          <span class="cash-value">{{ key }}円：</span>
          <span class="cash-quantity">{{ value }}</span>
        </li>
      </template>
      <br>
      <li>
        <span class="cash-value">合計：</span>
        <span class="cash-quantity">{{ props.totalCashValue }}</span>
      </li>
    </ul>

    <h2>口座：</h2>
    <ul>
      <li>
        <span class="balance-value">残高：</span>
        <span class="balance-amount">{{ props.currentBalance }}</span>
      </li>
    </ul>
    <button v-if="activeButton === 3" @click="handleNewTrade()">新規登録</button>
  </div>
</template>

<style scoped>
ul {
  margin: 0 2rem 0.4rem 4rem;
  border: 1px solid purple;
}

li {
  display: flex;
}

h2 {
  font-size: 1.4rem;
}

button {
  position: absolute;
  right: 50%;
  /* transform: translateX(-50%); */
  bottom: 0.5rem;
  display: block;
  /* margin: 0 auto; */
  border: solid 1px #F49367;
  border-radius: 25px;
  min-width: 100px;
  min-height: 50px;
  color: white;
  font-size: large;
  background-color: #F26E29;
}

button:hover {
  background-color: #F49367;
  cursor: pointer;
}

.detail-component {
  /* display: box; */
  gap: 1rem;
  padding: 1rem 3rem 0.5rem 1rem;
  color: black;
  /* background: linear-gradient(to right, rgba(245,184,164,0.3)0%, rgba(245,184,164,0.1) 5%, rgba(245,184,164,0) 100%); */
  background-color: #f5b8a4;
  min-height: 80vh;
  line-height: 2.3rem;
}

.item-name,
.cash-value,
.balance-value {
  margin: 0 2rem 0 0;
  font-size: 1.4rem;
  font-weight: bold;
}

.item-stock,
.cash-quantity,
.balance-amount {
  margin-left: auto;
  margin-right: 4rem;
}
</style>
