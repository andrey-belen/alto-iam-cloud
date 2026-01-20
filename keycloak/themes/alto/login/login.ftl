<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        <div class="alto-logo">
            <div class="alto-logo-icon">A</div>
        </div>
        <h1 class="alto-title">Alto</h1>
        <p class="alto-subtitle">Property Access Management</p>
    <#elseif section = "form">
        <div class="alto-form-container">
            <#if realm.password>
                <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                    <div class="alto-form-group">
                        <label for="username" class="alto-label">
                            <svg class="alto-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            Email
                        </label>
                        <input tabindex="1" id="username" class="alto-input <#if messagesPerField.existsError('username','password')>alto-input-error</#if>" name="username" value="${(login.username!'')}" type="email" autofocus autocomplete="email" placeholder="Enter your email" aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"/>
                        <#if messagesPerField.existsError('username','password')>
                            <span class="alto-error-message" aria-live="polite">
                                ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                            </span>
                        </#if>
                    </div>

                    <div class="alto-form-group">
                        <label for="password" class="alto-label">
                            <svg class="alto-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            Password
                        </label>
                        <div class="alto-password-wrapper">
                            <input tabindex="2" id="password" class="alto-input <#if messagesPerField.existsError('username','password')>alto-input-error</#if>" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"/>
                            <button type="button" class="alto-password-toggle" onclick="togglePassword()" tabindex="3">
                                <svg id="eye-open" class="alto-eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                <svg id="eye-closed" class="alto-eye-icon" style="display:none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                    <line x1="1" y1="1" x2="23" y2="23"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="alto-form-options">
                        <#if realm.rememberMe && !usernameHidden??>
                            <div class="alto-remember-me">
                                <input tabindex="4" id="rememberMe" name="rememberMe" type="checkbox" <#if login.rememberMe??>checked</#if>>
                                <label for="rememberMe">Remember me</label>
                            </div>
                        </#if>
                        <#if realm.resetPasswordAllowed>
                            <a tabindex="5" href="${url.loginResetCredentialsUrl}" class="alto-forgot-link">Forgot password?</a>
                        </#if>
                    </div>

                    <div class="alto-form-actions">
                        <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                        <button tabindex="6" class="alto-submit-btn" name="login" id="kc-login" type="submit">
                            <span class="alto-btn-text">Sign In</span>
                            <svg class="alto-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                                <polyline points="12 5 19 12 12 19"/>
                            </svg>
                        </button>
                    </div>
                </form>
            </#if>
        </div>
    <#elseif section = "info">
        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
            <div class="alto-register-link">
                <span>Need access?</span>
                <a tabindex="7" href="${properties.requestAccessUrl!'/request-access'}">Request Access</a>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>

<script>
function togglePassword() {
    var passwordInput = document.getElementById('password');
    var eyeOpen = document.getElementById('eye-open');
    var eyeClosed = document.getElementById('eye-closed');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
    } else {
        passwordInput.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
    }
}
</script>
