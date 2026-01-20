<#-- AICODE-NOTE: OTP Email Template for Alto MFA
     Implements EmailTemplate entity from data-model.md
     Variables: ${code}, ${expiration}, ${user.firstName}
     See contracts/contracts.md Email Template Contract -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Alto Verification Code</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo img {
            max-width: 150px;
            height: auto;
        }
        .logo-text {
            font-size: 28px;
            font-weight: bold;
            color: #1a365d;
        }
        h1 {
            color: #1a365d;
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
        }
        .otp-code {
            background-color: #f0f4f8;
            border: 2px dashed #3182ce;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-code .code {
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #2c5282;
            font-family: 'Courier New', monospace;
        }
        .expiry-notice {
            text-align: center;
            color: #718096;
            font-size: 14px;
            margin-top: 10px;
        }
        .warning {
            background-color: #fffaf0;
            border-left: 4px solid #ed8936;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            color: #a0aec0;
            font-size: 12px;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        .footer a {
            color: #3182ce;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <div class="logo-text">Alto</div>
        </div>

        <h1>Verification Code</h1>

        <p>Hi<#if user.firstName??> ${user.firstName}</#if>,</p>

        <p>You requested a verification code to sign in to your Alto account. Use the code below to complete your login:</p>

        <div class="otp-code">
            <div class="code">${code}</div>
        </div>

        <p class="expiry-notice">
            This code will expire in <strong>${expiration} minutes</strong>.
        </p>

        <div class="warning">
            <strong>Security Notice:</strong> If you did not request this code, please ignore this email. Someone may have entered your email address by mistake.
        </div>

        <p>If you're having trouble, contact our support team.</p>

        <div class="footer">
            <p>This is an automated message from Alto.</p>
            <p>&copy; ${.now?string('yyyy')} Alto. All rights reserved.</p>
            <p>
                <a href="#">Privacy Policy</a> |
                <a href="#">Terms of Service</a>
            </p>
        </div>
    </div>
</body>
</html>
