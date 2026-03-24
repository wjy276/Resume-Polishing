<template>
    <Sidebar @page-change="handlePageChange">
        <view class="page-content">
            <view class="header">
                <text class="title">登录</text>
                <text class="subtitle">欢迎使用 AI 求职助手</text>
            </view>

            <!-- 登录表单 -->
            <view class="login-form">
                <view class="form-item">
                    <text class="form-label">手机号</text>
                    <input 
                        type="text" 
                        class="form-input" 
                        placeholder="请输入手机号"
                        v-model="phoneNumber"
                    />
                </view>

                <view class="form-item">
                    <text class="form-label">验证码</text>
                    <view class="code-input-wrapper">
                        <input 
                            type="text" 
                            class="form-input code-input" 
                            placeholder="请输入验证码"
                            v-model="verifyCode"
                        />
                        <button class="send-code-btn" :disabled="countdown > 0">
                            {{ countdown > 0 ? `${countdown}s后重发` : '获取验证码' }}
                        </button>
                    </view>
                </view>

                <button class="login-btn" @click="handleLogin">
                    <text class="btn-text">登录</text>
                </button>

                <view class="agreement">
                    <checkbox-group @change="handleAgreeChange">
                        <label class="agree-label">
                            <checkbox value="agree" :checked="agreed" />
                            <text class="agree-text">我已阅读并同意</text>
                            <text class="agree-link">《用户协议》</text>
                            <text class="agree-text">和</text>
                            <text class="agree-link">《隐私政策》</text>
                        </label>
                    </checkbox-group>
                </view>
            </view>

            <!-- 其他登录方式 -->
            <view class="other-login">
                <view class="divider">
                    <view class="divider-line"></view>
                    <text class="divider-text">其他登录方式</text>
                    <view class="divider-line"></view>
                </view>

                <view class="social-login">
                    <view class="social-icon">
                        <text class="icon">💬</text>
                        <text class="icon-label">微信</text>
                    </view>
                    <view class="social-icon">
                        <text class="icon">📱</text>
                        <text class="icon-label">QQ</text>
                    </view>
                    <view class="social-icon">
                        <text class="icon">✉️</text>
                        <text class="icon-label">邮箱</text>
                    </view>
                </view>
            </view>
        </view>
    </Sidebar>
</template>

<script>
import Sidebar from '@/components/Sidebar/Sidebar.vue'

export default {
    name: 'My',
    components: {
        Sidebar
    },
    data() {
        return {
            phoneNumber: '',
            verifyCode: '',
            countdown: 0,
            agreed: false
        }
    },
    methods: {
        handlePageChange(page) {
            console.log('页面切换到:', page)
        },
        handleLogin() {
            if (!this.phoneNumber) {
                uni.showToast({
                    title: '请输入手机号',
                    icon: 'none'
                })
                return
            }
            if (!this.verifyCode) {
                uni.showToast({
                    title: '请输入验证码',
                    icon: 'none'
                })
                return
            }
            if (!this.agreed) {
                uni.showToast({
                    title: '请先同意用户协议',
                    icon: 'none'
                })
                return
            }
            // 登录逻辑
            console.log('登录信息:', this.phoneNumber, this.verifyCode)
            uni.showToast({
                title: '登录成功',
                icon: 'success'
            })
        },
        sendCode() {
            if (this.countdown > 0) return
            if (!this.phoneNumber) {
                uni.showToast({
                    title: '请输入手机号',
                    icon: 'none'
                })
                return
            }
            // 发送验证码逻辑
            this.countdown = 60
            const timer = setInterval(() => {
                this.countdown--
                if (this.countdown <= 0) {
                    clearInterval(timer)
                }
            }, 1000)
        },
        handleAgreeChange(e) {
            this.agreed = e.detail.value.length > 0
        }
    }
}
</script>

<style lang="scss" scoped>
.page-content {
    padding: 32px;
    background-color: #f9fafb;
    min-height: 100vh;
}

.header {
    margin-bottom: 40px;
    text-align: center;
    
    .title {
        font-size: 32px;
        font-weight: 700;
        color: #111827;
        display: block;
        margin-bottom: 8px;
    }
    
    .subtitle {
        font-size: 16px;
        color: #6b7280;
        display: block;
    }
}

.login-form {
    background: #ffffff;
    padding: 32px;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
}

.form-item {
    margin-bottom: 24px;
    
    .form-label {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        display: block;
        margin-bottom: 8px;
    }
    
    .form-input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 16px;
        transition: all 0.3s;
        
        &:focus {
            border-color: #3b82f6;
            outline: none;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
    }
    
    .code-input-wrapper {
        display: flex;
        gap: 12px;
        
        .code-input {
            flex: 1;
        }
        
        .send-code-btn {
            background: #3b82f6;
            color: #ffffff;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.3s;
            
            &:hover:not(:disabled) {
                background: #2563eb;
            }
            
            &:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }
        }
    }
}

.login-btn {
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    color: #ffffff;
    border: none;
    padding: 16px;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 600;
    width: 100%;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    margin-top: 32px;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }
    
    .btn-text {
        display: block;
    }
}

.agreement {
    margin-top: 20px;
    
    .agree-label {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        cursor: pointer;
    }
    
    .agree-text {
        font-size: 14px;
        color: #6b7280;
    }
    
    .agree-link {
        font-size: 14px;
        color: #3b82f6;
        text-decoration: underline;
        cursor: pointer;
    }
}

.other-login {
    background: #ffffff;
    padding: 32px;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    
    .divider-line {
        flex: 1;
        height: 1px;
        background: #e5e7eb;
    }
    
    .divider-text {
        padding: 0 16px;
        font-size: 14px;
        color: #9ca3af;
    }
}

.social-login {
    display: flex;
    justify-content: center;
    gap: 32px;
    
    .social-icon {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
            transform: translateY(-4px);
        }
        
        .icon {
            font-size: 40px;
        }
        
        .icon-label {
            font-size: 14px;
            color: #6b7280;
        }
    }
}
</style>
