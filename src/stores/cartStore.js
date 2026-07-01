import { defineStore } from "pinia";

const STORAGE_KEY = "readerCartItems";

function loadCartItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCartItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: loadCartItems(),
  }),
  getters: {
    count: (state) => state.items.length,
    hasBook: (state) => (id) => state.items.some((book) => book.id === id),
    isEmpty: (state) => state.items.length === 0,
  },
  actions: {
    add(book) {
      if (!book || this.hasBook(book.id)) return;
      this.items.push({
        id: book.id,
        title: book.title || "Không tên",
        author: book.author || "Không rõ",
        coverUrl: book.coverUrl || "",
        availableCopies: book.availableCopies,
        isbn: book.isbn,
        category: book.category,
        publisher: book.publisher,
        publishingYear: book.publishingYear,
      });
      saveCartItems(this.items);
    },
    remove(bookId) {
      this.items = this.items.filter((book) => book.id !== bookId);
      saveCartItems(this.items);
    },
    clear() {
      this.items = [];
      saveCartItems(this.items);
    },
    setItems(items) {
      this.items = Array.isArray(items) ? items : [];
      saveCartItems(this.items);
    },
  },
});
