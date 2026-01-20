<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <#if messageHeader??>
            ${messageHeader}
        <#else>
            ${message.summary}
        </#if>
    <#elseif section = "form">
        <div id="kc-info-message">
            <p class="instruction">
                ${kcSanitize(message.summary)?no_esc}
            </p>
            <#if skipLink??>
            <#else>
                <#if pageRedirectUri?has_content>
                    <p style="margin-top: 20px;">
                        <a href="${pageRedirectUri}" class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!}">
                            ${kcSanitize(msg("backToApplication"))?no_esc}
                        </a>
                    </p>
                <#elseif actionUri?has_content>
                    <p style="margin-top: 20px;">
                        <a href="${actionUri}" class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!}">
                            ${kcSanitize(msg("proceedWithAction"))?no_esc}
                        </a>
                    </p>
                <#elseif (client.baseUrl)?has_content>
                    <p style="margin-top: 20px;">
                        <a href="${client.baseUrl}" class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!}">
                            ${kcSanitize(msg("backToApplication"))?no_esc}
                        </a>
                    </p>
                </#if>
            </#if>
        </div>
    </#if>
</@layout.registrationLayout>
