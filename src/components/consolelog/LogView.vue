<template>
  
    <el-container>
        <el-header style="height:35px;line-height:33px;">
            <el-row style="width:100%;">
                <el-col :span="2">
                    <el-tooltip content="重新加载" >
                        <el-button type="text" @click="onLoad" icon="el-icon-refresh"></el-button>
                    </el-tooltip>    

                    <el-tooltip content="删除" >
                        <el-button type="text" @click="onDelete" icon="el-icon-close"></el-button>
                    </el-tooltip>

                    <el-tooltip content="清空" >
                        <el-button type="text" @click="onTruncate" icon="el-icon-delete"></el-button>
                    </el-tooltip>
                </el-col>
                
                <el-col :span="19" style="padding-left:10px;">
                    <el-checkbox-group v-model="consolelog.level" v-if="global">
                        <el-checkbox :label="k" :key="k" v-for="(v,k) in global.register.consolelog.level">{{v[1]}}</el-checkbox>
                    </el-checkbox-group>
                </el-col>
                <el-col :span="3" style="text-align:right;">
                    {{ control.ifRefresh==1 ? '自动刷新' : '关闭刷新' }}
                    <el-switch
                        v-model="control.ifRefresh"
                        active-color="#13ce66"
                        inactive-color="#dddddd"
                        active-value="1"
                        inactive-value="0">
                    </el-switch>
                
                    <el-tooltip content="选择主题">
                        <el-dropdown style="padding-left:10px;">
                            <span class="el-dropdown-link">
                                <svg-icon icon-class="theme"/>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item
                                v-for="group in editor.theme.list"
                                :key="group.name"
                                >
                                <el-dropdown @command="onCommand">
                                    <span class="el-dropdown-link">
                                    {{ group.name }}
                                    <i class="el-icon-arrow-down el-icon--right"></i>
                                    </span>
                                    <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item
                                        v-for="item in group.items"
                                        :key="item.name"
                                        :command="item.name"
                                        >{{ item.name }}</el-dropdown-item
                                    >
                                    </el-dropdown-menu>
                                </el-dropdown>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                            </el-dropdown>
                    </el-tooltip>
                </el-col>
            </el-row>
        </el-header>
        <el-main style="padding:0px;">
            <VueEditor
                v-model="editor.term"
                @init="onEditorInit"
                :lang="editor.lang.value"
                :theme="editor.theme.value"
                width="100%"
                height="calc(100vh - 370px)"
                style="border:1px solid #f2f2f2;"
            ></VueEditor>
        </el-main>
    </el-container>

</template>

<script>
import _ from 'lodash';

export default {
  name: "LogView",
  props: {
    // 日志类型
    logType: String,
    // 规则名称
    fullname: String,
    // 所属类
    ownerClass: {
        type: String,
        default: ""
    }
  },
  data() {
    return {
        editor: {
            term: "",
            data: null,
            loading: false,
            lang: {
                value: "lua",
                list: []
            },
            theme: {
                value: "monokai",
                list: this.m3.EDITOR_THEME
            }
        },
        dt:{
            rows:[],
            oldRows: []
        },
        consolelog: {
            level: [],
            maxtime: 0,
            mintime: 0,
            position: "",
            limit: 100
        },
        control: {
            ifRefresh: false
        },
        global: window.global
    }
  },
  components:{
      VueEditor: require("vue2-ace-editor")
  },
  watch:{
        'dt.rows':{
            handler(val){
                
                if(val !== this.dt.oldRows && !_.isEmpty(val)){
                    let arr = _.orderBy(val,['edtime'],['desc']);
                    let preFix = ['级别','时间','摘要'].join("  ");
                    let csv = _.concat(preFix,_.map(arr,(v)=>{
                        return `[${this.global.register.consolelog.level[v.level][1]}]  ${v.msg}`;
                    })).join('\n');
                    this.editor.term = csv;
                } else {
                    this.editor.term = "";
                }

                this.dt.oldRows = val;
                
            },
            deep:true
        },
        'control.ifRefresh':{
            handler(val){
                if(val==1) {
                    window.intervalListener = setInterval(()=>{
                        this.onLoad();
                    },3000);
                    this.$message({
                        type: "info",
                        message: "自动刷新开启"
                    })
                } else {
                    clearInterval(window.intervalListener);
                    this.$message({
                        type: "info",
                        message: "自动刷新关闭"
                    })
                }
            }
        },
    },
    created(){
        
        this.consolelog.level = _.keys(this.global.register.consolelog.level);

        this.onLoad();

        this.eventHub.$on("log-refresh",this.onLoad);

    },
    methods:{
        onEditorInit(){
            console.log(33,this.editor)
            require("brace/ext/language_tools"); //language extension prerequsite...
            require(`brace/mode/${this.editor.lang.value}`); //language
            require(`brace/snippets/${this.editor.lang.value}`); //snippet
            require(`brace/theme/${this.editor.theme.value}`); //language
        },
        onLoad(){
            let param = {type:this.logType, name: this.fullname.replace(/\/script/g,""),param:this.consolelog, class: this.ownerClass};
            this.m3.consolelogTrace(param).then( (rtn)=>{
                this.dt.rows = rtn.message.logs;
            })
        },
        onDelete(){
            let param = {type:this.logType,name:this.fullname.replace(/\/script/g,"")};
            this.m3.consolelogDelete(param).then( ()=>{
                this.dt.rows = [];
            })
        },
        onTruncate(){
            let param = {type:this.logType};
            this.m3.consolelogTruncate(param).then( ()=>{
                this.dt.rows = [];
            })
        },
        onCommand(val) {
            require(`brace/theme/${val}`);
            this.editor.theme.value = val;
        },
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .el-container{
        margin: -15px!important;
    }
    
</style>
