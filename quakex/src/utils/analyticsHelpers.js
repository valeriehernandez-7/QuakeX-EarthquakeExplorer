/**
 * Date Helpers for Analytics
 * Functions to dynamically calculate the last 3 months
 */

/**
 * Get the 3 immediate previous months from current month
 * @returns {Array<string>} Array of month keys in DESC order ['2025-10', '2025-09', '2025-08']
 */
export function getLastThreeMonths() {
    const months = []
    const now = new Date()

    // Start from previous month (not current)
    for (let i = 1; i <= 3; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        months.push(`${year}-${month}`)
    }

    return months // e.g., ['2025-10', '2025-09', '2025-08'] if current is Nov 2025
}

/**
 * Get human-readable period text
 * @param {Array<string>} [months] - Optional month array, defaults to last 3 months
 * @returns {string} "Últimos 3 meses (Ago - Oct 2025)"
 */
export function getPeriodText(months = null) {
    if (!months) {
        months = getLastThreeMonths()
    }

    const monthNames = {
        '01': 'Ene',
        '02': 'Feb',
        '03': 'Mar',
        '04': 'Abr',
        '05': 'May',
        '06': 'Jun',
        '07': 'Jul',
        '08': 'Ago',
        '09': 'Sep',
        10: 'Oct',
        11: 'Nov',
        12: 'Dic',
    }

    const newest = months[0] // e.g., "2025-10"
    const oldest = months[months.length - 1] // e.g., "2025-08"

    const [yearNew, monthNew] = newest.split('-')
    const [yearOld, monthOld] = oldest.split('-')

    const startMonth = monthNames[monthOld]
    const endMonth = monthNames[monthNew]

    // Handle year transition
    if (yearOld === yearNew) {
        return `Últimos 3 meses (${startMonth} - ${endMonth} ${yearNew})`
    } else {
        return `Últimos 3 meses (${startMonth} ${yearOld} - ${endMonth} ${yearNew})`
    }
}

/**
 * Get long period text in English
 * @param {Array<string>} [months] - Optional month array
 * @returns {string} "Last 3 months (Aug - Oct 2025)"
 */
export function getPeriodTextEnglish(months = null) {
    if (!months) {
        months = getLastThreeMonths()
    }

    const monthNames = {
        '01': 'Jan',
        '02': 'Feb',
        '03': 'Mar',
        '04': 'Apr',
        '05': 'May',
        '06': 'Jun',
        '07': 'Jul',
        '08': 'Aug',
        '09': 'Sep',
        10: 'Oct',
        11: 'Nov',
        12: 'Dec',
    }

    const newest = months[0]
    const oldest = months[months.length - 1]

    const [yearNew, monthNew] = newest.split('-')
    const [yearOld, monthOld] = oldest.split('-')

    const startMonth = monthNames[monthOld]
    const endMonth = monthNames[monthNew]

    if (yearOld === yearNew) {
        return `Last 3 months (${startMonth} - ${endMonth} ${yearNew})`
    } else {
        return `Last 3 months (${startMonth} ${yearOld} - ${endMonth} ${yearNew})`
    }
}

/**
 * Format month key to human readable
 * @param {string} monthKey - Month in format 'YYYY-MM'
 * @param {string} [language='es'] - Language 'es' or 'en'
 * @returns {string} "Julio 2025" or "July 2025"
 */
export function formatMonth(monthKey, language = 'es') {
    const monthNamesEs = {
        '01': 'Enero',
        '02': 'Febrero',
        '03': 'Marzo',
        '04': 'Abril',
        '05': 'Mayo',
        '06': 'Junio',
        '07': 'Julio',
        '08': 'Agosto',
        '09': 'Septiembre',
        10: 'Octubre',
        11: 'Noviembre',
        12: 'Diciembre',
    }

    const monthNamesEn = {
        '01': 'January',
        '02': 'February',
        '03': 'March',
        '04': 'April',
        '05': 'May',
        '06': 'June',
        '07': 'July',
        '08': 'August',
        '09': 'September',
        10: 'October',
        11: 'November',
        12: 'December',
    }

    const [year, month] = monthKey.split('-')
    const monthNames = language === 'es' ? monthNamesEs : monthNamesEn

    return `${monthNames[month]} ${year}`
}

/**
 * Get month abbreviation
 * @param {string} monthKey - Month in format 'YYYY-MM'
 * @param {string} [language='es'] - Language 'es' or 'en'
 * @returns {string} "Jul" or "Julio"
 */
export function getMonthAbbr(monthKey, language = 'es') {
    const monthNamesEs = {
        '01': 'Ene',
        '02': 'Feb',
        '03': 'Mar',
        '04': 'Abr',
        '05': 'May',
        '06': 'Jun',
        '07': 'Jul',
        '08': 'Ago',
        '09': 'Sep',
        10: 'Oct',
        11: 'Nov',
        12: 'Dic',
    }

    const monthNamesEn = {
        '01': 'Jan',
        '02': 'Feb',
        '03': 'Mar',
        '04': 'Apr',
        '05': 'May',
        '06': 'Jun',
        '07': 'Jul',
        '08': 'Aug',
        '09': 'Sep',
        10: 'Oct',
        11: 'Nov',
        12: 'Dec',
    }

    const [year, month] = monthKey.split('-')
    const monthNames = language === 'es' ? monthNamesEs : monthNamesEn

    return monthNames[month]
}

/**
 * Check if a date is within the analytics period
 * @param {Date|string} date - Date to check
 * @param {Array<string>} [months] - Month array, defaults to last 3 months
 * @returns {boolean} True if date is within period
 */
export function isDateInPeriod(date, months = null) {
    if (!months) {
        months = getLastThreeMonths()
    }

    const checkDate = new Date(date)
    const year = checkDate.getFullYear()
    const month = String(checkDate.getMonth() + 1).padStart(2, '0')
    const monthKey = `${year}-${month}`

    return months.includes(monthKey)
}

/**
 * Get date range for analytics period
 * @param {Array<string>} [months] - Month array, defaults to last 3 months
 * @returns {Object} { start: Date, end: Date }
 */
export function getAnalyticsPeriodRange(months = null) {
    if (!months) {
        months = getLastThreeMonths()
    }

    // Get oldest and newest months
    const oldest = months[months.length - 1] // '2025-08'
    const newest = months[0] // '2025-10'

    // Parse oldest month
    const [oldYear, oldMonth] = oldest.split('-').map(Number)
    const start = new Date(Date.UTC(oldYear, oldMonth - 1, 1, 0, 0, 0, 0))

    // Parse newest month - get last day
    const [newYear, newMonth] = newest.split('-').map(Number)
    const end = new Date(Date.UTC(newYear, newMonth, 0, 23, 59, 59, 999)) // Last day of month

    return { start, end }
}

/**
 * Get total days in analytics period
 * @param {Array<string>} [months] - Month array, defaults to last 3 months
 * @returns {number} Total days
 */
export function getTotalDaysInPeriod(months = null) {
    const { start, end } = getAnalyticsPeriodRange(months)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
}

/**
 * Example usage:
 *
 * import {
 *   getLastThreeMonths,
 *   getPeriodText,
 *   formatMonth
 * } from '@/utils/analyticsHelpers'
 *
 * // In your component
 * const months = getLastThreeMonths() // ['2025-10', '2025-09', '2025-08']
 * const periodText = getPeriodText(months) // "Últimos 3 meses (Ago - Oct 2025)"
 * const monthLabel = formatMonth('2025-07') // "Julio 2025"
 */
