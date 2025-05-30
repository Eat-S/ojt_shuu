<script setup lang="ts">
import { computed } from 'vue';
import type { TradeInfo, Item } from '@/types';

const props = defineProps<{
  tradeLog: TradeInfo[],
  inventory: Item[],
}>()

function sortedTrades(): TradeInfo[] {
  // sort tradeLog list with date and amount desc
  return [...props.tradeLog].sort((a, b) => {
    const dateA = a.date;
    const dateB = b.date;

    if (dateA === undefined && dateB !== undefined) {
      return 1;
    }
    if (dateA !== undefined && dateB === undefined) {
      return -1;
    }
    if (dateA && dateB) {
      const dateComparison = dateB.localeCompare(dateA);
      if (dateComparison !== 0) {
        return dateComparison;
      }
    }
    return b.amount - a.amount;
  });
};

// Computed property to get the IDs of the top 3 trades
const selectedId = computed<TradeInfo[]>(() => {
  // Take the first 3 items from the sorted list
  return sortedTrades().slice(0, 3);
});

</script>

<template>
  <div class="history-component">
    <div v-if="selectedId.length === 0" class="no-trades-message">
      <p>No recent trades to display.</p>
    </div>
    <div v-else>
      <div v-for="(trade, index) in selectedId" :key="trade.id" class="trade-item-container">
        <h3>注目の取引 #{{ index + 1 }}</h3>
        <ul>
          <li>商品名: {{inventory.find(item => item.id === trade.id)?.name ?? "N/A"}}</li>
          <li>取引種別: {{ trade.isPurchase ? "買う" : "売り" }}</li>
          <li>数量: {{ trade.quantity }}</li>
          <li>金額: {{ trade.amount }}円</li>
          <li>支払方法: {{ trade.isCash ? "現金" : "カード" }}</li>
          <li>日付: {{ trade.date ?? 'N/A' }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
ul {
  margin: 0 2rem 0.4rem 4rem;
  border: 1px solid rgb(0, 128, 70);
}

li {
  display: box;
  list-style-type: none;
  text-align: center;
}

.history-component {
  /* display: box; */
  gap: 1rem;
  padding: 1rem 3rem 0.5rem 1rem;
  color: #b2eef8;
  /* background: linear-gradient(to right, rgba(245,184,164,0.3)0%, rgba(245,184,164,0.1) 5%, rgba(245,184,164,0) 100%); */
  background-color: #542700;
  min-height: 80vh;
  line-height: 2rem;
}


/*
.trade-item-container {
  display: flex;
  flex-direction: row;
  min-width: 80%;
  align-items: center;
  padding: 1rem;

} */

</style>

