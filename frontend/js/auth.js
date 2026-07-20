    const SUPABASE_URL = 'https://ctdfpuwkicqadhchticn.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZGZwdXdraWNxYWRoY2h0aWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwODUxNzYsImV4cCI6MjA5NDY2MTE3Nn0.dPf4YGHD389bGLlsBpbOPklq-SzU0mtYuYqltObs-zY';
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    async function mainSiteOAuth(provider) {
      const sbProvider = provider === 'linkedin' ? 'linkedin_oidc' : provider;
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: sbProvider,
        options: { redirectTo: window.location.origin + '/' }
      });
      if(error) {
        const msg = document.getElementById('auth-error-msg');
        msg.textContent = error.message;
        msg.style.display = 'block';
        msg.style.color = '#ef4444';
      }
    }

    function switchTab(tab) {
      document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.login-tab-content').forEach(c => c.classList.remove('active'));
      
      const tabHeaderContainer = document.querySelector('.login-tabs');
      if (tab === 'otp') {
        if (tabHeaderContainer) tabHeaderContainer.style.display = 'none';
      } else {
        if (tabHeaderContainer) tabHeaderContainer.style.display = 'flex';
        const tabEl = document.querySelector(`.login-tab[data-tab="${tab}"]`);
        if (tabEl) tabEl.classList.add('active');
      }
      
      const targetContent = document.getElementById(`tab-${tab}`);
      if (targetContent) targetContent.classList.add('active');
      document.getElementById('auth-error-msg').style.display = 'none';
    }

    async function handleEmailLogin(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      const btn = document.getElementById('btn-login-submit');
      const msg = document.getElementById('auth-error-msg');
      
      btn.textContent = 'Logging in...';
      btn.disabled = true;
      msg.style.display = 'none';

      const { error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
      
      if(error) {
        // Check if the error is email not confirmed
        if (error.message && (error.message.toLowerCase().includes('confirm') || error.message.toLowerCase().includes('verify') || error.message.toLowerCase().includes('not confirmed'))) {
          window.pendingVerificationEmail = email;
          window.otpVerificationType = 'signup';
          
          try {
            await supabaseClient.auth.resend({ type: 'signup', email: email });
          } catch(resendErr) {}
          
          const otpInstructions = document.getElementById('otp-instructions');
          if (otpInstructions) {
            otpInstructions.innerHTML = `Your email is not verified yet. We have sent a verification code (OTP) and a confirmation link to <strong>${email}</strong>. Please enter the OTP below to verify your account.`;
          }
          
          switchTab('otp');
        } else {
          msg.textContent = error.message;
          msg.style.display = 'block';
          msg.style.color = '#ef4444';
        }
        btn.disabled = false;
        btn.textContent = 'Login to Portal 🚀';
      } else {
        closeLoginModal();
        checkLoginState();
        showToast('success', '🎉', 'Logged in successfully!');
      }
    }

    async function handleSignup(e) {
      e.preventDefault();
      const email = document.getElementById('signup-email').value;
      const pass = document.getElementById('signup-password').value;
      const name = document.getElementById('signup-name').value;
      const phone = document.getElementById('signup-phone').value;
      const brand = document.getElementById('signup-brand').value;
      const goal = document.getElementById('signup-goal').value;
      
      const btn = document.getElementById('btn-signup-submit');
      const msg = document.getElementById('auth-error-msg');

      btn.textContent = 'Creating Account...';
      btn.disabled = true;
      msg.style.display = 'none';

      const { error } = await supabaseClient.auth.signUp({
        email, 
        password: pass,
        options: {
          data: { full_name: name, brand_domain: brand, primary_goal: goal, phone: phone }
        }
      });

      if(error) {
        msg.textContent = error.message;
        msg.style.display = 'block';
        msg.style.color = '#ef4444';
        btn.disabled = false;
        btn.textContent = 'Submit Application & Claim Consultation 🚀';
      } else {
        // Auto create inquiry
        try {
          await fetch('/api/inquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, service: goal, message: `Auto inquiry from signup. Brand: ${brand}` })
          });
        } catch(e) {}

        // Save email for OTP verification
        window.pendingVerificationEmail = email;
        window.otpVerificationType = 'signup';
        
        const otpInstructions = document.getElementById('otp-instructions');
        if (otpInstructions) {
          otpInstructions.innerHTML = `We have sent a verification code (OTP) and a confirmation link to <strong>${email}</strong>. Please enter the 6-digit OTP code below to confirm and activate your account.`;
        }
        
        switchTab('otp');
        btn.disabled = false;
        btn.textContent = 'Submit Application & Claim Consultation 🚀';
      }
    }

    async function handleOtpVerification(e) {
      e.preventDefault();
      const token = document.getElementById('otp-code').value;
      const email = window.pendingVerificationEmail;
      const btn = document.getElementById('btn-otp-submit');
      const msg = document.getElementById('auth-error-msg');

      if (!email) {
        msg.textContent = "Email address not found. Please try logging in or signing up again.";
        msg.style.display = 'block';
        msg.style.color = '#ef4444';
        return;
      }

      btn.textContent = 'Verifying OTP...';
      btn.disabled = true;
      msg.style.display = 'none';

      const verifyType = window.otpVerificationType || 'signup';

      const { error } = await supabaseClient.auth.verifyOtp({
        email,
        token,
        type: verifyType
      });

      if (error) {
        msg.textContent = error.message;
        msg.style.display = 'block';
        msg.style.color = '#ef4444';
        btn.disabled = false;
        btn.textContent = 'Verify OTP & Log In 🚀';
      } else {
        msg.style.display = 'none';
        
        // Sync user with local database
        try {
          const { data: sessionData } = await supabaseClient.auth.getSession();
          if (sessionData && sessionData.session) {
            await window.fetch('/api/users/me', {
              headers: { 'Authorization': `Bearer ${sessionData.session.access_token}` }
            });
          }
        } catch(e) { console.error('Sync error:', e); }

        if (verifyType === 'recovery') {
          // If this was a password recovery OTP, we show the New Password form
          switchTab('new-password');
        } else {
          // Standard signup email confirmation
          msg.textContent = 'OTP verified successfully! Logging you in...';
          msg.style.display = 'block';
          msg.style.color = '#10b981';
          btn.disabled = false;
          btn.textContent = 'Verify OTP & Log In 🚀';
          
          setTimeout(() => {
            closeLoginModal();
            document.getElementById('otp-form').reset();
            if (typeof showToast === 'function') {
              showToast('success', '🎉', 'Email Verified! Welcome to LookUPp.');
            }
          }, 1500);
        }
      }
    }

    async function showForgotPassword(e) {
      e.preventDefault();
      const emailInput = document.getElementById('login-email').value;
      const msg = document.getElementById('auth-error-msg');
      
      if (!emailInput) {
        msg.textContent = "Please enter your email address first to reset your password.";
        msg.style.display = 'block';
        msg.style.color = '#ef4444';
        return;
      }
      
      msg.style.display = 'none';
      const btn = document.getElementById('btn-login-submit');
      const originalText = btn.textContent;
      btn.textContent = 'Sending Recovery Email...';
      btn.disabled = true;

      const { error } = await supabaseClient.auth.resetPasswordForEmail(emailInput);

      if (error) {
        msg.textContent = error.message;
        msg.style.display = 'block';
        msg.style.color = '#ef4444';
        btn.textContent = originalText;
        btn.disabled = false;
      } else {
        window.pendingVerificationEmail = emailInput;
        window.otpVerificationType = 'recovery';
        
        const otpInstructions = document.getElementById('otp-instructions');
        if (otpInstructions) {
          otpInstructions.innerHTML = `We have sent a password recovery code (OTP) and a reset link to <strong>${emailInput}</strong>. Please enter the OTP below to set a new password.`;
        }
        
        switchTab('otp');
        btn.textContent = originalText;
        btn.disabled = false;
      }
    }

    async function handleSetNewPassword(e) {
      e.preventDefault();
      const newPassword = document.getElementById('reset-new-password').value;
      const btn = document.getElementById('btn-new-password-submit');
      const msg = document.getElementById('auth-error-msg');

      btn.textContent = 'Updating Password...';
      btn.disabled = true;
      msg.style.display = 'none';

      const { error } = await supabaseClient.auth.updateUser({
        password: newPassword
      });

      if (error) {
        msg.textContent = error.message;
        msg.style.display = 'block';
        msg.style.color = '#ef4444';
        btn.disabled = false;
        btn.textContent = 'Set New Password 🚀';
      } else {
        msg.textContent = 'Password updated successfully! Logging you in...';
        msg.style.display = 'block';
        msg.style.color = '#10b981';
        
        setTimeout(() => {
          closeLoginModal();
          document.getElementById('new-password-form').reset();
          if (typeof showToast === 'function') {
            showToast('success', '🔐', 'Password updated successfully!');
          }
        }, 1500);
      }
    }

    async function resendOtp(e) {
      e.preventDefault();
      const email = window.pendingVerificationEmail;
      const btn = document.getElementById('btn-resend-otp');
      const msg = document.getElementById('auth-error-msg');

      if (!email) {
        alert("Email address not found. Please try signing up again.");
        return;
      }

      const originalText = btn.innerHTML;
      btn.innerHTML = 'Sending...';
      btn.style.pointerEvents = 'none';
      msg.style.display = 'none';

      let resendError = null;
      if (window.otpVerificationType === 'recovery') {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
        resendError = error;
      } else {
        const { error } = await supabaseClient.auth.resend({
          type: 'signup',
          email: email
        });
        resendError = error;
      }

      if (resendError) {
        msg.textContent = resendError.message;
        msg.style.display = 'block';
        msg.style.color = '#ef4444';
        btn.innerHTML = originalText;
        btn.style.pointerEvents = 'auto';
      } else {
        msg.textContent = 'A new verification code (OTP) and link have been sent to your email!';
        msg.style.display = 'block';
        msg.style.color = '#10b981';
        
        let countdown = 60;
        const timer = setInterval(() => {
          countdown--;
          if (countdown <= 0) {
            clearInterval(timer);
            btn.innerHTML = '🔄 Resend OTP';
            btn.style.pointerEvents = 'auto';
          } else {
            btn.innerHTML = `🔄 Resend OTP (${countdown}s)`;
          }
        }, 1000);
      }
    }

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      const loginBtn = document.getElementById('login-btn');
      const userMenu = document.getElementById('user-menu');
      const adminLink = document.getElementById('admin-link');
      
      if (session) {
        if(loginBtn) loginBtn.style.display = 'none';
        if(userMenu) userMenu.style.display = 'flex';
        
        // Don't auto-close the modal if the user is in the middle of a password recovery flow
        if (window.otpVerificationType !== 'recovery') {
          if (typeof closeLoginModal === 'function') closeLoginModal();
          else {
            const modal = document.getElementById('login-modal');
            if (modal) modal.classList.remove('active');
          }
        }
        
        try {
          const res = await fetch('/api/users/me', { headers: { 'Authorization': 'Bearer ' + session.access_token } });
          if (res.ok) {
            const user = await res.json();
            localStorage.setItem('adminToken', session.access_token);
            localStorage.setItem('adminUser', JSON.stringify(user));
            localStorage.setItem('lookupp_user', JSON.stringify({ email: user.email, name: user.name, loggedIn: true }));
            if (typeof checkLoginState === 'function') checkLoginState();
            
            if (user.role !== 'user' && adminLink) {
              adminLink.style.display = 'inline-flex';
            }
          }
        } catch(e) {}
      } else {
        if(loginBtn) loginBtn.style.display = 'inline-flex';
        if(userMenu) userMenu.style.display = 'none';
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('lookupp_user');
        if (typeof checkLoginState === 'function') checkLoginState();
      }
    });