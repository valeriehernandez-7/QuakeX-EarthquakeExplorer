<template>
    <div class="about-view">
        <AppNavbar />

        <div class="about-container">
            <!-- Hero Section -->
            <div class="hero-section">
                <div class="hero-content">
                    <div class="hero-icon">
                        <Transition :size="48" fillColor="#1e293b" />
                    </div>
                    <h1 class="hero-title">QuakeX</h1>
                    <p class="hero-subtitle">Earthquake Data Explorer & Analytics Platform</p>
                    <p class="hero-description">
                        Making complex seismic data accessible through modern web technologies and
                        intelligent analytics.
                    </p>
                </div>
            </div>

            <div class="content-wrapper">
                <!-- Mission Section -->
                <section class="content-section">
                    <h2 class="section-title">Our Mission</h2>
                    <div class="section-content">
                        <p class="lead-text">
                            QuakeX democratizes access to professional-grade seismic analytics,
                            transforming complex earthquake data into clear, actionable insights.
                        </p>
                        <p>
                            By leveraging real-time data from authoritative sources like USGS and
                            powerful analytical capabilities, we enable researchers, educators, and
                            the public to understand earthquake patterns, magnitudes, and
                            geographical distributions with unprecedented ease.
                        </p>
                    </div>
                </section>

                <!-- Features Grid -->
                <section class="content-section">
                    <h2 class="section-title">Key Capabilities</h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-number">01</div>
                            <h3 class="feature-title">Real-Time Data</h3>
                            <p class="feature-description">
                                Access the latest seismic events from USGS worldwide
                            </p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-number">02</div>
                            <h3 class="feature-title">Interactive Mapping</h3>
                            <p class="feature-description">
                                Visualize earthquakes on an intuitive 2D globe with filtering
                            </p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-number">03</div>
                            <h3 class="feature-title">Advanced Analytics</h3>
                            <p class="feature-description">
                                Drill-powered SQL analytics for deep seismic insights
                            </p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-number">04</div>
                            <h3 class="feature-title">Weather Context</h3>
                            <p class="feature-description">
                                Historical weather data correlation for each event
                            </p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-number">05</div>
                            <h3 class="feature-title">Geographic Data</h3>
                            <p class="feature-description">
                                Country identification and elevation integration
                            </p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-number">06</div>
                            <h3 class="feature-title">Export & Reports</h3>
                            <p class="feature-description">
                                Detailed reports with charts and raw datasets
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Impact Section -->
                <section class="content-section impact-section">
                    <div class="impact-content">
                        <h2 class="section-title">Why It Matters</h2>
                        <p class="lead-text">
                            Understanding earthquake patterns is essential for disaster
                            preparedness, infrastructure planning, and scientific research.
                        </p>
                        <p>
                            Seismic data helps communities assess risk, develop emergency response
                            strategies, and implement building codes that save lives. QuakeX makes
                            this critical information accessible to everyone-from students and
                            educators to emergency management professionals and policymakers. The
                            Richter scale measures earthquake magnitude on a logarithmic scale. Each
                            whole number increase represents a tenfold increase in measured
                            amplitude and approximately 31.6 times more energy release. Modern
                            seismology uses the moment magnitude scale (Mw) for more accurate
                            measurements, which QuakeX displays for all recorded events.
                        </p>
                    </div>
                </section>

                <!-- Developer Section -->
                <section class="content-section developer-section">
                    <h2 class="section-title">About the Developer</h2>
                    <div class="developer-card">
                        <div class="developer-header">
                            <h3 class="developer-name">Valerie M. Hernández Fernández</h3>
                            <div class="developer-meta">
                                <span class="location">
                                    <MapMarker :size="16" fillColor="#64748b" />
                                    <a
                                        href="https://www.google.com/maps/place/Costa+Rica/@8.2588997,-84.9399704,7z/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        >Costa Rica</a
                                    >
                                </span>
                                <a
                                    href="https://github.com/valeriehernandez-7"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="github-link"
                                >
                                    <GithubIcon :size="16" fillColor="#64748b" />
                                    @valeriehernandez-7
                                </a>
                            </div>
                        </div>
                        <div class="developer-story">
                            <p>
                                As a Costa Rican engineering student, I've witnessed firsthand the
                                impact of seismic activity in a country along the Pacific Ring of
                                Fire. Earthquakes are a regular part of life here, inspiring me to
                                create a tool that makes this data more accessible and
                                understandable.
                            </p>
                            <p>
                                QuakeX represents a convergence of my passion for technology, data
                                analytics, and community resilience-developed entirely for academic
                                purposes, demonstrating the power of modern web technologies and
                                open data initiatives.
                            </p>
                        </div>
                    </div>
                </section>
                <!-- Technology Stack -->
                <section class="content-section tech-section">
                    <h2 class="section-title">Built With</h2>
                    <div class="tech-grid">
                        <div class="tech-item">
                            <a href="https://vuejs.org/" target="_blank" rel="noopener noreferrer">
                                <Vuejs :size="32" fillColor="#42b883" />
                                <h3>Vue.js 3</h3>
                                <p>Progressive JavaScript framework</p>
                            </a>
                        </div>
                        <div class="tech-item">
                            <a
                                href="https://leafletjs.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <LeafletIcon :size="32" fillColor="#199900" />
                                <h3>Leaflet</h3>
                                <p>Interactive mapping library</p>
                            </a>
                        </div>
                        <div class="tech-item">
                            <a
                                href="https://drill.apache.org/docs/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <DatabaseIcon :size="32" fillColor="#1e293b" />
                                <h3>Apache Drill</h3>
                                <p>SQL analytics engine</p>
                            </a>
                        </div>
                        <div class="tech-item">
                            <a
                                href="https://earthquake.usgs.gov/fdsnws/event/1/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Earth :size="32" fillColor="#1e293b" />
                                <h3>USGS API</h3>
                                <p>Real-time earthquake data</p>
                            </a>
                        </div>
                        <div class="tech-item">
                            <a
                                href="https://open-meteo.com/en/docs/historical-weather-api"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <WeatherPartlyCloudy :size="32" fillColor="#1e293b" />
                                <h3>Weather API</h3>
                                <p>Historical weather data</p>
                            </a>
                        </div>
                        <div class="tech-item">
                            <a
                                href="https://open-meteo.com/en/docs/elevation-api"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MapMarkerRadius :size="32" fillColor="#1e293b" />
                                <h3>Elevation API</h3>
                                <p>Precise elevation data</p>
                            </a>
                        </div>
                    </div>
                </section>

                <!-- CTA Section -->
                <section class="cta-section">
                    <div class="cta-content">
                        <h2 class="cta-title">Explore the Code</h2>
                        <p class="cta-text">
                            QuakeX is open source and available on GitHub. Explore the codebase,
                            contribute, or use it as a learning resource.
                        </p>
                        <Button
                            label="View on GitHub"
                            icon="pi pi-github"
                            class="github-button"
                            @click="openGitHub"
                        />
                    </div>
                </section>

                <!-- Academic Notice -->
                <section class="academic-notice">
                    <div class="notice-content">
                        <School :size="24" fillColor="#1e293b" />
                        <div class="notice-text">
                            <strong>Academic Project</strong>
                            <p>
                                This platform is developed solely for educational and academic
                                purposes. All data sources are properly credited and used in
                                accordance with their respective licenses and terms of service.
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <!-- Footer -->
            <footer class="about-footer">
                <p>Built with curiosity and purpose • Costa Rica</p>
                <p class="footer-year">© 2025 QuakeX</p>
            </footer>
        </div>
    </div>
