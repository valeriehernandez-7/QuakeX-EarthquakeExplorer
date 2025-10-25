<template>
    <div class="about-view">
        <AppNavbar />

        <div class="about-container">
            <!-- Header Section -->
            <div class="about-header">
                <div class="logo-section">
                    <Transition :size="64" fillColor="#3b82f6" />
                    <div class="header-text">
                        <h1>QuakeX</h1>
                        <p class="tagline">Earthquake Data Explorer & Analytics Platform</p>
                    </div>
                </div>
            </div>

            <!-- Main Content Grid -->
            <div class="content-grid">
                <!-- About the Project -->
                <Card class="about-card">
                    <template #title>
                        <div class="card-title">
                            <InformationOutline :size="24" fillColor="#3b82f6" />
                            <span>About the Project</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="card-content">
                            <p>
                                QuakeX is an advanced seismic data exploration and analytics
                                platform designed to provide comprehensive insights into global
                                earthquake activity. By leveraging real-time data from authoritative
                                sources and powerful analytical capabilities, QuakeX transforms raw
                                seismic data into actionable intelligence.
                            </p>
                            <p>
                                This platform serves as a critical tool for understanding earthquake
                                patterns, magnitudes, depths, and geographical distributions,
                                enabling researchers, educators, and the public to access reliable
                                seismic information with ease.
                            </p>
                        </div>
                    </template>
                </Card>

                <!-- Key Features -->
                <Card class="about-card">
                    <template #title>
                        <div class="card-title">
                            <StarOutline :size="24" fillColor="#3b82f6" />
                            <span>Key Features</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="features-list">
                            <div class="feature-item">
                                <CheckCircle :size="20" fillColor="#10b981" />
                                <div class="feature-text">
                                    <strong>Real-Time Earthquake Data</strong>
                                    <span
                                        >Access to the latest seismic events from USGS
                                        worldwide</span
                                    >
                                </div>
                            </div>
                            <div class="feature-item">
                                <CheckCircle :size="20" fillColor="#10b981" />
                                <div class="feature-text">
                                    <strong>Interactive Mapping</strong>
                                    <span
                                        >Visualize earthquakes on an intuitive 2D globe with
                                        real-time filtering</span
                                    >
                                </div>
                            </div>
                            <div class="feature-item">
                                <CheckCircle :size="20" fillColor="#10b981" />
                                <div class="feature-text">
                                    <strong>Advanced Analytics</strong>
                                    <span
                                        >Drill-powered SQL analytics for deep insights into seismic
                                        patterns</span
                                    >
                                </div>
                            </div>
                            <div class="feature-item">
                                <CheckCircle :size="20" fillColor="#10b981" />
                                <div class="feature-text">
                                    <strong>Weather Context</strong>
                                    <span
                                        >Historical weather data correlation for each seismic
                                        event</span
                                    >
                                </div>
                            </div>
                            <div class="feature-item">
                                <CheckCircle :size="20" fillColor="#10b981" />
                                <div class="feature-text">
                                    <strong>Geographic Enrichment</strong>
                                    <span
                                        >Automatic country identification and elevation data
                                        integration</span
                                    >
                                </div>
                            </div>
                            <div class="feature-item">
                                <CheckCircle :size="20" fillColor="#10b981" />
                                <div class="feature-text">
                                    <strong>Comprehensive Reporting</strong>
                                    <span
                                        >Export detailed reports with charts, data tables, and raw
                                        datasets</span
                                    >
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- Importance -->
                <Card class="about-card">
                    <template #title>
                        <div class="card-title">
                            <AlertCircle :size="24" fillColor="#3b82f6" />
                            <span>Why Seismic Data Matters</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="card-content">
                            <p>
                                Understanding earthquake patterns and characteristics is crucial for
                                disaster preparedness, infrastructure planning, and scientific
                                research. Seismic data helps communities assess risk, develop
                                emergency response strategies, and implement building codes that can
                                save lives.
                            </p>
                            <p>
                                QuakeX democratizes access to professional-grade seismic analytics,
                                making complex geological data accessible to everyone from students
                                and educators to emergency management professionals and
                                policymakers.
                            </p>
                        </div>
                    </template>
                </Card>

                <!-- Developer Info -->
                <Card class="about-card">
                    <template #title>
                        <div class="card-title">
                            <AccountOutline :size="24" fillColor="#3b82f6" />
                            <span>About the Developer</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="developer-section">
                            <div class="developer-info">
                                <h3>Valerie M. Hernández Fernández</h3>
                                <div class="developer-details">
                                    <div class="detail-item">
                                        <MapMarker :size="18" fillColor="#3b82f6" />
                                        <span>Costa Rica</span>
                                    </div>
                                    <div class="detail-item">
                                        <GithubIcon :size="18" fillColor="#3b82f6" />
                                        <a
                                            href="https://github.com/valeriehernandez-7"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="github-link"
                                        >
                                            @valeriehernandez-7
                                        </a>
                                    </div>
                                </div>
                                <p class="developer-story">
                                    As a Costa Rican engineering student, I have witnessed firsthand the
                                    impact of seismic activity in a country known for its
                                    significant geological dynamism. Costa Rica's location along the
                                    Pacific Ring of Fire means earthquakes are a regular part of
                                    life, inspiring me to create a tool that makes earthquake data
                                    more accessible and understandable.
                                </p>
                                <p class="developer-story">
                                    QuakeX represents a convergence of my passion for technology,
                                    data analytics, and community resilience. This project is
                                    developed entirely for academic purposes, demonstrating the
                                    power of modern web technologies and open data initiatives.
                                </p>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- Richter Scale -->
                <Card class="about-card richter-card">
                    <template #title>
                        <div class="card-title">
                            <ChartLine :size="24" fillColor="#3b82f6" />
                            <span>Understanding the Richter Scale</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="richter-content">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/f/f6/How-the-Richter-Magnitude-Scale-is-determined.jpg"
                                alt="Richter Scale Diagram"
                                class="richter-image"
                            />
                            <p class="richter-description">
                                The Richter scale measures the magnitude of earthquakes on a
                                logarithmic scale. Each whole number increase represents a tenfold
                                increase in measured amplitude and approximately 31.6 times more
                                energy release. Modern seismology uses the moment magnitude scale
                                (Mw) for more accurate measurements, which QuakeX displays for all
                                recorded events.
                            </p>
                        </div>
                    </template>
                </Card>

                <!-- Technology Stack -->
                <Card class="about-card">
                    <template #title>
                        <div class="card-title">
                            <CodeBraces :size="24" fillColor="#3b82f6" />
                            <span>Open Source APIs & Technologies</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="tech-list">
                            <div class="tech-item">
                                <div class="tech-icon">
                                    <Database :size="32" fillColor="#3b82f6" />
                                </div>
                                <div class="tech-details">
                                    <strong>USGS Earthquake Catalog API</strong>
                                    <a
                                        href="https://earthquake.usgs.gov/fdsnws/event/1/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        earthquake.usgs.gov/fdsnws/event/1/
                                    </a>
                                    <p>
                                        Real-time and historical earthquake data from the United
                                        States Geological Survey
                                    </p>
                                </div>
                            </div>

                            <div class="tech-item">
                                <div class="tech-icon">
                                    <WeatherPartlyCloudy :size="32" fillColor="#3b82f6" />
                                </div>
                                <div class="tech-details">
                                    <strong>Open-Meteo Historical Weather API</strong>
                                    <a
                                        href="https://open-meteo.com/en/docs/historical-weather-api"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        open-meteo.com/historical-weather-api
                                    </a>
                                    <p>
                                        Historical weather data for contextual analysis of seismic
                                        events
                                    </p>
                                </div>
                            </div>

                            <div class="tech-item">
                                <div class="tech-icon">
                                    <ImageFilterHdr :size="32" fillColor="#3b82f6" />
                                </div>
                                <div class="tech-details">
                                    <strong>Open-Meteo Elevation API</strong>
                                    <a
                                        href="https://open-meteo.com/en/docs/elevation-api"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        open-meteo.com/elevation-api
                                    </a>
                                    <p>
                                        Precise elevation data for geographic context of earthquake
                                        locations
                                    </p>
                                </div>
                            </div>

                            <div class="tech-item">
                                <div class="tech-icon">
                                    <Earth :size="32" fillColor="#3b82f6" />
                                </div>
                                <div class="tech-details">
                                    <strong>REST Countries API</strong>
                                    <a
                                        href="https://restcountries.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        restcountries.com
                                    </a>
                                    <p>
                                        Comprehensive country information for geographic data
                                        enrichment
                                    </p>
                                </div>
                            </div>

                            <div class="tech-item">
                                <div class="tech-icon">
                                    <ServerNetwork :size="32" fillColor="#3b82f6" />
                                </div>
                                <div class="tech-details">
                                    <strong>Apache Drill</strong>
                                    <a
                                        href="https://drill.apache.org/docs/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        drill.apache.org/docs/
                                    </a>
                                    <p>
                                        Schema-free SQL query engine for JSON data analytics and
                                        complex aggregations
                                    </p>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- Repository -->
                <Card class="about-card repo-card">
                    <template #title>
                        <div class="card-title">
                            <GithubIcon :size="24" fillColor="#3b82f6" />
                            <span>Open Source Repository</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="repo-section">
                            <p>
                                QuakeX is open source and available on GitHub. Explore the code,
                                contribute improvements, or fork the project for your own needs.
                            </p>
                            <Button
                                label="View on GitHub"
                                icon="pi pi-github"
                                class="github-button"
                                @click="openRepository"
                                raised
                            />
                        </div>
                    </template>
                </Card>

                <!-- Academic Notice -->
                <Card class="about-card academic-card">
                    <template #content>
                        <div class="academic-notice">
                            <SchoolOutline :size="32" fillColor="#6366f1" />
                            <div class="notice-text">
                                <strong>Academic Project</strong>
                                <p>
                                    This project is developed exclusively for academic and
                                    educational purposes. While the data sources are authoritative
                                    and reliable, QuakeX is not intended for emergency response or
                                    critical decision-making. Always consult official sources for
                                    earthquake warnings and safety information.
                                </p>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- Footer -->
                <div class="about-footer">
                    <p>
                        &copy; 2025 QuakeX - Earthquake Data Explorer.
                    </p>
                    <p class="footer-links">
                        <a
                            href="https://github.com/valeriehernandez-7/QuakeX-EarthquakExplorer"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Repository
                        </a>
                        •
                        <a
                            href="https://earthquake.usgs.gov/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            USGS
                        </a>
                        •
                        <a
                            href="https://drill.apache.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Apache Drill
                        </a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Icons
