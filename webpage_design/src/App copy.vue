<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import NewTradeTab from './components/NewTradeTab.vue';
import CashTab from './components/CashTab.vue';
import InventoryTab from './components/InventoryTab.vue';

import type { Item, Cash, TradeInfo } from '@/types'

// types & interfaces:
// define interface of tabs
interface TabInfo {
  id: number;
  title: string;
  buttonLabel: string;
  color: string;
  // component: component to be activated
  // component: Component;
  // props?: Props;
  // emits?: Emits;
}

// type of changing data received from tab 2.
type CashChange = Partial<Cash>


// tab related:
// tab group
const tabConfig: TabInfo[] = [
  {
    id: 1,
    buttonLabel: "新規登録",
    title: "売買の新規登録",
    color: "#F26E29",
  },
  {
    id: 2,
    buttonLabel: "資金管理",
    title: "現金・残高管理",
    color: "#F49367",
  },
  {
    id: 3,
    buttonLabel: "在庫情報",
    title: "在庫明細",
    color: "#F5B8A4",
  },
]
// default on tab 3
const activeTabId = ref(3)
// default button 3 is active
const activeButton = ref(3)
// calculate current page.
const currentTab = computed(() => {
  const selected = tabConfig.find((tab) => tab.id === activeTabId.value);
  if (!selected) {
    console.warn(`Tab with id ${activeTabId.value} not found`);
    return tabConfig[2];
  }
  console.log(`Tab selected: ${selected.title}`)
  return selected
})


// revenue related:
// stores remaining cash data
const currentCash = reactive<Cash>({
  10000: 0,
  5000: 0,
  1000: 0,
  500: 0,
  100: 0,
  50: 0,
  10: 0,
  5: 0,
  1: 0,
})
// stores remaining deposit data
const currentBalance = ref(0);
// define revenue:
const revenue = ref(0)

// stores default trade data and freeze
const DEFAULT_TRADE_INFO: Readonly<TradeInfo> = Object.freeze({
  id: 0,
  quantity: 0,
  amount: 0,
  isPurchase: null,
  isCash: null,
})
// initialize current trade data
let trade = ref<TradeInfo>({ ...DEFAULT_TRADE_INFO })
// stores default pending cash data
const DEFAULT_PENDING_CASH: Readonly<Cash> = Object.freeze({
  10000: 0,
  5000: 0,
  1000: 0,
  500: 0,
  100: 0,
  50: 0,
  10: 0,
  5: 0,
  1: 0,
})
// stores pending cash change data
let pendingCashChange = ref<Cash>({ ...DEFAULT_PENDING_CASH })
// calculate total cashes:
const totalCashValue = computed(() => {
  let amount = 0;
  Object.keys(currentCash).forEach((key) => {
    // convert string key to number key for type security
    const numKey = Number(key) as keyof Cash;
    amount += numKey * currentCash[numKey];
  })
  return amount
})



// stock related:
// define item id, starts from 1
const itemId = ref(1)
// define inventory group: array of item
const inventory = ref<Item[]>([])



// initialize with default values
onMounted(() => {
  insertNewItem({ name: "item A", stock: 30 })
  insertNewItem({ name: "goods B", stock: 6 })
  insertNewItem({ name: "object C", stock: 17 })
  tradeItem({ id: 2, quantity: 5, amount: 10000, isPurchase: false, isCash: false })
  updateCash({ 10000: 10, 5000: 3, 1000: 5, 500: 5, 100: 5, 50: 3, 10: 3, 5: 23, 1: 14 })
  updateBalance(1234567)
  console.log(`total cash: ${totalCashValue.value}`)
  console.log(`total balance: ${currentBalance.value}`)
})

function initializeObjects(): void {
  /**
   * Initialize trade and pendingCashChange objects to default values.
   * @param: void
   * @return: void
   */
  trade.value = { ...DEFAULT_TRADE_INFO }
  pendingCashChange.value = { ...DEFAULT_PENDING_CASH }
}

function insertNewItem(purchasedItem: { name: string; stock: number }): void {
  /**
   * Append new item to inventory list with incrementing itemId.
   * @param purchasedItem: object containing name and stock
   * @return: void
   */
  const newItem: Item = {
    id: itemId.value++,
    ...purchasedItem,
  };
  inventory.value.push(newItem)
  console.log(`new item appended: ${JSON.stringify(newItem)}`);
}

function tradeItem(trade: TradeInfo): void {
  /**
   * Manage changes to existing items.
   * @param trade: object containing trade information, emitted from child
   * @return: void
   */
  if (trade.id !== -1) {
    // for existing items
    const target = inventory.value.find((item) => item.id === trade.id)
    if (target) {
      console.log(`target item: ${JSON.stringify(target)}`)
      // calculate stock and revenue changes
      const modifier = trade.isPurchase ? 1 : -1
      target.stock += trade.quantity * modifier
      console.log(`Item changed: ${target.name}, quantity: ${trade.quantity}`)
      revenue.value -= trade.amount * modifier
      console.log(`revenue changed: ${revenue.value}`)
      if (trade.isCash) {
        // call calcCash to modify cash
        calcCash(-trade.amount * modifier)
      }
      else {
        // call updateBalance to modify balance
        updateBalance(-trade.amount * modifier)
      }
    }
    else {
      console.log(`Failed to change item ${trade.id}`)
    }
  }
  else {
    // for new items, isPurchase is always true
    if (trade.isPurchase && trade.newName) {
      insertNewItem({ name: trade.newName, stock: trade.quantity, }
      )
      // modify revenue
      revenue.value -= trade.amount
      // modify cash/balance
      if (trade.isCash) {
        calcCash(-trade.amount)
      }
      else {
        updateBalance(-trade.amount)
      }
    }
  }
}
// TODO: break down into smaller functions

