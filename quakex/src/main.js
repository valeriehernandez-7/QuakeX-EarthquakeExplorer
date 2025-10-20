import './assets/main.css' // CSS imports

import { createApp } from 'vue'
import { createPinia } from 'pinia' // https://pinia.vuejs.org/

// PrimeVue imports
import PrimeVue from 'primevue/config' // https://primevue.org/configuration/
import Aura from '@primeuix/themes/aura' // https://primevue.org/theming/styled/#presets
import ToastService from 'primevue/toastservice' // https://primevue.org/toast/#toast-service

// PrimeVue Components https://primevue.org/{component}/
import ProgressSpinner from 'primevue/progressspinner'
import Menubar from 'primevue/menubar'
import Toolbar from 'primevue/toolbar'
import Drawer from 'primevue/drawer'
import Skeleton from 'primevue/skeleton'
import Panel from 'primevue/panel'
import Divider from 'primevue/divider'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import Slider from 'primevue/slider'
import DatePicker from 'primevue/datepicker'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import Toast from 'primevue/toast'
import Message from 'primevue/message'
import Chip from 'primevue/chip'
import Avatar from 'primevue/avatar'
import Chart from 'primevue/chart'
import IconField from 'primevue/iconfield'
import InputText from 'primevue/inputtext'
import InputIcon from 'primevue/inputicon'

import App from './App.vue'
import router from './router' // https://router.vuejs.org/

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ToastService)

// PrimeVue configuration
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: false, // system | light | dark
            cssLayer: false,
        },
    },
    ripple: true, // Enable ripple effects if desired
})

// Register PrimeVue components
app.component('ProgressSpinner', ProgressSpinner)
app.component('Menubar', Menubar)
app.component('Toolbar', Toolbar)
app.component('Drawer', Drawer)
app.component('Skeleton', Skeleton)
app.component('Panel', Panel)
app.component('Divider', Divider)
app.component('Button', Button)
app.component('Card', Card)
app.component('Dialog', Dialog)
app.component('Badge', Badge)
app.component('Tag', Tag)
app.component('Slider', Slider)
app.component('DatePicker', DatePicker)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('ColumnGroup', ColumnGroup)
app.component('Row', Row)
app.component('Toast', Toast)
app.component('Message', Message)
app.component('Chip', Chip)
app.component('Avatar', Avatar)
app.component('Chart', Chart)
app.component('IconField', IconField)
app.component('InputText', InputText)
app.component('InputIcon', InputIcon)

app.mount('#app')

// TODO: delete after testing
import { monthlyManager } from '@/services/monthlyDataManagerService.js'
if (import.meta.env.DEV) {
    window.monthlyManager = monthlyManager
    console.log('monthlyManager exposed globally for testing')
    console.log('Available methods:')
    console.log('- monthlyManager.ensureRecentData()')
    console.log('- monthlyManager.generateMonth("2025-07")')
    console.log('- monthlyManager.getAvailableMonths()')
}