import Transition from 'vue-material-design-icons/Transition.vue'
import InformationOutline from 'vue-material-design-icons/InformationOutline.vue'
import StarOutline from 'vue-material-design-icons/StarOutline.vue'
import CheckCircle from 'vue-material-design-icons/CheckCircle.vue'
import AlertCircle from 'vue-material-design-icons/AlertCircle.vue'
import AccountOutline from 'vue-material-design-icons/AccountOutline.vue'
import MapMarker from 'vue-material-design-icons/MapMarker.vue'
import GithubIcon from 'vue-material-design-icons/Github.vue'
import ChartLine from 'vue-material-design-icons/ChartLine.vue'
import CodeBraces from 'vue-material-design-icons/CodeBraces.vue'
import Database from 'vue-material-design-icons/Database.vue'
import WeatherPartlyCloudy from 'vue-material-design-icons/WeatherPartlyCloudy.vue'
import ImageFilterHdr from 'vue-material-design-icons/ImageFilterHdr.vue'
import Earth from 'vue-material-design-icons/Earth.vue'
import ServerNetwork from 'vue-material-design-icons/ServerNetwork.vue'
import SchoolOutline from 'vue-material-design-icons/SchoolOutline.vue'

/**
 * Open GitHub repository
 */
function openRepository() {
    window.open('https://github.com/valeriehernandez-7/QuakeX-EarthquakExplorer', '_blank')
}
</script>