</template>

<script setup>
// Icons
import Transition from 'vue-material-design-icons/Transition.vue'
import MapMarker from 'vue-material-design-icons/MapMarker.vue'
import GithubIcon from 'vue-material-design-icons/Github.vue'
import School from 'vue-material-design-icons/School.vue'
import Vuejs from 'vue-material-design-icons/Vuejs.vue'
import Earth from 'vue-material-design-icons/Earth.vue'
import DatabaseIcon from 'vue-material-design-icons/Database.vue'
import LeafletIcon from 'vue-material-design-icons/Leaf.vue'
import WeatherPartlyCloudy from 'vue-material-design-icons/WeatherPartlyCloudy.vue'
import MapMarkerRadius from 'vue-material-design-icons/MapMarkerRadius.vue'

const openGitHub = () => {
    window.open(
        'https://github.com/valeriehernandez-7/QuakeX-EarthquakeExplorer',
        '_blank'
    );
};
</script>

<style scoped>
/* ===== BASE STYLES ===== */
.about-view {
    min-height: 100vh;
    background: #ffffff;
}

.about-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0;
}

/* ===== HERO SECTION ===== */
.hero-section {
    padding: 80px 24px 60px;
    text-align: center;
    border-bottom: 1px solid #e2e8f0;
}

.hero-content {
    max-width: 700px;
    margin: 0 auto;
}

.hero-icon {
    margin-bottom: 24px;
    display: flex;
    justify-content: center;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 16px 0;
    letter-spacing: -0.02em;
}

.hero-subtitle {
    font-size: 1.25rem;
    color: #64748b;
    margin: 0 0 24px 0;
    font-weight: 500;
}

.hero-description {
    font-size: 1.125rem;
    color: #475569;
    line-height: 1.7;
    margin: 0;
    max-width: 600px;
    margin: 0 auto;
}

/* ===== CONTENT WRAPPER ===== */
.content-wrapper {
    padding: 80px 24px;
}

