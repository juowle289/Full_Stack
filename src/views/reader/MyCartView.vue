<template>
    <div class="cart-page">
        <div class="page-header">
            <div>
                <h1>Giỏ giữ sách của tôi</h1>
                <p>Quản lý các cuốn sách bạn đã thêm vào giỏ và gửi yêu cầu mượn.</p>
            </div>
            <v-btn color="primary" variant="tonal" @click="refreshBooks">
                Làm mới
            </v-btn>
        </div>

        <v-alert v-if="message" :type="success ? 'success' : 'error'" variant="tonal" rounded="lg" class="mb-4">
            {{ message }}
        </v-alert>

        <v-card rounded="lg" class="pa-4 mb-4">
            <div class="cart-summary">
                <div>
                    <div class="summary-label">Số sách trong giỏ</div>
                    <div class="summary-value">{{ cart.items.length }}</div>
                </div>
                <div>
                    <div class="summary-label">Đang chờ xử lý</div>
                    <div class="summary-value">{{ pendingCount }}</div>
                </div>
            </div>
        </v-card>

        <v-card rounded="lg" class="pa-4 mb-4">
            <div v-if="!cart.items.length" class="empty-state">
                <v-icon icon="mdi-cart-off" size="36" color="#707974" />
                <p>Giỏ giữ sách hiện đang trống.</p>
                <v-btn color="primary" variant="tonal" @click="$router.push('/app/browse')">
                    Đi đến khám phá sách
                </v-btn>
            </div>

            <div v-else>
                <div class="cart-item" v-for="book in cart.items" :key="book.id">
                    <div>
                        <div class="cart-item-title">{{ book.title }}</div>
                        <div class="cart-item-meta">{{ book.author }} · ISBN: {{ book.isbn || '—' }}</div>
                    </div>
                    <v-btn icon="mdi-close" size="small" variant="text" color="error" @click="removeBook(book.id)" />
                </div>
            </div>
        </v-card>

        <v-btn block color="primary" :disabled="!cart.items.length || submitting" :loading="submitting"
            @click="submitCart">
            Gửi yêu cầu mượn {{ cart.items.length }} cuốn
        </v-btn>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { borrowApi } from '../../api/borrowApi'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const message = ref('')
const success = ref(true)
const submitting = ref(false)
const pendingCount = ref(0)

async function refreshBooks() {
    message.value = ''
    success.value = true
    try {
        const res = await borrowApi.getMyBorrows()
        const books = Array.isArray(res.data) ? res.data : []
        pendingCount.value = books.filter((item) => item.status === 'Requested').length
    } catch (err) {
        console.error(err.response || err)
    }
}

function removeBook(bookId) {
    cart.remove(bookId)
}

async function submitCart() {
    if (!auth.isLoggedIn) {
        router.push('/login')
        return
    }

    submitting.value = true
    message.value = ''
    success.value = true

    try {
        const myRes = await borrowApi.getMyBorrows()
        const myBorrows = Array.isArray(myRes.data) ? myRes.data : []
        const activeCount = myBorrows.filter((b) => !b.returnDate).length
        const maxAllowed = 3

        if (activeCount + cart.items.length > maxAllowed) {
            throw new Error(`Không thể mượn quá ${maxAllowed} cuốn cùng lúc.`)
        }

        if (activeCount > 0) {
            throw new Error('Bạn phải trả hết sách đang mượn trước khi gửi yêu cầu mới.')
        }

        for (const book of cart.items) {
            await borrowApi.requestBorrow({ bookId: book.id, requestedDays: 14 })
        }

        cart.clear()
        await refreshBooks()

        success.value = true
        message.value = 'Yêu cầu mượn đã được gửi thành công. Vui lòng đợi thủ thư phản hồi.'
    } catch (err) {
        success.value = false
        message.value = err.response?.data?.message || err.message || 'Gửi yêu cầu mượn thất bại.'
        console.error(err.response || err)
    } finally {
        submitting.value = false
    }
}

onMounted(() => {
    if (!auth.isLoggedIn) {
        router.push('/login')
        return
    }
    refreshBooks()
})
</script>

<style scoped>
.cart-page {
    max-width: 980px;
}

.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
}

.cart-summary {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}

.summary-label {
    font-size: 13px;
    color: var(--dl-text-muted);
}

.summary-value {
    font-size: 24px;
    font-weight: 700;
}

.cart-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px;
    border-radius: 16px;
    border: 1px solid var(--dl-surface-variant);
    margin-bottom: 12px;
}

.cart-item-title {
    font-weight: 700;
}

.cart-item-meta {
    font-size: 13px;
    color: var(--dl-text-muted);
    margin-top: 4px;
}

.empty-state {
    display: grid;
    place-items: center;
    gap: 14px;
    padding: 36px 0;
    text-align: center;
}
</style>
