import { defineStore } from 'pinia'
import { createNewResume, generateId } from '@/utils/resume/initialData'

const STORAGE_KEY = 'magic_resume_store'

export const useResumeStore = defineStore('resume', {
	state: () => ({
		resumes: {},
		activeResumeId: null,
	}),

	getters: {
		activeResume: (state) =>
			state.activeResumeId ? state.resumes[state.activeResumeId] : null,
		allResumes: (state) =>
			Object.values(state.resumes).sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			),
	},

	actions: {
		// ───── resume lifecycle ─────
		createResume(overrides = {}) {
			const resume = createNewResume(overrides)
			this.$patch((state) => {
				state.resumes[resume.id] = resume
				state.activeResumeId = resume.id
			})
			this.saveToLocal()
			return resume.id
		},

		addResume(resumeData) {
			const id = resumeData.id || generateId()
			this.$patch((state) => {
				state.resumes[id] = { ...resumeData, id }
			})
			this.saveToLocal()
			return id
		},

		updateResume(id, partial) {
			if (!this.resumes[id]) return
			this.$patch((state) => {
				Object.assign(state.resumes[id], partial, {
					updatedAt: new Date().toISOString(),
				})
			})
			this.saveToLocal()
		},

		deleteResume(id) {
			if (!this.resumes[id]) return
			this.$patch((state) => {
				delete state.resumes[id]
				if (state.activeResumeId === id) {
					const remaining = Object.keys(state.resumes)
					state.activeResumeId = remaining.length ? remaining[0] : null
				}
			})
			this.saveToLocal()
		},

		setActiveResume(id) {
			this.$patch({ activeResumeId: id })
		},

		// ───── active resume mutations ─────
		// All mutations use $patch callback with in-place Object.assign for reliable Vue 3 reactivity
		_patchActive(partial) {
			if (!this.activeResumeId) return
			this.$patch((state) => {
				const resume = state.resumes[state.activeResumeId]
				if (!resume) return
				Object.assign(resume, partial, { updatedAt: new Date().toISOString() })
			})
			this.saveToLocal()
		},

		updateResumeTitle(title) {
			this._patchActive({ title })
		},

		setActiveSection(sectionId) {
			this._patchActive({ activeSection: sectionId })
		},

		setTemplateId(templateId) {
			if (!templateId) return
			this._patchActive({ templateId })
		},

		updateGlobalSettings(partial) {
			if (!this.activeResumeId) return
			this.$patch((state) => {
				const resume = state.resumes[state.activeResumeId]
				if (!resume) return
				if (!resume.globalSettings) resume.globalSettings = {}
				Object.assign(resume.globalSettings, partial)
				resume.updatedAt = new Date().toISOString()
			})
			this.saveToLocal()
		},

		setThemeColor(color) {
			this.updateGlobalSettings({ themeColor: color })
		},

		updateMenuSections(sections) {
			this._patchActive({ menuSections: sections })
		},

		toggleSectionVisibility(sectionId) {
			if (!this.activeResumeId) return
			this.$patch((state) => {
				const resume = state.resumes[state.activeResumeId]
				if (!resume) return
				const sections = (resume.menuSections || []).map((s) =>
					s.id === sectionId ? { ...s, enabled: !s.enabled } : s
				)
				const currentSection = sections.find((section) => section.id === resume.activeSection)
				if (currentSection && currentSection.enabled === false) {
					const enabledSections = sections
						.filter((section) => section.enabled)
						.sort((a, b) => a.order - b.order)
					const fallbackSection =
						enabledSections.find((section) => section.id === 'basic') || enabledSections[0]
					if (fallbackSection) {
						resume.activeSection = fallbackSection.id
					}
				}
				resume.menuSections = sections
				resume.updatedAt = new Date().toISOString()
			})
			this.saveToLocal()
		},

		reorderSections(fromIndex, toIndex) {
			if (!this.activeResumeId) return
			this.$patch((state) => {
				const resume = state.resumes[state.activeResumeId]
				if (!resume) return
				const sections = [...(resume.menuSections || [])]
				const [item] = sections.splice(fromIndex, 1)
				sections.splice(toIndex, 0, item)
				resume.menuSections = sections.map((s, i) => ({ ...s, order: i }))
				resume.updatedAt = new Date().toISOString()
			})
			this.saveToLocal()
		},

		// ───── basic info ─────
		updateBasicInfo(partial) {
			if (!this.activeResumeId) return
			this.$patch((state) => {
				const resume = state.resumes[state.activeResumeId]
				if (!resume) return
				if (!resume.basic) resume.basic = {}
				Object.assign(resume.basic, partial)
				resume.updatedAt = new Date().toISOString()
			})
			this.saveToLocal()
		},

		// ───── education ─────
		addEducation(item) {
			if (!this.activeResumeId) return
			this.$patch((state) => {
				const resume = state.resumes[state.activeResumeId]
				if (!resume) return
				const edu = { id: generateId(), visible: true, ...item }
				resume.education = [...(resume.education || []), edu]
				resume.updatedAt = new Date().toISOString()
			})
			this.saveToLocal()
		},

		updateEducation(id, partial) {
			if (!this.activeResumeId) return
			this.$patch((state) => {
				const resume = state.resumes[state.activeResumeId]
				if (!resume) return
				const edu = (resume.education || []).find((e) => e.id === id)
				if (edu) Object.assign(edu, partial)
				resume.updatedAt = new Date().toISOString()
			})
			this.saveToLocal()
		},

		deleteEducation(id) {
			if (!this.activeResumeId) return
			this.$patch((state) => {
				const resume = state.resumes[state.activeResumeId]
				if (!resume) return
				resume.education = (resume.education || []).filter((e) => e.id !== id)
				resume.updatedAt = new Date().toISOString()
			})
			this.saveToLocal()
		},

		// ───── experience ─────
		addExperience(item) {
			if (!this.activeResumeId) return
			this.$patch((state) => {
				const resume = state.resumes[state.activeResumeId]
				if (!resume) return
				const exp = { id: generateId(), visible: true, ...item }
				resume.experience = [...(resume.experience || []), exp]
				resume.updatedAt = new Date().toISOString()
			})
			this.saveToLocal()
		},

		updateExperience(id, partial) {
			if (!this.activeResumeId) return
			this.$patch((state) => {
				const resume = state.resumes[state.activeResumeId]
				if (!resume) return
				const exp = (resume.experience || []).find((e) => e.id === id)
				if (exp) Object.assign(exp, partial)
				resume.updatedAt = new Date().toISOString()
			})
			this.saveToLocal()
		},

		deleteExperience(id) {
			if (!this.activeResumeId) return
			this.$patch((state) => {
				const resume = state.resumes[state.activeResumeId]
				if (!resume) return
				resume.experience = (resume.experience || []).filter((e) => e.id !== id)
				resume.updatedAt = new Date().toISOString()
			})
			this.saveToLocal()
		},

		// ───── projects ─────
		addProject(item) {
			if (!this.activeResumeId) return
			this.$patch((state) => {
				const resume = state.resumes[state.activeResumeId]
				if (!resume) return
				const proj = { id: generateId(), visible: true, ...item }
				resume.projects = [...(resume.projects || []), proj]
				resume.updatedAt = new Date().toISOString()
			})
			this.saveToLocal()
		},

		updateProject(id, partial) {
			if (!this.activeResumeId) return
			this.$patch((state) => {
				const resume = state.resumes[state.activeResumeId]
				if (!resume) return
				const proj = (resume.projects || []).find((p) => p.id === id)
				if (proj) Object.assign(proj, partial)
				resume.updatedAt = new Date().toISOString()
			})
			this.saveToLocal()
		},

		deleteProject(id) {
			if (!this.activeResumeId) return
			this.$patch((state) => {
				const resume = state.resumes[state.activeResumeId]
				if (!resume) return
				resume.projects = (resume.projects || []).filter((p) => p.id !== id)
				resume.updatedAt = new Date().toISOString()
			})
			this.saveToLocal()
		},

		// ───── content sections ─────
		updateSkillContent(content) {
			this._patchActive({ skillContent: content })
		},

		updateSelfEvaluation(content) {
			this._patchActive({ selfEvaluationContent: content })
		},

		updateCustomSection(sectionId, items) {
			if (!this.activeResumeId || !sectionId) return
			this.$patch((state) => {
				const resume = state.resumes[state.activeResumeId]
				if (!resume) return
				if (!resume.customData) resume.customData = {}
				resume.customData[sectionId] = items
				resume.updatedAt = new Date().toISOString()
			})
			this.saveToLocal()
		},

		// ───── persistence ─────
		saveToLocal() {
			try {
				uni.setStorageSync(STORAGE_KEY, JSON.stringify({
					resumes: this.resumes,
					activeResumeId: this.activeResumeId,
				}))
			} catch (e) {
				console.error('保存简历失败:', e)
			}
		},

		loadFromLocal() {
			try {
				const raw = uni.getStorageSync(STORAGE_KEY)
				if (!raw) return false
				const data = typeof raw === 'string' ? JSON.parse(raw) : raw
				if (data?.resumes) {
					this.$patch((state) => {
						state.resumes = data.resumes
						state.activeResumeId = data.activeResumeId || null
					})
					return true
				}
			} catch (e) {
				console.error('加载简历失败:', e)
			}
			return false
		},
	},
})
