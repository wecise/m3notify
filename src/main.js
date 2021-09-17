import Vue from 'vue'
import App from './App.vue'
import Cookies from 'js-cookie'
import './plugins/element.js'
import VueI18n from 'vue-i18n'
//import enLang from 'element-ui/lib/locale/lang/en'
const themeColor = {dark:'#252D47',light:'#409EFF'};
const theme = Cookies.get("m3-theme")?themeColor[Cookies.get("m3-theme")]:'#252D47';// dark:#252D47 & blue:#409EFF  default theme is dark
import(`./assets/theme/element-${theme}/index.css`)
import moment from 'moment'
import animate from 'animate.css'
import VueSplit from 'vue-split-panel'
import './js/dialog'
import './icons'

Vue.use(VueSplit);
Vue.use(animate);
Vue.use(VueI18n);


Vue.prototype.moment = moment;
Vue.prototype.moment.locale(window.M3_LANG);
Vue.prototype.eventHub = new Vue();

Vue.prototype.openLoading = function(target) {
  const loading = this.$loading({           // 声明一个loading对象
    lock: true,                             // 是否锁屏
    text: '',                     // 加载动画的文字
    spinner: 'el-icon-loading',             // 引入的loading图标
    background: 'rgba(0, 0, 0, 0)',       // 背景颜色
    target: `.${target}`,                    // 需要遮罩的区域
    body: false,                              
    customClass: 'mask'                     // 遮罩层新增类名
  })
  setTimeout(function () {                  // 设定定时器，超时5S后自动关闭遮罩层，避免请求失败时，遮罩层一直存在的问题
    loading.close();                        // 关闭遮罩层
  },5000)
  return loading;
};

Vue.config.productionTip = false;

/* 
 * 测试环境
*/
const m3 = require("@wecise/m3js");
Vue.prototype.m3 = m3;
window.m3 = m3;
window.moment = moment;
window.M3_LANG = 'zh-CN';

let init = async function(){

  await m3.lang().then( res=>{
    
    window.global = m3.global;

    const i18n = new VueI18n({
      locale: window.M3_LANG,
      //locale: enLang,
      messages: res
    });


    Vue.prototype.$ELEMENT = { 
      size: Cookies.get('size') || 'small',
      i18n: (key, value) => i18n.t(key, value)
    };

    new Vue({
      render: h => h(App),
      i18n
    }).$mount('#app')
  })
};


if(process.env.NODE_ENV === "development"){

  m3.connect({company: process.env.VUE_APP_M3_COMPANY, username: process.env.VUE_APP_M3_USERNAME, password: process.env.VUE_APP_M3_PASSWORD }).then( ()=>{
    setTimeout(()=>{
      init();
    },500)
  }).catch((err)=>{
    console.log(err);
  });
  
} else {
  m3.init();
  init();
}
