<script>
	import Header from './components/Header.svelte';
	import Hero from './components/Hero.svelte';
	import About from './components/About.svelte';
	import Projects from './components/Projects.svelte';
	import Contact from './components/Contact.svelte';
	import Footer from './components/Footer.svelte';
</script>

<main>
	<Header />
	<Hero />
	<About />
	<Projects />
	<Contact />
	<Footer />
</main>

<style>
	:global(body) {
		font-family: 'Cairo', sans-serif;
		line-height: 1.6;
		color: white;
		background-color: #0f0a1a;
		margin: 0;
		padding: 0;
	}

	:global(*) {
		box-sizing: border-box;
	}

	main {
		width: 100%;
	}
</style>
