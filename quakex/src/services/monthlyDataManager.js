/**
 * Monthly Data Manager
 * Orchestrates generation of monthly earthquake data for analytics
 */

import {
    generateMonthlyData,
    getLastMonths,
    checkMonthlyDataExists,
} from './monthlyDataGenerator.js'

class MonthlyDataManager {
    constructor() {
        this.availableMonths = new Set()
        this.loadingMonths = new Set()
        this.generationQueue = []
    }

    /**
     * Ensure recent data is available for analytics
     */
    async ensureRecentData() {
        console.log('Checking recent data availability...')

        const recentMonths = getLastMonths(3)
        const available = await this.getAvailableMonths()

        const missingMonths = recentMonths.filter((month) => !available.includes(month))

        if (missingMonths.length === 0) {
            console.log('All recent data available:', available)
            return { success: true, available, generated: [] }
        }

        console.log(`Missing months detected: ${missingMonths.join(', ')}`)
        console.log('Starting automatic data generation...')

        const generationResults = await this.generateMissingMonths(missingMonths)

        return {
            success: generationResults.every((result) => result.success),
            available: await this.getAvailableMonths(),
            generated: generationResults,
        }
    }

    /**
     * Generate data for missing months
     */
    async generateMissingMonths(months) {
        const results = []

        for (const month of months) {
            if (this.loadingMonths.has(month)) {
                console.log(`Generation already in progress for: ${month}`)
                continue
            }

            this.loadingMonths.add(month)
            try {
                console.log(`Generating data for: ${month}`)
                const result = await generateMonthlyData(month)
                results.push(result)

                if (result.success) {
                    this.availableMonths.add(month)
                    console.log(`Successfully generated data for: ${month}`)
                } else {
                    console.error(`Failed to generate data for: ${month}`, result.error)
                }
            } catch (error) {
                console.error(`Error generating data for ${month}:`, error)
                results.push({ success: false, month, error: error.message })
            } finally {
                this.loadingMonths.delete(month)
            }
        }

        return results
    }

    /**
     * Get list of available monthly data files
     */
    async getAvailableMonths() {
        try {
            const response = await fetch('http://localhost:3001/api/files')
            const data = await response.json()

            if (data.success) {
                const monthlyFiles = data.files
                    .filter(
                        (file) =>
                            file.name.startsWith('earthquakes-') && file.name.endsWith('.json'),
                    )
                    .map((file) => file.name.replace('earthquakes-', '').replace('.json', ''))

                this.availableMonths = new Set(monthlyFiles)
                return Array.from(this.availableMonths).sort().reverse() // Most recent first
            }

            return []
        } catch (error) {
            console.warn('Could not fetch available files:', error.message)
            return Array.from(this.availableMonths)
        }
    }

    /**
     * Get data generation status
     */
    getStatus() {
        return {
            availableMonths: Array.from(this.availableMonths),
            loadingMonths: Array.from(this.loadingMonths),
            queue: this.generationQueue.length,
        }
    }

    /**
     * Manually trigger generation for specific month
     */
    async generateMonth(monthKey) {
        return await generateMonthlyData(monthKey)
    }
}

// Singleton instance
export const monthlyManager = new MonthlyDataManager()
