<template>
	<view class="app-container">
		<slot />
	</view>
</template>

<script setup>
// App.vue 只作为全局容器，不处理业务逻辑
console.log('App.vue 已加载')
</script>

<style lang="scss">
/* 全局样式 */
page {
	height: 100%;
	margin: 0;
	padding: 0;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.app-container {
	height: 100vh;
	width: 100vw;
	overflow: hidden;
}

/* 滚动条美化 */
::-webkit-scrollbar {
	width: 6px;
}

::-webkit-scrollbar-track {
	background: transparent;
}

::-webkit-scrollbar-thumb {
	background: #cbd5e1;
	border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
	background: #94a3b8;
}
</style>
