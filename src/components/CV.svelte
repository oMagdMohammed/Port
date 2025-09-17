<script>
	function downloadCV() {
		// Create a link element to trigger download
		const link = document.createElement('a');
		link.href = '/MajdMohammedCV.pdf';
		link.download = 'MajdMohammed_CV.pdf';
		link.target = '_blank';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	function openCV() {
		// Open CV in new tab
		window.open('/MajdMohammedCV.pdf', '_blank');
	}
</script>

<div class="cv-preview">
	<h4>CV</h4>
	<div class="cv-content">
		<div class="cv-icon">📄</div>
		<div class="cv-info">
			<p><strong>Majd Mohammed CV</strong></p>
			<p class="date">Updated: Sep 2025</p>
		</div>
	</div>
	<div class="cv-actions">
		<button class="cv-btn download-btn" on:click={downloadCV}>
			<span class="btn-icon">⬇️</span>
			Download CV
		</button>
		<button class="cv-btn view-btn" on:click={openCV}>
			<span class="btn-icon">👁️</span>
			View CV
		</button>
	</div>
</div>

<style>
	.cv-preview {
		background: #2d2d2d;
		padding: 1.5rem;
		border-radius: 10px;
		border: 1px solid #333;
		margin-bottom: 1rem;
		transition: all 0.3s ease;
	}

	.cv-preview:hover {
		transform: translateY(-2px);
		border-color: #da70d6;
		box-shadow: 0 5px 15px rgba(218, 112, 214, 0.2);
	}

	.cv-preview h4 {
		color: #da70d6;
		font-size: 1.1rem;
		margin-bottom: 1rem;
		text-align: center;
	}

	.cv-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.cv-icon {
		font-size: 2rem;
		opacity: 0.8;
	}

	.cv-info p {
		color: white;
		margin: 0.3rem 0;
	}

	.cv-info .date {
		color: #b0b0b0 !important;
		font-size: 0.9rem;
	}

	.cv-actions {
		display: flex;
		gap: 0.8rem;
		justify-content: center;
	}

	.cv-btn {
		background: linear-gradient(135deg, #8a2be2 0%, #da70d6 100%);
		color: white;
		border: none;
		padding: 0.6rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.3s ease;
		flex: 1;
		justify-content: center;
	}

	.cv-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(138, 43, 226, 0.4);
		background: linear-gradient(135deg, #9a3bf2 0%, #ea80e6 100%);
	}

	.cv-btn:active {
		transform: translateY(0);
	}

	.btn-icon {
		font-size: 1rem;
	}

	.download-btn {
		background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
	}

	.download-btn:hover {
		background: linear-gradient(135deg, #20e4ff 0%, #00aadd 100%);
		box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);
	}

	.view-btn {
		background: linear-gradient(135deg, #8a2be2 0%, #da70d6 100%);
	}

	.view-btn:hover {
		background: linear-gradient(135deg, #9a3bf2 0%, #ea80e6 100%);
		box-shadow: 0 4px 12px rgba(138, 43, 226, 0.4);
	}

	@media (max-width: 768px) {
		.cv-actions {
			flex-direction: column;
		}
		
		.cv-btn {
			width: 100%;
		}
	}
</style>
