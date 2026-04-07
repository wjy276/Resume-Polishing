/**
 * 简历 PDF 导出工具
 * 使用浏览器原生打印功能导出 PDF
 */

/**
 * 导出简历为 PDF
 * @param {Object} options 导出选项
 * @param {string} options.fileName 文件名
 * @param {string} options.template 模板类型
 */
export function exportResumeToPDF(options = {}) {
	const {
		fileName = '简历',
		template = 'simple'
	} = options

	// 获取简历内容元素
	const resumeContent = document.getElementById('resume-content')

	if (!resumeContent) {
		console.error('未找到简历内容元素')
		uni.showToast({
			title: '导出失败，请重试',
			icon: 'none'
		})
		return
	}

	// 保存原始标题
	const originalTitle = document.title

	// 设置打印标题
	document.title = fileName

	// 添加打印类名到 body
	document.body.classList.add('printing')
	document.body.setAttribute('data-template', template)

	// 调用浏览器打印
	try {
		window.print()

		uni.showToast({
			title: '请在打印对话框中选择"另存为PDF"',
			icon: 'none',
			duration: 3000
		})
	} catch (error) {
		console.error('打印失败：', error)
		uni.showToast({
			title: '导出失败，请重试',
			icon: 'none'
		})
	} finally {
		// 恢复原始状态
		document.title = originalTitle
		document.body.classList.remove('printing')
		document.body.removeAttribute('data-template')
	}
}

/**
 * 预览简历打印效果
 * 在新窗口中打开打印预览
 */
export function previewResumePrint() {
	// 创建新窗口
	const printWindow = window.open('', '_blank')

	if (!printWindow) {
		uni.showToast({
			title: '请允许弹出窗口以预览',
			icon: 'none'
		})
		return
	}

	// 获取简历内容
	const resumeContent = document.getElementById('resume-content')

	if (!resumeContent) {
		printWindow.close()
		uni.showToast({
			title: '预览失败，请重试',
			icon: 'none'
		})
		return
	}

	// 构建预览页面
	const html = `
		<!DOCTYPE html>
		<html lang="zh-CN">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>简历预览</title>
			<style>
				* {
					margin: 0;
					padding: 0;
					box-sizing: border-box;
				}

				body {
					font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
					background: #f5f5f5;
					padding: 20px;
				}

				.resume-container {
					max-width: 800px;
					margin: 0 auto;
					background: #fff;
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
					padding: 40px;
				}

				@page {
					size: A4;
					margin: 1.5cm;
				}

				@media print {
					body {
						background: #fff;
						padding: 0;
					}

					.resume-container {
						box-shadow: none;
						padding: 0;
					}

					* {
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
					}
				}

				/* 复制简历模板的样式 */
				${getResumeStyles()}
			</style>
		</head>
		<body>
			<div class="resume-container">
				${resumeContent.innerHTML}
			</div>
			<script>
				// 页面加载完成后自动打印
				window.onload = function() {
					setTimeout(function() {
						window.print();
					}, 500);
				};
			<\/script>
		</body>
		</html>
	`

	printWindow.document.write(html)
	printWindow.document.close()
}

/**
 * 获取简历样式
 * @returns {string} CSS 样式字符串
 */
function getResumeStyles() {
	// 这里返回简历模板的核心样式
	return `
		/* 基础样式 */
		.simple-template,
		.professional-template,
		.creative-template,
		.classic-template {
			font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
			color: #1e293b;
			line-height: 1.6;
		}

		/* 头部样式 */
		.header-section {
			margin-bottom: 24px;
		}

		.name {
			font-size: 24px;
			font-weight: 700;
			color: #1e293b;
			display: block;
			margin-bottom: 8px;
		}

		.job-title {
			font-size: 14px;
			color: #2563eb;
			font-weight: 500;
			display: block;
			margin-bottom: 12px;
		}

		/* 模块样式 */
		.resume-section {
			margin-bottom: 24px;
			page-break-inside: avoid;
		}

		.section-title {
			font-size: 14px;
			font-weight: 600;
			color: #2563eb;
			padding-bottom: 8px;
			border-bottom: 2px solid #e2e8f0;
			display: block;
			margin-bottom: 12px;
		}

		/* 列表项 */
		.item-block,
		.education-item,
		.experience-item,
		.project-item {
			margin-bottom: 16px;
			page-break-inside: avoid;
		}

		.item-title,
		.school-name,
		.company-name,
		.project-name {
			font-size: 14px;
			font-weight: 600;
			color: #1e293b;
		}

		.item-date,
		.date-range {
			font-size: 12px;
			color: #64748b;
		}

		/* 描述文本 */
		.item-description,
		.achievement-item,
		.highlight-item,
		.list-item {
			font-size: 12px;
			color: #475569;
			line-height: 1.6;
		}
	`
}

/**
 * 检测浏览器是否支持打印
 * @returns {boolean}
 */
export function checkPrintSupport() {
	return typeof window !== 'undefined' && typeof window.print === 'function'
}

/**
 * 获取打印建议
 * @returns {Array<string>}
 */
export function getPrintTips() {
	return [
		'建议使用 Chrome 或 Edge 浏览器以获得最佳打印效果',
		'在打印对话框中选择"另存为 PDF"即可保存',
		'建议关闭"页眉页脚"选项以获得更干净的输出',
		'如果背景色未显示，请在打印设置中启用"背景图形"选项'
	]
}
