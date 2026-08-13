<template>
	<view class="phase-progress">
		<text class="phase-progress-label">阶段进度</text>
		<view class="phase-steps">
			<template v-for="(phase, index) in PHASE_LIST" :key="phase">
				<view class="phase-step">
					<view
						class="phase-dot"
						:class="{
							active: phase === current,
							completed: index < currentOrder,
						}"
					></view>
					<text
						class="phase-name"
						:class="{
							active: phase === current,
							completed: index < currentOrder,
						}"
					>
						{{ PHASE_MAP[phase].name }}
					</text>
				</view>
				<view
					v-if="index < PHASE_LIST.length - 1"
					class="phase-line"
					:class="{ completed: index < currentOrder }"
				></view>
			</template>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	phase: {
		type: String,
		default: 'technical',
	},
})

const PHASE_MAP = {
	technical: { name: '技术面试', order: 0 },
	behavioral: { name: '综合面试', order: 1 },
	closing: { name: '收尾环节', order: 2 },
}

const PHASE_LIST = ['technical', 'behavioral', 'closing']

const current = computed(() => props.phase)
const currentOrder = computed(() => PHASE_MAP[props.phase]?.order || 0)
</script>

<style scoped lang="scss">
.phase-progress {
	background: #ffffff;
	border-bottom: 1px solid #e5e7eb;
	padding: 12px 28px;
	display: flex;
	align-items: center;
	gap: 16px;
	flex-shrink: 0;
}

.phase-progress-label {
	font-size: 12px;
	color: #6b7280;
	font-weight: 500;
	white-space: nowrap;
}

.phase-steps {
	display: flex;
	align-items: center;
	gap: 8px;
	flex: 1;
}

.phase-step {
	display: flex;
	align-items: center;
	gap: 8px;
}

.phase-dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: #d1d5db;
	transition: all 0.3s;

	&.active {
		background: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
	}

	&.completed {
		background: #10b981;
	}
}

.phase-name {
	font-size: 12px;
	color: #9ca3af;
	transition: all 0.3s;

	&.active {
		color: #3b82f6;
		font-weight: 500;
	}

	&.completed {
		color: #10b981;
	}
}

.phase-line {
	width: 40px;
	height: 2px;
	background: #e5e7eb;
	transition: all 0.3s;

	&.completed {
		background: #10b981;
	}
}

@media (max-width: 768px) {
	.phase-progress {
		padding: 10px 16px;
		overflow-x: auto;
	}

	.phase-line {
		width: 20px;
	}
}
</style>
