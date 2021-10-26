<template>
  <NotifyView :global="global"></NotifyView>
</template>

<script>


//import NotifyView from './notify/NotifyView';


export default {
  name: "MainView",
  props: {
    global: Object
  },
  components:{
    NotifyView: resolve => {require(['./notify/NotifyView.vue'], resolve)}
  },
  data() {
    return {
    
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.el-header {
  height: 40px!important;
  padding: 0px;
}

.el-main {
  padding: 0px;
  overflow: hidden;
}
.el-input-group__prepend > .el-select {
  width: 120px;
}
</style>
