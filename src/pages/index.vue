<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { $computed, $ref } from 'vue/macros'

import { useQuery } from '@vue/apollo-composable'
import { BOOKS } from '../graphql-operations'

let page = $ref(1)
const activeToken = reactive({
  value: '',
  position: null,
})
let loadingData = $ref(false)

const privateTodosQuery = useQuery(BOOKS)
const items = (computed(() => privateTodosQuery.result.value?.book.pages ?? []))
const leftPage = $computed(() => page * 2 - 2) // page number on left page
const rightPage = $computed(() => page * 2) // page number on right page
const itemsSliced = $computed(() => items.value.slice(leftPage, rightPage))
const lastPage = $computed(() => items.value.length / 2)

function loadBookContents() {
  const parent = document.getElementById('here')

  if (page >= 1) {
    // When you navigate pages, replace current page with a new one
    parent?.replaceChildren()
  }

  itemsSliced.forEach((e) => {
    // assign to new variable 'content' in case object is read only
    let content = e.content
    let tokens = e.tokens.slice()

    // reason for sort
    // words in content will be modified the number of length of tokens array
    // change content from the end of the sentence so that changes are preserved - since slicing happens from position 0 onwards
    tokens = tokens.sort((a, b) => b.position[0] - a.position[0])

    tokens.forEach((k) => {
      content = `${content.slice(0, k.position[0])}<span id=${k.position[0]} class='word'>${content.slice(k.position[0], k.position[1])}</span>${content.slice(k.position[1])}`
    })

    // append and attach click event
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content

    // onclick, get the id of the span and set the activeToken to the span's id
    tempDiv.onclick = function (el) {
      const target = el?.target as HTMLTextAreaElement

      if (!target?.id)
        return
      if (target.id === '-1')
        return // words not in tokens
      const z = e.tokens.find(k => k.position[0].toString() === target.id)
      activeToken.value = z.value
      activeToken.position = z.position
      // alert(`Token: ${z.value}, position: ${z.position}`);

      return false
    }
    // tempDiv.classList.add("pointer-events-none");
    tempDiv.className = ' h-100 overflow-y-auto rounded book__page text-2xl font-bold py-10 text-cyan-500'

    parent?.appendChild(tempDiv)
  })

  loadingData = false
}

function togglePage(pg) {
  if (page >= lastPage && pg === 1)
    return
  if (page <= 1 && pg === -1)
    return

  page = page + pg
  loadBookContents()
}

loadingData = true
// show loading state at created lifecycle

// watch for when data has loaded from server and load book
watch(items, (newVal, prevVal) => {
  // console.log('loaded items')
  setTimeout(() => {
    loadBookContents()
  }, 500)
})
</script>

<template>
  <div class="px-10">
    <span class="text-xs cursor-pointer" @click="loadBookContents">
      loadBookContents {{ items.length }} pages
    </span>
    <div v-if="activeToken.value" class="bg-black/30 fixed inset-0 z-10" @click="activeToken.value = ''">
      <div
        class="token
      "
      >
        <div
          class=" font-bold
          text-5xl
          text-blue-500
          p-10"
        >
          {{ activeToken.value }}
        </div>
        <div class="text-xs">
          {{ activeToken.position }}
        </div>
      </div>
    </div>

    <!-- book -->
    <div v-show="items.length && !loadingData" class="cover">
      <div class="book2">
        <div
          id="here" class="
          grid
          grid-cols-2
          w-full"
        />

        <div
          class="grid
          grid-cols-2"
        >
          <div class="book__page py-4">
            <button v-if="leftPage > 0" class="float-left border rounded px-2 cursor-pointer" @click="togglePage(-1)">
              prev
            </button>

            <span> {{ leftPage + 1 }}</span>
          </div>
          <div class="book__page py-4">
            <span> {{ rightPage }}</span>

            <button
              v-if="items.length > rightPage" class="float-right border rounded px-2 cursor-pointer"
              @click="togglePage(1)"
            >
              next
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="loadingData" text-lg>
      Loading Data...
    </div>
  </div>
</template>