.content-section {
    max-width: 900px;
    margin: 0 auto 80px auto;
}

.content-section:last-of-type {
    margin-bottom: 0;
}

/* ===== SECTION TITLES ===== */
.section-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 32px 0;
    letter-spacing: -0.01em;
}

/* ===== SECTION CONTENT ===== */
.section-content p,
.impact-content p,
.developer-story p {
    font-size: 1.0625rem;
    line-height: 1.8;
    color: #475569;
    margin: 0 0 20px 0;
}

.section-content p:last-child,
.impact-content p:last-child,
.developer-story p:last-child {
    margin-bottom: 0;
}

.lead-text {
    font-size: 1.25rem !important;
    color: #334155 !important;
    font-weight: 500;
}

/* ===== FEATURES GRID ===== */
.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 32px;
    margin-top: 40px;
}

.feature-card {
    padding: 32px 24px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.feature-card:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
}

.feature-number {
    font-size: 0.875rem;
    font-weight: 600;
    color: #94a3b8;
    margin-bottom: 16px;
    letter-spacing: 0.05em;
}

.feature-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 12px 0;
}

.feature-description {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: #64748b;
    margin: 0;
}

/* ===== IMPACT SECTION ===== */
.impact-section {
    background: #f8fafc;
    padding: 60px 48px;
    border-radius: 12px;
    margin: 80px auto;
}

/* ===== DEVELOPER SECTION ===== */
.developer-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 40px;
    background: #fafafa;
}

.developer-header {
    margin-bottom: 28px;
    padding-bottom: 28px;
    border-bottom: 1px solid #e2e8f0;
}

.developer-name {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 16px 0;
}

.developer-meta {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    align-items: center;
}

.location,
.github-link {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9375rem;
    color: #64748b;
}

.github-link {
    text-decoration: none;
    transition: color 0.2s;
}

.github-link:hover {
    color: #1e293b;
}

/* ===== RICHTER SECTION ===== */
.richter-section {
    background: #f8fafc;
    padding: 60px 48px;
    border-radius: 12px;
}

.richter-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
    align-items: center;
}

.richter-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.richter-text {
    text-align: center;
    font-size: 1.0625rem;
    line-height: 1.8;
    color: #475569;
    margin: 0;
    max-width: 700px;
}

/* ===== TECH SECTION ===== */
.tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 50px;
    margin-top: 40px;
}

.tech-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
    padding: 32px 20px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.tech-item:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.tech-item h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.tech-item p {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
}

/* ===== CTA SECTION ===== */
.cta-section {
    margin: 80px auto;
    padding: 60px 48px;
    background: #1e293b;
    border-radius: 12px;
    text-align: center;
    color: white;
}

.cta-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 16px 0;
    color: white;
}

.cta-text {
    font-size: 1.125rem;
    line-height: 1.7;
    margin: 0 0 32px 0;
    color: #cbd5e1;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.github-button {
    background: white !important;
    color: #1e293b !important;
    border: none !important;
    font-weight: 600;
    padding: 12px 32px;
    font-size: 1rem;
}

.github-button:hover {
    background: #f1f5f9 !important;
}

/* ===== ACADEMIC NOTICE ===== */
.academic-notice {
    max-width: 900px;
    margin: 60px auto 0;
    padding: 32px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.notice-content {
    display: flex;
    gap: 20px;
    align-items: flex-start;
}

.notice-text strong {
    display: block;
    font-size: 1.125rem;
    color: #1e293b;
    margin-bottom: 8px;
}

.notice-text p {
    font-size: 0.9375rem;
    line-height: 1.7;
    color: #64748b;
    margin: 0;
}

/* ===== FOOTER ===== */
.about-footer {
    text-align: center;
    padding: 60px 24px 40px;
    border-top: 1px solid #e2e8f0;
    margin-top: 80px;
}

.about-footer p {
    font-size: 0.9375rem;
    color: #64748b;
    margin: 8px 0;
}

.footer-year {
    font-size: 0.875rem !important;
    color: #94a3b8 !important;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
    .hero-section {
        padding: 60px 20px 40px;
    }

    .hero-title {
        font-size: 2.5rem;
    }

    .hero-subtitle {
        font-size: 1.125rem;
    }

    .hero-description {
        font-size: 1rem;
    }

    .content-wrapper {
        padding: 60px 20px;
    }

    .content-section {
        margin-bottom: 60px;
    }

    .section-title {
        font-size: 1.75rem;
    }

    .features-grid {
        grid-template-columns: 1fr;
        gap: 24px;
    }

    .impact-section,
    .richter-section,
    .cta-section {
        padding: 40px 28px;
    }

    .developer-card {
        padding: 28px;
    }

    .developer-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .tech-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
    }

    .notice-content {
        flex-direction: column;
        gap: 16px;
    }
}
</style>
