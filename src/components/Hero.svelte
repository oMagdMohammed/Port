<script>
	import { onMount } from 'svelte';
	
	let imageElement;

	onMount(() => {
		// Add rotation animation to the image
		if (imageElement) {
			imageElement.style.animation = 'rotate 10s linear infinite';
		}
	});
</script>

<section id="home" class="hero">
	<div class="hero-content">
		<div class="profile-image">
			<div class="image-container">
				<img 
					bind:this={imageElement}
					src="/Face1.png" 
					alt="Majd Mohammed Profile" 
					class="profile-photo"
				/>
				<div class="image-border"></div>
			</div>
		</div>
		<h1>Hello! I'm Majd Mohammed</h1>
		<p>The Coolest Data Analyst in the 500km radius around your location!</p>
	</div>
</section>

<style>
	.hero {
		background: linear-gradient(135deg, #1a0b2e 0%, #2d1b69 50%, #4a2c7a 100%);
		color: white;
		padding: 120px 0 80px;
		text-align: center;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	.hero::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.1) 0%, transparent 70%);
		pointer-events: none;
	}

	.hero::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: 
			/* Pie Chart */
			radial-gradient(circle at 20% 20%, rgba(138, 43, 226, 0.1) 0%, transparent 15%),
			radial-gradient(circle at 80% 30%, rgba(75, 0, 130, 0.1) 0%, transparent 12%),
			radial-gradient(circle at 30% 80%, rgba(106, 90, 205, 0.1) 0%, transparent 18%),
			/* Bar Chart */
			linear-gradient(90deg, transparent 0%, rgba(138, 43, 226, 0.05) 25%, transparent 50%),
			linear-gradient(90deg, transparent 60%, rgba(75, 0, 130, 0.05) 75%, transparent 100%),
			/* Line Chart */
			linear-gradient(45deg, transparent 0%, rgba(106, 90, 205, 0.03) 20%, transparent 40%),
			linear-gradient(-45deg, transparent 60%, rgba(138, 43, 226, 0.03) 80%, transparent 100%);
		animation: chartAnimation 20s ease-in-out infinite;
		pointer-events: none;
	}

	@keyframes chartAnimation {
		0%, 100% {
			opacity: 0.3;
			transform: scale(1);
		}
		25% {
			opacity: 0.6;
			transform: scale(1.05);
		}
		50% {
			opacity: 0.4;
			transform: scale(0.95);
		}
		75% {
			opacity: 0.7;
			transform: scale(1.02);
		}
	}

	.hero-content {
		position: relative;
		z-index: 1;
	}

	.hero-content h1 {
		font-size: 3rem;
		margin-bottom: 1rem;
		font-weight: 700;
		background: linear-gradient(45deg, #8a2be2, #da70d6, #ffffff);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: textGlow 3s ease-in-out infinite alternate;
	}

	.hero-content p {
		font-size: 1.3rem;
		margin-bottom: 2rem;
		opacity: 0.9;
		color: #d8bfd8;
		animation: textFade 4s ease-in-out infinite;
	}

	@keyframes textGlow {
		0% {
			filter: drop-shadow(0 0 10px rgba(138, 43, 226, 0.3));
		}
		100% {
			filter: drop-shadow(0 0 20px rgba(138, 43, 226, 0.6));
		}
	}

	@keyframes textFade {
		0%, 100% {
			opacity: 0.9;
		}
		50% {
			opacity: 0.7;
		}
	}

	.profile-image {
		margin-bottom: 2rem;
	}

	.image-container {
		position: relative;
		width: 200px;
		height: 200px;
		margin: 0 auto;
	}

	.profile-photo {
		width: 200px;
		height: 200px;
		border-radius: 50%;
		object-fit: cover;
		position: relative;
		z-index: 2;
		animation: slowSpin 15s linear infinite;
		box-shadow: 0 10px 30px rgba(138, 43, 226, 0.3);
		filter: grayscale(100%) contrast(1.2);
		border: 4px solid #00d4ff;
	}

	.image-border {
		position: absolute;
		top: -15px;
		left: -15px;
		width: 230px;
		height: 230px;
		border: 6px solid #00d4ff;
		border-radius: 50%;
		animation: borderPulse 3s ease-in-out infinite;
		z-index: 1;
		opacity: 0.8;
	}

	@keyframes slowSpin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes borderPulse {
		0%, 100% {
			opacity: 0.7;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.05);
		}
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 768px) {
		.hero-content h1 {
			font-size: 2rem;
		}
		
		.hero-content p {
			font-size: 1.1rem;
		}
		
		img {
			width: 150px;
			height: 150px;
		}
	}
</style>
