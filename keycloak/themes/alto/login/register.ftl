<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        ${msg("registerTitle")}
    <#elseif section = "form">
        <#-- Success message (hidden by default) -->
        <div id="success-message" class="alto-alert alto-alert-success" style="display: none;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div>
                <strong>${msg("registrationPendingTitle")}</strong><br>
                ${msg("registrationPendingMessage")}
            </div>
        </div>

        <#-- Error message (hidden by default) -->
        <div id="error-message" class="alto-alert alto-alert-error" style="display: none;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span id="error-text">An error occurred. Please try again.</span>
        </div>

        <form id="kc-register-form" class="${properties.kcFormClass!}">
            <#-- Name fields in a row -->
            <div class="alto-name-row">
                <div class="alto-name-field">
                    <label for="firstName" class="${properties.kcLabelClass!}">${msg("firstName")} *</label>
                    <input type="text" id="firstName" class="${properties.kcInputClass!}" name="firstName"
                           placeholder="John"
                           autofocus required />
                    <span id="firstName-error" class="kc-feedback-text" style="display: none;"></span>
                </div>

                <div class="alto-name-field">
                    <label for="lastName" class="${properties.kcLabelClass!}">${msg("lastName")} *</label>
                    <input type="text" id="lastName" class="${properties.kcInputClass!}" name="lastName"
                           placeholder="Smith"
                           required />
                    <span id="lastName-error" class="kc-feedback-text" style="display: none;"></span>
                </div>
            </div>

            <#-- Email -->
            <div class="${properties.kcFormGroupClass!}">
                <label for="email" class="${properties.kcLabelClass!}">${msg("email")} *</label>
                <input type="email" id="email" class="${properties.kcInputClass!}" name="email"
                       placeholder="john.smith@company.com"
                       autocomplete="email" required />
                <span id="email-error" class="kc-feedback-text" style="display: none;"></span>
            </div>

            <#-- Company -->
            <div class="${properties.kcFormGroupClass!}">
                <label for="company" class="${properties.kcLabelClass!}">${msg("company")} *</label>
                <input type="text" id="company" class="${properties.kcInputClass!}" name="company"
                       placeholder="Acme Corporation"
                       required />
                <span id="company-error" class="kc-feedback-text" style="display: none;"></span>
            </div>

            <#-- Phone -->
            <div class="${properties.kcFormGroupClass!}">
                <label for="phone" class="${properties.kcLabelClass!}">Phone *</label>
                <input type="tel" id="phone" class="${properties.kcInputClass!}" name="phone"
                       placeholder="+1 (555) 123-4567"
                       required />
                <span id="phone-error" class="kc-feedback-text" style="display: none;"></span>
            </div>

            <#-- Role Preference -->
            <div class="${properties.kcFormGroupClass!}">
                <label for="rolePreference" class="${properties.kcLabelClass!}">Requested Role *</label>
                <select id="rolePreference" class="${properties.kcInputClass!}" name="rolePreference" required>
                    <option value="operator">Operator - Can control equipment and manage schedules</option>
                    <option value="viewer">Viewer - Read-only access to dashboards</option>
                </select>
                <span id="rolePreference-error" class="kc-feedback-text" style="display: none;"></span>
            </div>

            <div id="kc-form-buttons" class="alto-form-buttons">
                <button type="submit" id="submit-btn" class="alto-btn-primary">
                    <span id="submit-text">${msg("doRegister")}</span>
                    <span id="submit-spinner" style="display: none;">
                        <svg class="animate-spin" style="width: 1.25rem; height: 1.25rem; animation: spin 1s linear infinite;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </span>
                </button>
            </div>

            <div class="alto-form-footer">
                <span>${msg("backToLogin")} </span>
                <a href="${url.loginUrl}">${msg("doLogIn")}</a>
            </div>
        </form>

        <style>
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            #submit-spinner svg {
                animation: spin 1s linear infinite;
            }
        </style>

        <script>
            (function() {
                const form = document.getElementById('kc-register-form');
                const submitBtn = document.getElementById('submit-btn');
                const submitText = document.getElementById('submit-text');
                const submitSpinner = document.getElementById('submit-spinner');
                const successMessage = document.getElementById('success-message');
                const errorMessage = document.getElementById('error-message');
                const errorText = document.getElementById('error-text');

                // API URL - in production this would be the same domain, in dev it's a different port
                // Check if we're on Keycloak domain (port 8080) and redirect to API (port 3001)
                const currentHost = window.location.hostname;
                const currentPort = window.location.port;
                let API_URL;
                if (currentPort === '8080') {
                    // Development: Keycloak on 8080, API on 3001
                    API_URL = 'http://' + currentHost + ':3001/api/access-requests';
                } else {
                    // Production: same domain, proxied through Caddy
                    API_URL = '/api/access-requests';
                }

                function showError(message) {
                    errorText.textContent = message;
                    errorMessage.style.display = 'flex';
                    successMessage.style.display = 'none';
                }

                function showSuccess() {
                    successMessage.style.display = 'flex';
                    errorMessage.style.display = 'none';
                    form.style.display = 'none';
                }

                function showFieldError(fieldId, message) {
                    const field = document.getElementById(fieldId);
                    const errorSpan = document.getElementById(fieldId + '-error');
                    if (field && errorSpan) {
                        field.setAttribute('aria-invalid', 'true');
                        errorSpan.textContent = message;
                        errorSpan.style.display = 'block';
                    }
                }

                function clearFieldErrors() {
                    const fields = ['firstName', 'lastName', 'email', 'company', 'phone', 'rolePreference'];
                    fields.forEach(function(fieldId) {
                        const field = document.getElementById(fieldId);
                        const errorSpan = document.getElementById(fieldId + '-error');
                        if (field) {
                            field.setAttribute('aria-invalid', 'false');
                        }
                        if (errorSpan) {
                            errorSpan.style.display = 'none';
                        }
                    });
                    errorMessage.style.display = 'none';
                }

                function setLoading(loading) {
                    submitBtn.disabled = loading;
                    submitText.style.display = loading ? 'none' : 'inline';
                    submitSpinner.style.display = loading ? 'inline' : 'none';
                }

                function validateForm(data) {
                    let isValid = true;
                    clearFieldErrors();

                    if (!data.firstName || data.firstName.trim().length < 1) {
                        showFieldError('firstName', 'First name is required');
                        isValid = false;
                    }

                    if (!data.lastName || data.lastName.trim().length < 1) {
                        showFieldError('lastName', 'Last name is required');
                        isValid = false;
                    }

                    if (!data.email || !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                        showFieldError('email', 'Please enter a valid email address');
                        isValid = false;
                    }

                    if (!data.company || data.company.trim().length < 1) {
                        showFieldError('company', 'Company name is required');
                        isValid = false;
                    }

                    if (!data.phone || data.phone.trim().length < 6) {
                        showFieldError('phone', 'Please enter a valid phone number');
                        isValid = false;
                    }

                    if (!data.rolePreference) {
                        showFieldError('rolePreference', 'Please select a role');
                        isValid = false;
                    }

                    return isValid;
                }

                form.addEventListener('submit', function(e) {
                    e.preventDefault();

                    const data = {
                        firstName: document.getElementById('firstName').value.trim(),
                        lastName: document.getElementById('lastName').value.trim(),
                        email: document.getElementById('email').value.trim(),
                        company: document.getElementById('company').value.trim(),
                        phone: document.getElementById('phone').value.trim(),
                        rolePreference: document.getElementById('rolePreference').value
                    };

                    if (!validateForm(data)) {
                        return;
                    }

                    setLoading(true);

                    fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                    .then(function(response) {
                        return response.json().then(function(body) {
                            return { ok: response.ok, body: body };
                        });
                    })
                    .then(function(result) {
                        setLoading(false);
                        if (result.ok) {
                            showSuccess();
                        } else {
                            showError(result.body.message || 'Failed to submit request. Please try again.');
                        }
                    })
                    .catch(function(error) {
                        setLoading(false);
                        console.error('Request failed:', error);
                        showError('Network error. Please check your connection and try again.');
                    });
                });
            })();
        </script>
    </#if>
</@layout.registrationLayout>
