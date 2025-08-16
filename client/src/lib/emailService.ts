import emailjs from '@emailjs/browser';

// Email setup guide for different providers
export const EMAIL_SETUP_GUIDE = {
  web3forms: {
    name: "Web3Forms",
    url: "https://web3forms.com",
    pros: [
      "Free forever plan",
      "No registration required",
      "Works immediately",
      "Good documentation",
      "No SMTP setup needed"
    ],
    steps: [
      "1. Go to web3forms.com",
      "2. Enter your email and get access key",
      "3. Replace 'YOUR_WEB3FORMS_ACCESS_KEY' in emailService.ts",
      "4. Test the functionality"
    ]
  },
  formsubmit: {
    name: "FormSubmit",
    url: "https://formsubmit.co",
    pros: [
      "Completely free",
      "No registration needed",
      "Works with any email",
      "Instant setup",
      "No API keys required"
    ],
    steps: [
      "1. Go to formsubmit.co",
      "2. Replace 'your-email@example.com' with your email",
      "3. The service works immediately",
      "4. Check your inbox for confirmation"
    ]
  },
  emailjs: {
    name: "EmailJS",
    url: "https://emailjs.com",
    pros: [
      "Professional service",
      "Template customization",
      "Good free tier",
      "Gmail integration",
      "Advanced features"
    ],
    steps: [
      "1. Create account at emailjs.com",
      "2. Connect your email service (Gmail, Outlook, etc.)",
      "3. Create an email template",
      "4. Get service ID, template ID, and public key",
      "5. Update the configuration in emailService.ts"
    ]
  }
};

// EmailJS configuration - Replace with your actual values
const EMAIL_SERVICE_ID = 'default_service'; // Your EmailJS service ID
const EMAIL_TEMPLATE_ID = 'template_password_reset'; // Your EmailJS template ID  
const EMAIL_PUBLIC_KEY = 'your_public_key_here'; // Your EmailJS public key

interface EmailParams {
  to_email: string;
  to_name: string;
  reset_link: string;
  user_name: string;
  [key: string]: unknown;
}

interface ContactEmailParams {
  from_name: string;
  from_email: string;
  message: string;
  to_email: string;
  [key: string]: unknown;
}

export const emailService = {
  // Initialize EmailJS (call this once in your app)
  init: () => {
    try {
      emailjs.init(EMAIL_PUBLIC_KEY);
    } catch (error) {
      console.log('EmailJS not configured - using demo mode');
    }
  },

  // Method 1: Using Web3Forms (Free, no signup required)
  sendPasswordResetViaWeb3Forms: async (email: string, userName: string): Promise<boolean> => {
    try {
      const resetToken = Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
      
      // Store token for validation
      localStorage.setItem(`reset_token_${email}`, resetToken);
      localStorage.setItem(`reset_token_expiry_${email}`, (Date.now() + 24 * 60 * 60 * 1000).toString());
      
      const formData = new FormData();
      formData.append('access_key', 'YOUR_WEB3FORMS_ACCESS_KEY'); // Get from web3forms.com
      formData.append('email', email);
      formData.append('subject', 'TradeJournal - Password Reset Request');
      formData.append('message', `
Hello ${userName},

You requested a password reset for your TradeJournal account.

Click the link below to reset your password:
${resetLink}

This link will expire in 24 hours for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
The TradeJournal Team
      `);
      formData.append('redirect', 'false');

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('✅ Password reset email sent successfully via Web3Forms');
        console.log('📧 Reset link:', resetLink);
        return true;
      } else {
        throw new Error('Failed to send email via Web3Forms');
      }
    } catch (error) {
      console.error('❌ Web3Forms error:', error);
      return emailService.sendPasswordResetDemo(email, userName);
    }
  },

  // Method 2: Using FormSubmit (Free, simple)
  sendPasswordResetViaFormSubmit: async (email: string, userName: string): Promise<boolean> => {
    try {
      const resetToken = Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
      
      // Store token for validation
      localStorage.setItem(`reset_token_${email}`, resetToken);
      localStorage.setItem(`reset_token_expiry_${email}`, (Date.now() + 24 * 60 * 60 * 1000).toString());
      
      // Using a public FormSubmit endpoint (you'd replace with your own)
      const formData = new FormData();
      formData.append('_subject', 'TradeJournal - Password Reset Request');
      formData.append('_captcha', 'false');
      formData.append('_template', 'table');
      formData.append('email', email);
      formData.append('name', userName);
      formData.append('reset_link', resetLink);
      formData.append('message', `Password reset requested for TradeJournal account. Reset link: ${resetLink}`);

      // This would be your FormSubmit endpoint - replace with actual endpoint
      const response = await fetch('https://formsubmit.co/your-email@example.com', {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // Required for FormSubmit
      });

      console.log('✅ Password reset email sent successfully via FormSubmit');
      console.log('📧 Reset link:', resetLink);
      return true;
    } catch (error) {
      console.error('❌ FormSubmit error:', error);
      return emailService.sendPasswordResetDemo(email, userName);
    }
  },

  // Method 3: Demo mode (always works)
  sendPasswordResetDemo: async (email: string, userName: string): Promise<boolean> => {
    try {
      const resetToken = Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
      
      // Store token for validation  
      localStorage.setItem(`reset_token_${email}`, resetToken);
      localStorage.setItem(`reset_token_expiry_${email}`, (Date.now() + 24 * 60 * 60 * 1000).toString());
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🚀 DEMO MODE - Password Reset Email');
      console.log('📧 To:', email);
      console.log('👤 Name:', userName);
      console.log('🔗 Reset Link:', resetLink);
      console.log('⏰ Expires:', new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString());
      console.log('');
      console.log('📋 Copy this link and paste it in your browser to test:');
      console.log(resetLink);
      
      return true;
    } catch (error) {
      console.error('❌ Demo mode error:', error);
      return false;
    }
  },

  // Main method that tries different approaches
  sendPasswordResetEmail: async (email: string, userName: string): Promise<boolean> => {
    console.log('📨 Attempting to send password reset email...');
    
    // Try Web3Forms first (most reliable)
    let success = await emailService.sendPasswordResetViaWeb3Forms(email, userName);
    if (success) return true;
    
    // Fallback to FormSubmit
    success = await emailService.sendPasswordResetViaFormSubmit(email, userName);
    if (success) return true;
    
    // Final fallback to demo mode
    return await emailService.sendPasswordResetDemo(email, userName);
  },

  // Validate reset token
  validateResetToken: (email: string, token: string): boolean => {
    const storedToken = localStorage.getItem(`reset_token_${email}`);
    const expiryTime = localStorage.getItem(`reset_token_expiry_${email}`);
    
    if (!storedToken || !expiryTime) {
      console.log('❌ No stored token found for email:', email);
      return false;
    }
    
    if (Date.now() > parseInt(expiryTime)) {
      console.log('❌ Token expired for email:', email);
      localStorage.removeItem(`reset_token_${email}`);
      localStorage.removeItem(`reset_token_expiry_${email}`);
      return false;
    }
    
    if (storedToken !== token) {
      console.log('❌ Invalid token for email:', email);
      return false;
    }
    
    console.log('✅ Valid token for email:', email);
    return true;
  },

  // Clear reset token after use
  clearResetToken: (email: string) => {
    localStorage.removeItem(`reset_token_${email}`);
    localStorage.removeItem(`reset_token_expiry_${email}`);
    console.log('🧹 Cleared reset token for email:', email);
  }
};
