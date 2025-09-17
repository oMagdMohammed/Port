<script>
	let activeSection = '';

	function scrollToSection(sectionId) {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function handleScroll() {
		const sections = ['about', 'projects', 'contact'];
		const scrollPosition = window.scrollY + 200;

		for (const section of sections) {
			const element = document.getElementById(section);
			if (element) {
				const sectionTop = element.offsetTop;
				const sectionHeight = element.clientHeight;
				if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
					activeSection = section;
					break;
				}
			}
		}
	}
</script>

<svelte:window on:scroll={handleScroll} />

<header>
	<nav>
		<div class="logo">
			<h2>Majd Mohammed</h2>
		</div>
		<ul class="nav-links">
			<li><a href="#about" class:active={activeSection === 'about'} on:click={() => scrollToSection('about')}>About Me</a></li>
			<li><a href="#projects" class:active={activeSection === 'projects'} on:click={() => scrollToSection('projects')}>Projects</a></li>
			<li><a href="#contact" class:active={activeSection === 'contact'} on:click={() => scrollToSection('contact')}>Contact</a></li>
		</ul>
	</nav>
</header>

<style>
	header {
		background: linear-gradient(135deg, #1a0b2e 0%, #2d1b69 100%);
		color: white;
		padding: 0.5rem 0; /* slimmer navbar */
		position: fixed;
		width: 100%;
		top: 0;
		z-index: 1000;
		box-shadow: 0 2px 20px rgba(138, 43, 226, 0.3);
		border-bottom: 1px solid #4a2c7a;
	}

	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
	}

	.logo h2 {
		font-size: 1.4rem;
		font-weight: 700;
	}

	.nav-links {
		display: flex;
		list-style: none;
		gap: 1rem;
		margin: 0;
		padding: 0;
	}

	.nav-links a {
		color: white;
		text-decoration: none;
		font-weight: 500;
		font-size: 0.95rem;
		transition: color 0.3s ease;
		cursor: pointer;
	}

	.nav-links a:hover,
	.nav-links a.active {
		color: #da70d6;
		font-weight: 600;
		text-shadow: 0 0 10px rgba(218, 112, 214, 0.5);
	}

	@media (max-width: 768px) {
		.nav-links {
			flex-direction: column;
			gap: 1rem;
		}
	}
</style>
