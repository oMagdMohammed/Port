<script>
const projects = [
    {
        id: 1,
        slug: 'retailer-dashboard',
        title: 'Retailer Dashboard',
        description: `One of my first projects was helping a clothing retailer see their business clearly.
I transformed messy spreadsheets into a clean dashboard showing weekly sales patterns, inventory status, and promotion performance — giving the team a clear window into their business.`,
        // cover image is resolved at render time
        details: {
            goal: 'Organize messy Excel data into a clear, insightful dashboard',
            process: 'Cleaned and structured unorganized datasets, then built an interactive Power BI dashboard',
            insight: 'Delivered a simple, actionable view of sales trends and inventory performance'
        }
    },
    {
        id: 2,
        slug: 'commission-formulas',
        title: 'Commission Formulas',
        description: `How much should a platform charge in commission?
I scraped 2,000+ local product listings to understand pricing patterns, tested multiple formulas, and visualized their effects.
This led to a balanced model that supports both business sustainability and consumer affordability.`,
        // cover image is resolved at render time
        details: {
            goal: 'Determine a fair commission structure for merchants on a platform',
            process: 'Tested multiple formulas, graphed their impacts, and scraped 2,000+ product listings from Iraqi platforms to benchmark pricing',
            insight: 'Built a formula that balances company profit with customer benefit'
        }
    },
    {
        id: 3,
        slug: 'trip-time-calculation',
        title: 'Trip Time Calculation',
        description: `Navigating Baghdad’s traffic is a logistical nightmare — here’s my attempt at solving it.
I calculated 600+ route combinations across 25+ locations, factoring in traffic and delays, to predict delivery times and estimate fair trip costs.
The result? A realistic time range per area and a clear, efficient pricing model.`,
        // cover image is resolved at render time
        details: {
            goal: 'Estimate delivery time and cost for 3-point trips across Baghdad',
            process: 'Built a distance matrix of 25+ locations to generate 600+ route variations, factoring in traffic and human delays',
            insight: 'Produced a reliable time range per district and a data-driven price point'
        }
    }
];

let selectedProject = null;

function getInitialCover(slug) {
    return `/screenshots/${slug}/cover.jpeg`;
}

function handleCoverError(imgEl, slug) {
    try {
        const src = imgEl.getAttribute('src') || '';
        if (src.endsWith('.jpeg')) {
            imgEl.src = `/screenshots/${slug}/cover.jpg`;
        } else if (src.endsWith('.jpg')) {
            imgEl.src = `/screenshots/${slug}/cover.png`;
        } else {
            imgEl.style.display = 'none';
        }
    } catch (_) {
        imgEl.style.display = 'none';
    }
}

function closeDetail() {
    selectedProject = null;
    const el = document.getElementById('projects');
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function handleProjectClick(project) {
    selectedProject = project;
    const el = document.getElementById('project-detail');
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
</script>

<section id="projects" class="projects">
	<div class="container">
		<h2>My Projects</h2>
		<div class="projects-grid">
            {#each projects as project}
                <div class="project-card" on:mouseenter on:mouseleave>
                    <div class="project-image">
                        <img src={getInitialCover(project.slug)} alt={project.title}
                             on:error={(e) => handleCoverError(e.currentTarget, project.slug)} />
                    </div>
					<div class="project-content">
						<h3>{project.title}</h3>
						<p>{project.description}</p>
                        <button class="btn" on:click={() => handleProjectClick(project)}>
                            View Project
						</button>
					</div>
				</div>
			{/each}
		</div>
        {#if selectedProject}
            <div id="project-detail" class="project-detail">
                <p class="detail-intro">{selectedProject.description}</p>
                <div class="kpis">
                    <div class="kpi"><span class="kpi-label">Goal</span><span class="kpi-text">{selectedProject.details.goal}</span></div>
                    <div class="kpi"><span class="kpi-label">Process</span><span class="kpi-text">{selectedProject.details.process}</span></div>
                    <div class="kpi"><span class="kpi-label">Insight</span><span class="kpi-text">{selectedProject.details.insight}</span></div>
                </div>

                <h4>Screenshots</h4>
                {#key selectedProject.slug}
                    <div class="screenshots-grid">
                        {#each Array.from({length: 20}, (_, i) => i + 1) as idx}
                            {#each ['jpeg','jpg','png'] as ext}
                                <img src={`/screenshots/${selectedProject.slug}/${idx}.${ext}`}
                                     alt={`${selectedProject.title} screenshot ${idx}`}
                                     loading="lazy"
                                     on:error={(e) => e.currentTarget.remove()} />
                            {/each}
                        {/each}
                    </div>
                {/key}

                <div class="close-detail">
                    <button class="close-btn" on:click={closeDetail}>× Close</button>
                </div>
            </div>
        {/if}
	</div>
</section>

<style>
	.projects {
		background: linear-gradient(135deg, #1a0b2e 0%, #2d1b69 50%, #4a2c7a 100%);
		padding: 80px 0;
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

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
		margin-top: 3rem;
	}

	.project-card {
		background: #1a1a1a;
		border-radius: 15px;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0,0,0,0.3);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
		border: 1px solid #333;
	}

	.project-card:hover {
		transform: translateY(-10px);
		box-shadow: 0 20px 40px rgba(218, 112, 214, 0.2);
		border-color: #da70d6;
	}

	.project-image img {
		width: 100%;
		height: 200px;
		object-fit: cover;
	}

	.project-content {
		padding: 1.5rem;
	}

	.project-content h3 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: white;
	}

	.project-content p {
		color: #b0b0b0;
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}

.project-detail {
    margin-top: 3rem;
    background: #121212;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 1.5rem;
    color: white;
}

/* removed unused h3 style after design change */

.detail-intro {
    color: #c8c8c8;
    margin-bottom: 1rem;
}

.kpis {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.8rem;
    margin-bottom: 1.5rem;
}

.kpi {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 0.8rem 1rem;
}

.kpi-label {
    display: block;
    font-size: 0.8rem;
    color: #da70d6;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.2rem;
}

.kpi-text {
    color: #eaeaea;
}

.screenshots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    gap: 1rem;
}

.screenshots-grid img {
    width: 100%;
    height: auto;
    max-height: 800px;
    object-fit: contain;
    background: #0b0b0b;
    border-radius: 10px;
    border: 1px solid #333;
    display: block;
}

.close-detail {
    margin-top: 1.2rem;
    display: flex;
    justify-content: center;
}

.close-btn {
    background: #2d2d2d;
    color: white;
    border: 1px solid #444;
    border-radius: 999px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: #3a3a3a;
    border-color: #da70d6;
    box-shadow: 0 4px 12px rgba(218,112,214,0.2);
}

	.btn {
		display: inline-block;
		background: linear-gradient(135deg, #8a2be2 0%, #da70d6 100%);
		color: white;
		padding: 12px 30px;
		text-decoration: none;
		border-radius: 25px;
		font-weight: 600;
		transition: all 0.3s ease;
		border: none;
		cursor: pointer;
		font-family: 'Cairo', sans-serif;
	}

	.btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 20px rgba(218, 112, 214, 0.3);
		background: linear-gradient(135deg, #da70d6 0%, #8a2be2 100%);
	}

	@media (max-width: 768px) {
		.projects {
			padding: 60px 0;
		}
		
		.projects-grid {
			grid-template-columns: 1fr;
		}
		
		h2 {
			font-size: 2rem;
		}
	}

	@media (max-width: 480px) {
		.project-card {
			margin: 0 10px;
		}
	}
</style>
