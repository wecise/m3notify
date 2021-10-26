<template>
  <el-container>
    <el-main>
        <el-tabs v-model="tabs.activeTab" type="border-card">
            <el-tab-pane :name="item.name" :key="item.name" v-for="item in tabs.list" lazy>
              <span slot="label">{{item.title}} <span @click="onTip(item)" class="el-icon-question" v-if="item.desc"></span></span>
              <NotifyRuleView v-if="item.name==='rule'"></NotifyRuleView>
              <ClassifiedView v-else-if="item.name==='classified'"></ClassifiedView>
              <TemplateView v-else-if="item.name==='template'"></TemplateView>
              <MediaView v-else-if="item.name==='media'"></MediaView>
              <SetupView v-else-if="item.name==='setup'"></SetupView>
            </el-tab-pane>
        </el-tabs>
    </el-main>
  </el-container>
</template>

<script>
import NotifyRuleView from './NotifyRuleView';
// import TemplateView from './TemplateView';
// import MediaView from './MediaView';
// import ClassifiedView from './ClassifiedView';
// import SetupView from './SetupView';

export default {
  name: "NotifyView",
  props: {
    model: Object
  },
  components: {
    NotifyRuleView,
    TemplateView: resolve => {require(['./TemplateView.vue'], resolve)},
    MediaView: resolve => {require(['./MediaView.vue'], resolve)},
    ClassifiedView: resolve => {require(['./ClassifiedView.vue'], resolve)},
    SetupView: resolve => {require(['./SetupView.vue'], resolve)}
  },
  data() {
    return {
      tabs: {
          activeTab: 'rule',
          list: [
            {name:'rule',title:'通知规则',type:'rule',data: null, desc: '设置告警通知规则，规则包括：接收人员设置、通知类型设置、场景设置、状态设置、通知模版设置'},
            {name:'classified',title:'场景管理',type:'classified',data: null, desc: '场景即为分类管理，具体定义了通知内容的筛选条件。例如：severity=5 and status=10 定义了通知内容为级别=5并且状态=10的告警才发送通知 '},
            {name:'template',title:'模版管理',type:'template',data: null, desc: '模版定义了通知的内容模版，支持HTML语法'},
            {name:'media',title:'声音媒介',type:'media',data: null, desc: '针对声音告警媒体的管理'},
            {name:'setup',title:'服务设置',type:'setup',data: null, desc: '定义了发送服务的具体配置信息，比如邮件SMTP服务器地址等信息'}
          ]
      }
    };
  },
  methods: {
    onTip(item){
        if(!item.desc) return false;
        
        const h = this.$createElement;
        this.$notify({
          title: item.title,
          duration: 15*1000,
          position: 'top-right',
          message: h('i', { style: 'color: teal'}, item.desc)
        });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  
  .el-main{
    overflow: hidden;
  }
  .el-input--mini .el-input__inner {
      border: none!important;
  }
</style>
