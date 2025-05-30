<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getInventoryItems, getCashDocument, getTradeLog, addNewItem, addNewTradeInfo, editExistingItem, setCash } from '@/data'; // Import Firestore database
import NewTradeTab from './components/NewTradeTab.vue';
import CashTab from './components/CashTab.vue';
import InventoryTab from './components/InventoryTab.vue';
import TradeHistoryTab from './components/TradeHistoryTab.vue';

import type { Item, Cash, TradeInfo } from '@/types'

// types & interfaces:
// define interface of tabs
interface TabInfo {
  id: number;
  title: string;
  buttonLabel: string;
  color: string;
}

// type of changing data received from tab 2.
type CashChange = Partial<Cash>


// tab related
// tab group
const tabConfig: TabInfo[] = [
  {
    id: 1,
    buttonLabel: "新規登録",
    title: "売買の新規登録",
    color: "#F36E2A",
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
  {
    id: 4,
    buttonLabel: "売買履歴",
    title: "履歴",
    // color: "#F6DDE1"
    color: "#542700",
  }
]
// default on tab 3
const activeTabId = ref<number>(3)
// default button 3 is active
const activeButton = ref<number>(3)
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
// TODO: 4th tab of trade history

// revenue related:
// stores remaining cash data
const currentCash = ref<Cash | null>(null);


// stores default trade data and freeze
const DEFAULT_TRADE_INFO: Readonly<TradeInfo> = Object.freeze({
  id: "0",
  quantity: 0,
  amount: 0,
  isPurchase: null,
  isCash: null,
})
// initialize new trade data
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
  if (currentCash.value) {
    Object.keys(currentCash.value).forEach((key) => {
      // convert string key to number key for type security
      const numKey = Number(key) as keyof Cash;
      amount += numKey * currentCash.value![numKey];
    })
  }
  return amount
})



// stock related:
// define inventory group: array of item
const inventory = ref<Item[]>([])
// define tradelog group: array of trade info
const tradeLog = ref<TradeInfo[]>([])

// stores remaining deposit data
// const currentBalance = ref(0);
const currentBalance = computed(() => {
  let sum = 0
  for (const trade of tradeLog.value) {
    if (trade.isCash === false) {
      sum += trade.isPurchase ? -trade.amount : +trade.amount;
    }
  }
  return sum;
})



// initialize with default values
onMounted(async () => {
  inventory.value = await getInventoryItems();
  currentCash.value = await getCashDocument();
  tradeLog.value = await getTradeLog();
  initializeObjects()
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

function tradeItem(trade: TradeInfo): void {
  /**
   * Manage changes to existing items.
   * @param trade: object containing trade information, emitted from child
   * @return: void
   */
  if (trade.id !== "-1") {
    // for existing items
    const target = inventory.value.find((item) => item.id === trade.id)
    if (target) {
      console.log(`target item: ${JSON.stringify(target)}`)
      // calculate stock and revenue changes
      const modifier = trade.isPurchase ? 1 : -1
      target.stock += trade.quantity * modifier
      console.log(`Item changed: ${target.name}, quantity: ${trade.quantity}`)
      editExistingItem(target.id, { name: target.name, stock: target.stock })
      if (trade.isCash) {
        // call calcCash to modify cash
        calcCash(-trade.amount * modifier)
      }
    }
    else {
      console.log(`Failed to change item ${trade.id}`)
    }
  }
  else {
    // for new items, isPurchase is always true
    if (trade.isPurchase && trade.newName) {
      const newId = addNewItem({ name: trade.newName, stock: trade.quantity, }
      )
      // modify cash/balance
      if (trade.isCash) {
        calcCash(-trade.amount)
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
    if (currentCash.value) {
      currentCash.value[numKey] += changes[numKey] ?? 0;
      setCash(currentCash.value)
      console.log(`current ${numKey} cash count: ${currentCash.value[numKey]}`)
    }
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
  if (currentCash.value) {
    const denomination = Object.keys(currentCash.value).map(Number)
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
        pendingCashChange.value[key as keyof Cash] = -Math.min(
          Math.floor(-amount / key),
          currentCash.value ? currentCash.value[key as keyof Cash] : 0
        )
        amount -= pendingCashChange.value[key as keyof Cash] * key
      }
    }
    console.log(`pending cash changes: ${JSON.stringify(pendingCashChange.value)}`)
  }
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

async function handleCashChange(changes: CashChange): Promise<void> {
  /**
   * Handle submitCashChange event from child component.
   * @param changes: object containing cash changes
   * @return: void
   */

  console.log(`submitCashChange event emitted:`)
  updateCash(changes)
  console.log(`pending cash changes: ${JSON.stringify(pendingCashChange.value)}`)
  // initialize pending cash changes and trade:
  console.log(`new trade to be update: ${JSON.stringify(trade.value)}`)
  addNewTradeInfo(trade.value)
  initializeObjects()
  inventory.value = await getInventoryItems();
  currentCash.value = await getCashDocument();
  tradeLog.value = await getTradeLog();
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
          <InventoryTab v-if="currentTab.id === 3" :inventory="inventory" :currentCash :totalCashValue="totalCashValue"
            :currentBalance="currentBalance" :activeButton="activeButton"
            @registerTrade="activeTabId = 1, activeButton = 1" />
          <NewTradeTab v-else-if="currentTab.id === 1" :inventory :totalCashValue :currentBalance :trade :activeButton
            @submitTrade="(trade) => { handleSubmit(trade); activeTabId = 2; activeButton = 2; }" />
          <CashTab v-else-if="currentTab.id === 2" :currentCash :totalCashValue :pendingCashChange :currentBalance
            :activeButton :isCash="trade.isCash ?? false" :amount="trade.isPurchase ? -trade.amount : trade.amount"
            @submitCashChange="(changes) => { handleCashChange(changes), activeTabId = 3, activeButton = 3; }" />
          <TradeHistoryTab v-else-if="currentTab.id === 4" :inventory :tradeLog />
        </keep-alive>

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
  padding: 0 0 0 25px;
  flex-shrink: 0;
}

.tab-button {
  padding: 2.385rem 4rem 2.385rem 1.5rem;
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

.tab-button:last-child{
  margin-bottom:0;
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
