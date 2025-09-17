<script>
    import CV from './CV.svelte';

    const contactInfo = [
    {
        icon: '📧',
        label: 'Email',
        value: 'magdage4@gmail.com',
        link: 'mailto:magdage4@gmail.com'
    },
    {
        icon: '📱',
        label: 'Phone',
        value: '+9647836705392',
        link: 'tel:+9647836705392'
    },
    {
        icon: '💼',
        label: 'LinkedIn',
        value: 'linkedin.com/in/majd-mohammed-a94250287/',
        link: 'https://linkedin.com/in/majd-mohammed-a94250287/'
    }
];
</script>

<section id="contact" class="contact">
	<div class="container">
		<h2>Get In Touch</h2>
        <div class="contact-content">
            <div class="contact-info">
				<p class="contact-intro">Ready to work together? Let's discuss your data analysis needs! I'm always excited to work with smart and creative people.</p>
				<div class="contact-methods">
					{#each contactInfo as info}
						<div class="contact-item">
							<span class="contact-icon">{info.icon}</span>
							<div class="contact-details">
								<span class="contact-label">{info.label}</span>
								<a href={info.link} class="contact-value">{info.value}</a>
							</div>
						</div>
					{/each}
				</div>
                <div class="cv-wrap">
                    <CV />
                </div>
			</div>
		</div>
	</div>
</section>

<style>
	.contact {
		background: linear-gradient(135deg, #0f0a1a 0%, #1a0b2e 50%, #2d1b69 100%);
		padding: 80px 0;
		color: white;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
	}

	h2 {
		text-align: center;
		font-size: 2.5rem;
		margin-bottom: 3rem;
		color: white;
		position: relative;
	}

	h2::after {
		content: '';
		position: absolute;
		bottom: -10px;
		left: 50%;
		transform: translateX(-50%);
		width: 80px;
		height: 4px;
		background: linear-gradient(135deg, #8a2be2 0%, #da70d6 100%);
		border-radius: 2px;
	}

	.contact-content {
		display: flex;
		justify-content: center;
		margin-top: 3rem;
	}

	.contact-info {
		text-align: center;
		max-width: 600px;
	}

	.contact-intro {
		font-size: 1.2rem;
		margin-bottom: 3rem;
		color: #b0b0b0;
		line-height: 1.6;
	}

	.contact-methods {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

.cv-wrap { 
    max-width: 520px; 
    margin: 2rem auto 0; 
}

	.contact-item {
		background: #2d2d2d;
		padding: 2rem;
		border-radius: 15px;
		border: 1px solid #333;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.contact-item:hover {
		transform: translateY(-5px);
		border-color: #da70d6;
		box-shadow: 0 10px 30px rgba(218, 112, 214, 0.1);
	}

	.contact-icon {
		font-size: 2rem;
	}

	.contact-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.contact-label {
		font-size: 0.9rem;
		color: #da70d6;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.contact-value {
		color: white;
		text-decoration: none;
		font-size: 1.1rem;
		font-weight: 500;
		transition: color 0.3s ease;
	}

	.contact-value:hover {
		color: #da70d6;
	}

	@media (max-width: 768px) {
		.contact {
			padding: 60px 0;
		}
		
		.contact-methods {
			grid-template-columns: 1fr;
		}
		
		h2 {
			font-size: 2rem;
		}
	}
</style>