function updateCash(changes: CashChange): void {
  /**
   * Manage cash changes.
   * @param changes: object containing cash changes
   * @return: void
   */

  Object.keys(changes).forEach((key) => {
    // currentCash[key] += changes[key]
    // convert string key to number key for type security
    const numKey = Number(key) as keyof Cash;
    // currentCash[numKey] += changes[numKey]
    // check key existence
    currentCash[numKey] += changes[numKey] ?? 0;
    console.log(`current ${numKey} cash count: ${currentCash[numKey]}`)
  })
}

function calcCash(amount: number): void {
  /**
   * Calculate cash changes and save result to pendingCashChange.
   * @param amount: total amount to be changed, negative if purchasing
   * @return: void
   */

  console.log(`handling amount: ${amount}`)
  // keys are cash denominations
  const denomination = Object.keys(currentCash).map(Number)
  // convert to desc
  denomination.sort((a, b) => b - a)
  // console.log(`denomination: ${denomination}`)
  if (amount > 0) {
    // selling:
    for (const key of denomination) {
      pendingCashChange.value[key as keyof Cash] = Math.floor(amount / key)
      amount -= pendingCashChange.value[key as keyof Cash] * key
    }
  }
  else {
    // purchasing:
    for (const key of denomination) {
      pendingCashChange.value[key as keyof Cash] = -Math.min(Math.floor(-amount / key), currentCash[key as keyof Cash])
      amount -= pendingCashChange.value[key as keyof Cash] * key
    }
  }
  console.log(`pending cash changes: ${JSON.stringify(pendingCashChange.value)}`)
}

function updateBalance(amount: number): void {
  /**
   * Manage balance changes.
   * @param amount: amount to be changed
   * @return: void
   */

  currentBalance.value += amount
  console.log(`balance changes to: ${currentBalance.value}`)
}

function handleSubmit(newTrade: TradeInfo): void {
  /**
   * Handle submitTrade event from child component.
   * @param newTrade: object containing trade information
   * @return: void
   */

  console.log(`submitTrade event emitted:`)
  // cannot use trade = newTrade for const
  Object.assign(trade.value, newTrade)
  console.log(JSON.stringify(trade.value))
  tradeItem(trade.value)
}

function handleCashChange(changes: CashChange): void {
  /**
   * Handle submitCashChange event from child component.
   * @param changes: object containing cash changes
   * @return: void
   */

  console.log(`submitCashChange event emitted:`)
  updateCash(changes)
  console.log(`pending cash changes: ${JSON.stringify(pendingCashChange.value)}`)
  // initialize pending cash changes and trade:
  initializeObjects()
}

</script>

<template>
  <header>
    <h1>在庫管理システム</h1>
  </header>

  <main>
    <div class="tab-title">
      <h2>{{ currentTab.title }}</h2>
    </div>
    <div class="main-container">
      <div class="tab-column">
        <button v-for="tab in tabConfig" :key="tab.id" @click="activeTabId = tab.id" :class="['tab-button']"
          :style="{ backgroundColor: tab.color }">{{ tab.buttonLabel }}</button>
      </div>
      <div class="main-contents">
        <div class="main-placeholder">
        </div>
        <keep-alive>
          <InventoryTab v-if="currentTab.id === 3" :inventory :currentCash :totalCashValue :currentBalance :activeButton
            @registerTrade="activeTabId = 1, activeButton = 1" />
          <NewTradeTab v-else-if="currentTab.id === 1" :inventory :totalCashValue :currentBalance :trade :activeButton
            @submitTrade="(trade) => { handleSubmit(trade); activeTabId = 2; activeButton = 2; }" />
          <CashTab v-else="currentTab.id === 2" :currentCash :totalCashValue :pendingCashChange :currentBalance
            :activeButton :isCash="trade.isCash ?? false" :amount="trade.isPurchase ? -trade.amount : trade.amount"
            @submitCashChange="(changes) => { handleCashChange(changes), activeTabId = 3, activeButton = 3; }" />
        </keep-alive>
        <!-- ③ -->
      </div>
    </div>
  </main>

  <footer>

  </footer>
</template>

<style scoped>
.tab-title {
  padding: 10px 15px;
  border: 1.5px solid #D96C0E;
  border-bottom: none;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  text-align: center;
  font-weight: bold;
  font-size: 1.1em;
  background-color: #fff;
  color: #333;
}

.main-container {
  display: flex;
  border: 1.5px solid #D96C0E;
  border-top: none;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  overflow: hidden;
  min-height: 350px;
}

.tab-column {
  display: flex;
  flex-direction: column;
  padding: 0 0 25px 25px;
  flex-shrink: 0;
}

.tab-button {
  padding: 2rem 4rem 2rem 1.5rem;
  margin-bottom: 8px;
  letter-spacing: 0.2rem;
  border: none;
  cursor: pointer;
  text-align: center;
  writing-mode: vertical-lr;
  color: white;
  font-weight: 600;
  font-size: 1.5rem;
  border-radius: 25px;
  transition: all 0.2s ease-in-out, border-radius 0.1s ease-in-out, margin-right 0.1s ease-in-out, padding-right 0.1s ease-in-out;
  white-space: pre-line;
  min-width: 80px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 0;
}

.tab-button:hover {
  opacity: 0.7;
}

/* .tab-button:last-child {
  margin-bottom: 0;
} */

.main-contents {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin: 0 -3rem;
  padding: 0;
  position: relative;
  z-index: 1;
  transition: background-color 0.2s ease-in-out;
  border-radius: 0;
}

/* .main-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: black;
  font-size: 1.4rem;
  text-align: center;
  font-weight: bold;
} */
</style>
