<script>
	import CV from './CV.svelte';
	
const skills = [
		{ name: 'SQL Query Writing', icon: '🗄️', category: 'Data Analysis' },
		{ name: 'Power BI', icon: '📊', category: 'Data Analysis' },
		{ name: 'Tableau', icon: '📈', category: 'Data Analysis' },
		{ name: 'Excel & Power Query', icon: '📋', category: 'Data Analysis' },
		{ name: 'Data Storytelling', icon: '📖', category: 'Data Analysis' },
		{ name: 'Python Automation', icon: '🐍', category: 'Programming' },
		{ name: 'Web Scraping', icon: '🕷️', category: 'Programming' },
		{ name: 'MySQL', icon: '🗃️', category: 'Programming' },
		{ name: 'C++', icon: '⚡', category: 'Programming' },
		{ name: 'Web Research Tools', icon: '🔍', category: 'Research' },
		{ name: 'Google Forms', icon: '📝', category: 'Research' },
		{ name: 'Data Collection', icon: '📥', category: 'Research' }
	];

const skillCategories = ['Data Analysis', 'Programming', 'Research'];
</script>

<section id="about" class="about">
	<div class="container">
		<h2>About Me</h2>
		<div class="about-content">
			<div class="about-text">
				<h3>Majd Mohammed</h3>
				<p class="summary">The Coolest Data Analyst in the 500km radius around your location! Very passionate about data and how it can be utilized to make impactful decisions. I've been learning and practicing with data for 15% of my life and that number is only going up. I love working alongside smart and creative people, brightening their path with information.</p>
				
				<div class="experience-preview">
					<h4>Current Role</h4>
					<p><strong>Data Analyst & Development Researcher</strong> at Digital Logic</p>
					<p class="date">March 2025 - Current</p>
				</div>

				<div class="education-preview">
					<h4>Education</h4>
					<p><strong>Computer Engineering</strong> at Al-Iraqia University</p>
				<p class="date">2023 - 2026</p>
				</div>

			</div>
			
			<div class="skills-section">
				<h3>My Skills</h3>
				{#each skillCategories as category}
					<div class="skill-category">
						<h4>{category}</h4>
						<div class="skills-grid">
							{#each skills.filter(skill => skill.category === category) as skill}
								<div class="skill-item">
									<span class="skill-icon">{skill.icon}</span>
									<span class="skill-name">{skill.name}</span>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.about {
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

	.about-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: start;
	}

	.about-text h3 {
		font-size: 2rem;
		color: #da70d6;
		margin-bottom: 1rem;
		text-align: center;
	}

	.about-text .summary {
		font-size: 1.1rem;
		line-height: 1.8;
		color: #b0b0b0;
		margin-bottom: 2rem;
		text-align: center;
		font-style: italic;
	}

	.experience-preview,
	.education-preview {
		background: #2d2d2d;
		padding: 1.5rem;
		border-radius: 10px;
		border: 1px solid #333;
		margin-bottom: 1rem;
	}

	.experience-preview h4,
	.education-preview h4 {
		color: #da70d6;
		font-size: 1.1rem;
		margin-bottom: 0.5rem;
	}

	.experience-preview p,
	.education-preview p {
		color: white;
		margin: 0.3rem 0;
	}

	.date {
		color: #b0b0b0 !important;
		font-size: 0.9rem;
	}

	.skills-section h3 {
		font-size: 1.8rem;
		margin-bottom: 2rem;
		color: #da70d6;
		text-align: center;
	}

	.skill-category {
		margin-bottom: 2rem;
	}

	.skill-category h4 {
		color: white;
		font-size: 1.2rem;
		margin-bottom: 1rem;
		border-bottom: 2px solid #da70d6;
		padding-bottom: 0.5rem;
		display: inline-block;
	}

	.skills-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.skill-item {
		background: #2d2d2d;
		padding: 1rem;
		border-radius: 10px;
		border: 1px solid #333;
		display: flex;
		align-items: center;
		gap: 0.8rem;
		transition: all 0.3s ease;
	}

	.skill-item:hover {
		transform: translateY(-3px);
		border-color: #da70d6;
		box-shadow: 0 5px 15px rgba(218, 112, 214, 0.2);
	}

	.skill-icon {
		font-size: 1.5rem;
	}

	.skill-name {
		color: white;
		font-weight: 500;
		font-size: 0.9rem;
	}

	@media (max-width: 768px) {
		.about {
			padding: 60px 0;
		}
		
		.about-content {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
		
		h2 {
			font-size: 2rem;
		}
	}
</style>
