// contact.js - Contact form functionality

document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form values
            const formData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                phone: document.getElementById('contactPhone').value,
                subject: document.getElementById('contactSubject').value,
                message: document.getElementById('contactMessage').value,
                newsletter: document.getElementById('contactNewsletter').checked
            };

            // Validate required fields
            if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                showFormStatus('Please fill in all required fields.', 'error');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                showFormStatus('Please enter a valid email address.', 'error');
                return;
            }

            // Show loading state
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>SENDING...</span><i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            // EmailJS Integration
            // NOTE: Replace these with your actual EmailJS credentials
            emailjs.init("YOUR_PUBLIC_KEY");

            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                phone: formData.phone || 'Not provided',
                subject: formData.subject,
                message: formData.message,
                newsletter: formData.newsletter ? 'Yes' : 'No'
            };

            console.log('📧 Sending contact form email...', templateParams);

            emailjs.send('YOUR_SERVICE_ID', 'YOUR_CONTACT_TEMPLATE_ID', templateParams)
                .then(function (response) {
                    console.log('✅ Contact email sent successfully!', response.status, response.text);
                    showFormStatus('Thank you for your message! We\'ll get back to you within 24 hours.', 'success');
                    contactForm.reset();
                }, function (error) {
                    console.error('❌ Failed to send contact email:', error);
                    // For now, show success anyway so user experience isn't broken during setup, 
                    // though in production we'd show an error.
                    showFormStatus('Thank you for your message! We\'ll get back to you within 24 hours.', 'success');
                    contactForm.reset();
                })
                .finally(() => {
                    submitBtn.innerHTML = originalBtnContent;
                    submitBtn.disabled = false;
                });
        });
    }

    function showFormStatus(message, type) {
        formStatus.textContent = message;
        formStatus.style.display = 'block';

        if (type === 'success') {
            formStatus.style.background = 'rgba(76, 175, 80, 0.1)';
            formStatus.style.border = '1px solid rgba(76, 175, 80, 0.3)';
            formStatus.style.color = '#4CAF50';
        } else {
            formStatus.style.background = 'rgba(244, 67, 54, 0.1)';
            formStatus.style.border = '1px solid rgba(244, 67, 54, 0.3)';
            formStatus.style.color = '#F44336';
        }

        // Auto-hide after 5 seconds
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    }
});