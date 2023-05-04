import Vue from 'vue';
import App from './App.vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import 'cropperjs/dist/cropper.css';
import VueCropper from 'vue-cropperjs';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

Vue.use(Vuetify);
Vue.use(VueCropper);
Vue.use(Loading);
const vuetify = new Vuetify();
Vue.config.productionTip = false;

new Vue({
  vuetify,
  render: h => h(App),
}).$mount('#app');
