<script setup lang="ts">
import { warn, watch, watchEffect, ref, onMounted } from 'vue';
import type { TradeInfo, Item } from '@/types'

// define props to inherit from parent
const props = defineProps<{
  inventory: Item[];
  totalCashValue: number;
  currentBalance: number;
  trade: TradeInfo
  activeButton: number;
}>();

// backup of object in child and watch for changes
const newTrade = ref<TradeInfo>({ ...props.trade })
watch(() => props.trade, (newValue) => {
  console.log("tradeinfo changed ", props.trade);
  newTrade.value = { ...newValue, date: formattedDate() }
})

// returns default date to today, YYYYMMDD
const formattedDate = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// emit event to parent
const emits = defineEmits(['submitTrade']);
function handleSubmit() {
  switch (true) {
    // check if all values are set except
    case newTrade.value.isPurchase === undefined:
      window.alert("売買の種類を選択してください");
      break;
    case newTrade.value.id === 0 || newTrade.value.id === undefined:
      window.alert("商品名を入力してください");
      break;
    case newTrade.value.id === -1 && !newTrade.value.newName:
      // if new item is selected but no name is set
      window.alert("新しい商品名を入力してください");
      break;
    case newTrade.value.quantity === 0 || newTrade.value.quantity === undefined:
      window.alert("数量を入力してください");
      break;
    case newTrade.value.amount === 0 || newTrade.value.amount === undefined:
      window.alert("金額を入力してください");
      break;
    case newTrade.value.isCash === undefined:
      window.alert("現金か口座を選択してください");
      break;
    default:
      //if name is in inventory but id is -1, set id to correct inventory id
      if (newTrade.value.id === -1) {
        const items = props.inventory.find((item) => item.name === newTrade.value.newName);
        if (items) {
          newTrade.value.id = items.id;
          newTrade.value.newName = "";
          warn(`item exists, set to ${newTrade.value.id}`);
        }
      }
      console.log("新規登録の内容", newTrade.value);
      emits('submitTrade', newTrade.value);
  }
}


// auto correct values
watchEffect(() => {
  // when purchase:
  if (newTrade.value.isPurchase) {
    // 1. if amount is greater than total cash value, set isCash to false or set amount to current maximum.
    if (newTrade.value.amount > props.totalCashValue) {
      if (newTrade.value.amount <= props.currentBalance) {
        newTrade.value.isCash = false;
      }
      else {
        newTrade.value.amount = Math.max(props.totalCashValue, props.currentBalance);
        warn(`Error: amount is undealable, set to ${newTrade.value.amount}`);
      }
    }
  }
  // when sell:
  else if (newTrade.value.isPurchase === false) {
    // 3. if quantity greater than stock, set to stock and warn
    const items = props.inventory.find((item) => item.id === newTrade.value.id);
    if (items) {
      // check inventory
      if (items.stock < newTrade.value.quantity) {
        newTrade.value.quantity = items.stock;
        warn(`Error: quantity is undealable, set to ${newTrade.value.quantity}`)
      }
    }
  }
})

// set default date to today
onMounted(() => {
  if (newTrade.value.date === undefined) {
    newTrade.value.date = formattedDate();
  }
})

</script>

<template>
  <div class="new-trade-component">
    <section class="trade-detail">
      <label for="trade-input">売買： </label>
      <!-- <label>
      <input type="radio" id="trade-input" v-model="newTrade.isPurchase" :value="true" />買う
    </label>
    <label>
      <input type="radio" id="trade-input" v-model="newTrade.isPurchase" value="false" />売る
    </label> -->
      <select v-model="newTrade.isPurchase" id="trade-input" :disabled="activeButton !== 1">
        <option :value="null" disabled>選んでください</option>
        <option :value="true">買う</option>
        <option :value="false">売る</option>
      </select>
    </section>
    <section class="trade-detail">
      <label for="trade-item">商品名：</label>
      <select id="trade-item" v-model="newTrade.id" :disabled="activeButton !== 1">
        <option :value="0" disabled>選んでください</option>
        <option v-for="item in props.inventory" :key="item.id" :value="item.id">{{ item.name }}</option>
        <option :value="-1">新しい商品</option>
      </select>
    </section>
    <section v-if="newTrade.id === -1" class="trade-detail">
      <label for="new-item-name">新しい商品名：</label>
      <input type="text" id="new-item-name" v-model="newTrade.newName" :disabled="activeButton !== 1" />
    </section>
    <section class="trade-detail">
      <label for="trade-quantity">数量</label>
      <input type="number" id="trade-quantity" v-model="newTrade.quantity" min="0" :disabled="activeButton !== 1" />
    </section>
    <section class="trade-detail">
      <label for="trade-amount">合計金額</label>
      <input type="number" id="trade-amount" v-model="newTrade.amount" min="0" :disabled="activeButton !== 1" />
    </section>
    <section class="trade-detail">
      <label for="trade-payment">支払方法</label>
      <select v-model="newTrade.isCash" id="trade-payment" :disabled="activeButton !== 1">
        <option :value="null" disabled>選んでください</option>
        <option :value="true">現金</option>
        <option :value="false">カード</option>
      </select>
    </section>
    <section class="trade-detail">
      <label for="trade-date">取引日</label>
      <input type="string" id="trade-date" v-model="newTrade.date" pattern="\d{8}" inputmode="numeric" maxlength="8"
        :disabled="activeButton !== 1" />
    </section>
    <button v-if="activeButton === 1" @click="handleSubmit">売買登録</button>
  </div>
</template>

<style scoped>
label {
  margin-left: 5rem;
  font-size: 1.4rem;
  font-weight: bold;
}

select,
input {
  min-width: 30%;
  padding: 0.5rem;
  margin-left: auto;
  margin-right: 12rem;
  min-height: 3rem;
  background-color: #f5b8a4;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
}

select:disabled,
input:disabled {
  background-color: #f5b8a4;
  color: #000;
  cursor: not-allowed;
}

button {
  display: block;
  /* margin: auto; */
  position: absolute;
  right: 50%;
  bottom: 0.5rem;
  border: solid 1px #F49367;
  border-radius: 25px;
  min-width: 100px;
  min-height: 50px;
  color: white;
  font-size: large;
  background-color: #f5b8a4;
}

button:hover {
  background-color: #F49367;
  cursor: pointer;
}

.new-trade-component {
  /* display: box; */
  gap: 1rem;
  padding: 1rem 3rem 1rem 1rem;
  color: black;
  background-color: #F26E29;
  min-height: 80vh;
}

.trade-detail {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 2rem;
  gap: 1rem;
}
</style>
