<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm','company','position','phone'); section>
    <#if section = "header">
        ${msg("registerTitle")}
    <#elseif section = "form">
        <form id="kc-register-form" class="${properties.kcFormClass!}" action="${url.registrationAction}" method="post">

            <#-- First Name -->
            <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="firstName" class="${properties.kcLabelClass!}">${msg("firstName")} *</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <input type="text" id="firstName" class="${properties.kcInputClass!}" name="firstName"
                           value="${(register.formData.firstName!'')}"
                           aria-invalid="<#if messagesPerField.existsError('firstName')>true</#if>"
                           autofocus required />
                    <#if messagesPerField.existsError('firstName')>
                        <span class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('firstName'))?no_esc}
                        </span>
                    </#if>
                </div>
            </div>

            <#-- Last Name -->
            <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="lastName" class="${properties.kcLabelClass!}">${msg("lastName")} *</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <input type="text" id="lastName" class="${properties.kcInputClass!}" name="lastName"
                           value="${(register.formData.lastName!'')}"
                           aria-invalid="<#if messagesPerField.existsError('lastName')>true</#if>"
                           required />
                    <#if messagesPerField.existsError('lastName')>
                        <span class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('lastName'))?no_esc}
                        </span>
                    </#if>
                </div>
            </div>

            <#-- Email -->
            <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="email" class="${properties.kcLabelClass!}">${msg("email")} *</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <input type="email" id="email" class="${properties.kcInputClass!}" name="email"
                           value="${(register.formData.email!'')}"
                           aria-invalid="<#if messagesPerField.existsError('email')>true</#if>"
                           autocomplete="email" required />
                    <#if messagesPerField.existsError('email')>
                        <span class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('email'))?no_esc}
                        </span>
                    </#if>
                </div>
            </div>

            <#-- Company -->
            <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="user.attributes.company" class="${properties.kcLabelClass!}">${msg("company")} *</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <input type="text" id="user.attributes.company" class="${properties.kcInputClass!}"
                           name="user.attributes.company"
                           value="${(register.formData['user.attributes.company']!'')}"
                           aria-invalid="<#if messagesPerField.existsError('user.attributes.company')>true</#if>"
                           required />
                    <#if messagesPerField.existsError('user.attributes.company')>
                        <span class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('user.attributes.company'))?no_esc}
                        </span>
                    </#if>
                </div>
            </div>

            <#-- Position -->
            <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="user.attributes.position" class="${properties.kcLabelClass!}">${msg("position")} *</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <input type="text" id="user.attributes.position" class="${properties.kcInputClass!}"
                           name="user.attributes.position"
                           value="${(register.formData['user.attributes.position']!'')}"
                           aria-invalid="<#if messagesPerField.existsError('user.attributes.position')>true</#if>"
                           required />
                    <#if messagesPerField.existsError('user.attributes.position')>
                        <span class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('user.attributes.position'))?no_esc}
                        </span>
                    </#if>
                </div>
            </div>

            <#-- Phone -->
            <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="user.attributes.phone" class="${properties.kcLabelClass!}">${msg("phone")} *</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <input type="tel" id="user.attributes.phone" class="${properties.kcInputClass!}"
                           name="user.attributes.phone"
                           value="${(register.formData['user.attributes.phone']!'')}"
                           aria-invalid="<#if messagesPerField.existsError('user.attributes.phone')>true</#if>"
                           placeholder="+66 XX XXX XXXX"
                           required />
                    <#if messagesPerField.existsError('user.attributes.phone')>
                        <span class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('user.attributes.phone'))?no_esc}
                        </span>
                    </#if>
                </div>
            </div>

            <#if !realm.registrationEmailAsUsername>
                <#-- Username (hidden if email is username) -->
                <div class="${properties.kcFormGroupClass!}">
                    <div class="${properties.kcLabelWrapperClass!}">
                        <label for="username" class="${properties.kcLabelClass!}">${msg("username")} *</label>
                    </div>
                    <div class="${properties.kcInputWrapperClass!}">
                        <input type="text" id="username" class="${properties.kcInputClass!}" name="username"
                               value="${(register.formData.username!'')}"
                               aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                               autocomplete="username" required />
                        <#if messagesPerField.existsError('username')>
                            <span class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                                ${kcSanitize(messagesPerField.get('username'))?no_esc}
                            </span>
                        </#if>
                    </div>
                </div>
            </#if>

            <#-- Password -->
            <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="password" class="${properties.kcLabelClass!}">${msg("password")} *</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <input type="password" id="password" class="${properties.kcInputClass!}" name="password"
                           aria-invalid="<#if messagesPerField.existsError('password','password-confirm')>true</#if>"
                           autocomplete="new-password" required />
                    <#if messagesPerField.existsError('password')>
                        <span class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('password'))?no_esc}
                        </span>
                    </#if>
                </div>
            </div>

            <#-- Confirm Password -->
            <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="password-confirm" class="${properties.kcLabelClass!}">${msg("passwordConfirm")} *</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <input type="password" id="password-confirm" class="${properties.kcInputClass!}" name="password-confirm"
                           aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>"
                           autocomplete="new-password" required />
                    <#if messagesPerField.existsError('password-confirm')>
                        <span class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                        </span>
                    </#if>
                </div>
            </div>

            <#if recaptchaRequired??>
                <div class="form-group">
                    <div class="${properties.kcInputWrapperClass!}">
                        <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div>
                    </div>
                </div>
            </#if>

            <div class="${properties.kcFormGroupClass!}">
                <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                    <input class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}"
                           type="submit" value="${msg("doRegister")}"/>
                </div>
                <div id="kc-form-options" class="${properties.kcFormOptionsClass!}">
                    <div class="${properties.kcFormOptionsWrapperClass!}">
                        <span><a href="${url.loginUrl}">${kcSanitize(msg("backToLogin"))?no_esc}</a></span>
                    </div>
                </div>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>
