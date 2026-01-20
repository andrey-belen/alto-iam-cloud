<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html class="${properties.kcHtmlClass!}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="robots" content="noindex, nofollow">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <#if properties.meta?has_content>
        <#list properties.meta?split(' ') as meta>
            <meta name="${meta?split('==')[0]}" content="${meta?split('==')[1]}"/>
        </#list>
    </#if>
    <title>${msg("loginTitle",(realm.displayName!''))}</title>
    <link rel="icon" href="${url.resourcesPath}/img/favicon.ico" />
    <#if properties.stylesCommon?has_content>
        <#list properties.stylesCommon?split(' ') as style>
            <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
</head>

<body class="${properties.kcBodyClass!}">
    <div class="alto-login-container">
        <!-- Left Panel - Branding -->
        <div class="alto-brand-panel">
            <!-- Animated gradient orbs -->
            <div class="alto-gradient-orbs">
                <div class="alto-orb alto-orb-1"></div>
                <div class="alto-orb alto-orb-2"></div>
                <div class="alto-orb alto-orb-3"></div>
            </div>

            <!-- Grid pattern -->
            <div class="alto-grid-pattern"></div>

            <!-- Content -->
            <div class="alto-brand-content">
                <!-- Logo -->
                <div class="alto-brand-header">
                    <div class="alto-logo-box">
                        <img src="${url.resourcesPath}/img/alto_logo.svg" alt="Alto" class="alto-logo" />
                    </div>
                    <span class="alto-brand-label">Alto Energy</span>
                </div>

                <!-- Title -->
                <h1 class="alto-brand-title">
                    Alto Cloud
                    <span class="alto-brand-title-gradient">IAM</span>
                </h1>

                <p class="alto-brand-description">
                    Secure identity and access management for multi-property operations with MFA protection.
                </p>

                <!-- Feature Cards -->
                <div class="alto-features">
                    <div class="alto-feature-card">
                        <div class="alto-feature-icon alto-feature-icon-cyan">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3>Secure Access</h3>
                        <p>MFA-protected login</p>
                    </div>

                    <div class="alto-feature-card">
                        <div class="alto-feature-icon alto-feature-icon-teal">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3>User Management</h3>
                        <p>Multi-property control</p>
                    </div>

                    <div class="alto-feature-card">
                        <div class="alto-feature-icon alto-feature-icon-cyan">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3>Property Access</h3>
                        <p>Centralized dashboard</p>
                    </div>
                </div>

                <!-- Footer -->
                <div class="alto-brand-footer">
                    <p>&copy; ${.now?string('yyyy')} Alto Energy. All rights reserved.</p>
                </div>
            </div>
        </div>

        <!-- Right Panel - Form -->
        <div class="alto-form-panel">
            <div class="alto-form-container">
                <!-- Mobile Logo -->
                <div class="alto-mobile-logo">
                    <div class="alto-mobile-logo-box">
                        <img src="${url.resourcesPath}/img/alto_logo.svg" alt="Alto" />
                    </div>
                    <span>Alto Cloud</span>
                </div>

                <!-- Form Card -->
                <div class="alto-form-card">
                    <#if !(auth?has_content && auth.showUsername() && !auth.showResetCredentials())>
                        <#if displayRequiredFields>
                            <div class="alto-required-fields">
                                <span class="alto-required-label">* ${msg("requiredFields")}</span>
                            </div>
                        </#if>

                        <div class="alto-form-header">
                            <#nested "header">
                        </div>
                    <#else>
                        <div class="alto-form-header alto-form-header-linked">
                            <#nested "header">
                        </div>

                        <div class="alto-logged-in-as">
                            <div class="alto-avatar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div class="alto-user-info">
                                <span class="alto-user-name">${auth.attemptedUsername}</span>
                                <a href="${url.loginRestartFlowUrl}" class="alto-change-user">Not you?</a>
                            </div>
                        </div>
                    </#if>

                    <#-- Display message if exists -->
                    <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                        <div class="alto-alert alto-alert-${message.type}">
                            <#if message.type = 'success'>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            <#elseif message.type = 'warning'>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            <#elseif message.type = 'error'>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            <#else>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </#if>
                            <span>${kcSanitize(message.summary)?no_esc}</span>
                        </div>
                    </#if>

                    <#-- Main form content -->
                    <#nested "form">

                    <#-- Info section (registration link, etc.) -->
                    <#if displayInfo>
                        <div class="alto-form-info">
                            <#nested "info">
                        </div>
                    </#if>

                    <#-- Social providers - hidden, not used -->
                    <#-- Removed: "or sign in with" section -->
                </div>

                <!-- Mobile Footer -->
                <p class="alto-mobile-footer">
                    &copy; ${.now?string('yyyy')} Alto Energy. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
</#macro>
