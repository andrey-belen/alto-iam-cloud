<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        <h1>Welcome back</h1>
        <p class="alto-form-subtitle">Sign in to Alto Cloud</p>
    <#elseif section = "form">
        <#if realm.password>
            <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                <#if !usernameHidden??>
                    <div class="form-group">
                        <label for="username">
                            <#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>
                        </label>
                        <input tabindex="1" id="username" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="username"
                               placeholder="Enter your <#if !realm.loginWithEmailAllowed>username<#elseif !realm.registrationEmailAsUsername>username or email<#else>email</#if>"
                               aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>" />
                        <#if messagesPerField.existsError('username','password')>
                            <span id="input-error" aria-live="polite">
                                ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                            </span>
                        </#if>
                    </div>
                </#if>

                <div class="form-group">
                    <label for="password">${msg("password")}</label>
                    <input tabindex="2" id="password" name="password" type="password" autocomplete="current-password"
                           placeholder="Enter your password"
                           aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>" />
                    <#if usernameHidden?? && messagesPerField.existsError('username','password')>
                        <span id="input-error" aria-live="polite">
                            ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                        </span>
                    </#if>
                </div>

                <#if realm.rememberMe || realm.resetPasswordAllowed>
                    <div id="kc-form-options">
                        <#if realm.rememberMe && !usernameHidden??>
                            <div class="checkbox">
                                <label>
                                    <#if login.rememberMe??>
                                        <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" checked> ${msg("rememberMe")}
                                    <#else>
                                        <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox"> ${msg("rememberMe")}
                                    </#if>
                                </label>
                            </div>
                        <#else>
                            <div></div>
                        </#if>
                        <#if realm.resetPasswordAllowed>
                            <a tabindex="5" href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a>
                        </#if>
                    </div>
                </#if>

                <div id="kc-form-buttons">
                    <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                    <input tabindex="4" type="submit" name="login" id="kc-login" value="${msg("doLogIn")}"/>
                </div>
            </form>
        </#if>
    <#elseif section = "info">
        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
            <p>
                ${msg("noAccount")}
                <a tabindex="6" href="${url.registrationUrl}">${msg("doRequestAccess")}</a>
            </p>
        </#if>
    </#if>
</@layout.registrationLayout>