<style scoped>
.about-view {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.about-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
}

/* Header */
.about-header {
    text-align: center;
    padding: 3rem 0;
    color: white;
}

.logo-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 1rem;
}

.header-text h1 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.tagline {
    font-size: 1.25rem;
    margin: 0.5rem 0 0 0;
    opacity: 0.95;
}

/* Content Grid */
.content-grid {
    display: grid;
    gap: 2rem;
    grid-template-columns: 1fr;
}

.about-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color);
}

.card-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.card-content p {
    line-height: 1.7;
    color: var(--text-color);
    margin: 0;
}

/* Features List */
.features-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.feature-item {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
}

.feature-text {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.feature-text strong {
    color: var(--text-color);
    font-size: 1.05rem;
}

.feature-text span {
    color: var(--text-color-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
}

/* Developer Section */
.developer-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.developer-info h3 {
    margin: 0 0 1rem 0;
    color: var(--text-color);
    font-size: 1.5rem;
}

.developer-details {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
}

.github-link {
    color: #3b82f6;
    text-decoration: none;
    transition: color 0.2s;
}

.github-link:hover {
    color: #2563eb;
    text-decoration: underline;
}

.developer-story {
    line-height: 1.7;
    color: var(--text-color);
    margin: 0 0 1rem 0;
}

/* Richter Scale */
.richter-card {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.richter-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
}

.richter-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.richter-description {
    text-align: center;
    line-height: 1.7;
    color: var(--text-color);
    margin: 0;
}

/* Technology Stack */
.tech-list {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.tech-item {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
}

.tech-icon {
    flex-shrink: 0;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-50);
    border-radius: 8px;
}

.tech-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.tech-details strong {
    font-size: 1.1rem;
    color: var(--text-color);
}

.tech-details a {
    color: #3b82f6;
    text-decoration: none;
    font-size: 0.9rem;
    word-break: break-all;
}

.tech-details a:hover {
    text-decoration: underline;
}

.tech-details p {
    margin: 0;
    color: var(--text-color-secondary);
    line-height: 1.6;
    font-size: 0.95rem;
}

/* Repository Card */
.repo-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.repo-card :deep(.p-card-title) {
    color: white;
}

.repo-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
    text-align: center;
}

.repo-section p {
    color: rgba(255, 255, 255, 0.95);
    font-size: 1.1rem;
    line-height: 1.7;
    margin: 0;
}

.github-button {
    background: white !important;
    color: #667eea !important;
    border: none !important;
    font-weight: 600;
    padding: 0.75rem 2rem;
    font-size: 1.05rem;
}

.github-button:hover {
    background: #f3f4f6 !important;
}

/* Academic Notice */
.academic-card {
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
    border: 2px solid #6366f1;
}

.academic-notice {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
}

.notice-text {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.notice-text strong {
    font-size: 1.25rem;
    color: #6366f1;
}

.notice-text p {
    margin: 0;
    line-height: 1.7;
    color: var(--text-color);
}

/* Footer */
.about-footer {
    text-align: center;
    padding: 3rem 0 1rem 0;
    color: white;
}

.about-footer p {
    margin: 0.5rem 0;
    opacity: 0.9;
}

.footer-links {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.footer-links a {
    color: white;
    text-decoration: none;
    transition: opacity 0.2s;
}

.footer-links a:hover {
    opacity: 0.8;
    text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
    .about-container {
        padding: 1rem;
    }

    .logo-section {
        flex-direction: column;
        gap: 1rem;
    }

    .header-text h1 {
        font-size: 2rem;
    }

    .tagline {
        font-size: 1rem;
    }

    .developer-details {
        flex-direction: column;
        gap: 0.75rem;
    }

    .tech-item {
        flex-direction: column;
        gap: 1rem;
    }

    .academic-notice {
        flex-direction: column;
        text-align: center;
    }

    .footer-links {
        flex-direction: column;
        gap: 0.5rem;
    }
}
</style>
