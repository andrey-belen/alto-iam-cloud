<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('otp','emailCode') displayInfo=false; section>
    <#if section = "header">
        <h1>Verify Your Identity</h1>
    <#elseif section = "form">
        <div class="otp-form-page">
            <!-- Email Icon -->
            <div class="otp-email-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </div>

            <!-- Description -->
            <p class="otp-description">
                We've sent a <strong>6-digit verification code</strong> to your email address.
                Enter the code below to continue.
            </p>

            <form id="kc-otp-login-form" action="${url.loginAction}" method="post">
                <!-- OTP Input -->
                <div class="otp-input-container">
                    <input id="otp"
                           name="otp"
                           autocomplete="one-time-code"
                           type="text"
                           class="otp-input <#if messagesPerField.existsError('otp','emailCode')>error</#if>"
                           autofocus
                           aria-invalid="<#if messagesPerField.existsError('otp','emailCode')>true</#if>"
                           inputmode="numeric"
                           pattern="[0-9]*"
                           maxlength="6"
                           placeholder="000000"/>
                </div>

                <#if messagesPerField.existsError('otp','emailCode')>
                    <div class="alto-alert alto-alert-error" aria-live="polite">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>${kcSanitize(messagesPerField.getFirstError('otp','emailCode'))?no_esc}</span>
                    </div>
                </#if>

                <!-- Submit Button -->
                <div class="otp-buttons">
                    <input type="submit" value="Verify & Sign In"/>
                </div>
            </form>

            <!-- Resend Link -->
            <div class="otp-resend-link">
                <p>Didn't receive the code?</p>
                <a href="${url.loginAction}?resend=true">Resend verification code</a>
            </div>

            <!-- Timer info -->
            <div class="otp-timer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Code expires in 5 minutes</span>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
