<template>
  <el-container style="height: calc(100vh - 135px);">
    <el-main style="padding:0px;">
        <Split :gutterSize="0" style="display:flex;">
            <SplitArea :size="0" :minSize="0" style="overflow:hidden;background:#f2f2f2;">
                <TagTreeView :model="{domain:'notifySituation'}" :fun="onRefreshByTag" ref="notifySituationTagTree"></TagTreeView>
            </SplitArea>
            <SplitArea :size="100" :minSize="0" style="overflow:hidden;">
                <el-container>
                  <el-header style="position: relative;line-height:60px;display:flex;">
                      <span style="width:70%;">
                        <el-tooltip content="刷新">
                          <el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
                        </el-tooltip>
                        <el-tooltip content="新建规则">
                          <el-button type="success" icon="el-icon-plus" @click="onNew" size="mini">新建规则</el-button>
                        </el-tooltip>
                      </span>
                      <span style="width:30%;text-align:right;">
                          <el-input v-model="dt.search" clearable placeholder="关键字过滤" size="mini"></el-input>
                      </span>
                  </el-header>
                  <el-main style="padding-top:0px;">
                    <el-table
                      v-loading="dt.loading"
                      element-loading-spinner="el-icon-loading"
                      border
                      stripe
                      :data="dt.rows"
                      :row-class-name="rowClassName"
                      height="calc(100vh - 255px)"
                      style="width: 100%"
                      ref="table">
                      <template v-for="(item,index) in dt.columns">
                          <el-table-column 
                              :prop="item.field"
                              :label="item.title" 
                              sortable 
                              show-overflow-tooltip
                              :key="index"
                              :width="item.width"
                              :formatter="item.render"
                              v-if="item.visible">
                              <template slot-scope="scope">
                                  <div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
                                      v-if="typeof item.render === 'function'">
                                  </div>
                                  <template v-else>
                                    <div style="height:30px;line-height:30px;" v-if="item.field=='tags'">
                                        <TagView domain='notifySituation' :model.sync="scope.row.tags" :id="scope.row.id" :limit="1"></TagView>
                                    </div>
                                    <div style="display:flex;flex-wrap:wrap;" v-else-if="item.field === 'situation'">
                                        <el-popover
                                            width="550"
                                            trigger="click">
                                            <el-input type="textarea" :value="scope.row[item.field]" :rows="6" style="width:98%;white-space:nowrap;"></el-input>
                                            <el-button type="text" slot="reference">{{ scope.row[item['field']] }} <i class="el-icon-tickets"></i></el-button>
                                        </el-popover>
                                    </div>
                                    <div v-else>
                                        {{scope.row[item.field]}}
                                    </div>
                                  </template>
                              </template>
                          </el-table-column>
                      </template>
                      <el-table-column label="操作"  width="160" fixed="right">
                        <template slot-scope="scope">
                          <el-button type="text" icon="el-icon-edit" @click="onEdit(scope.$index, scope.row)"> 编辑</el-button>
                          <el-button type="text" icon="el-icon-delete" @click="onDelete(scope.$index, scope.row)"> 删除</el-button>
                          <el-switch v-model="scope.row['status']" 
                              active-color="#13ce66" 
                              inactive-color="#ff4949"
                              :active-value="1"
                              :inactive-value="0"
                              style="padding-left:10px;display:none;"
                              @change="onToggleStatus(scope.row)"></el-switch>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-main>
              </el-container>
            </SplitArea>
        </Split>
    </el-main>
    <el-footer style="height:40px;line-height:40px;background:#f2f2f2;">
        {{ dt.info.join(' &nbsp; | &nbsp;') }}
    </el-footer>
    <!-- 规则管理 -->
    <el-dialog
        title="规则管理"
        :visible.sync="dialog.classified.show"
        :append-to-body="true"
        :close-on-press-escape="false"
        :close-on-click-modal="false"
        class="classified-dialog">
        <el-form :model="dialog.classified.data"  :rules="dialog.classified.rules" ref="classifiedForm" label-width="100px">
          

          <el-form-item label="父节点" prop="parent">
            <el-input v-model="dialog.classified.data.parent" disabled></el-input>
          </el-form-item>

          <el-form-item label="名称" prop="name">
            <el-input v-model="dialog.classified.data.name" :disabled="dialog.classified.action==='update'?true:false"></el-input>
          </el-form-item>
          
          <el-form-item label="数据源" v-if="dialog.classified.data.sourceconfig.situation==='base'">
              <el-input v-model="dialog.classified.datasource.class" disabled>
                  <el-dropdown slot="prepend">
                      <span class="el-dropdown-link">
                          <i class="el-icon-coin el-icon--right" style="cursor:pointer;"></i>
                      </span>
                      <el-dropdown-menu slot="dropdown">
                          <DatasourceView 
                              :root="dialog.classified.datasource.root"
                              :defaultClass="dialog.classified.datasource.class"
                              @node-click="onDataSourceSelect"
                              @node-init="onDataSourceSelect"></DatasourceView>
                      </el-dropdown-menu>
                  </el-dropdown>
              </el-input>
          </el-form-item>

          <el-form-item :label="dialog.classified.data.sourceconfig.mode==='1'?'生产模式':'测试模式'" prop="mode">
            <el-switch
              v-model="dialog.classified.data.sourceconfig.mode"
              active-color="#13ce66"
              inactive-color="#dddddd"
              active-value="1"
              inactive-value="0"
              @change="onToggleMode">
            </el-switch>
            <span class="el-icon-question" style="font-size:10px;color:#999999;padding-left:10px;">测试模式下用户可自定义任意条件，生产模式会增加 limit 和 status 条件【 limit -1：代表所有事件，status: 20（已发送）】</span>
          </el-form-item>
          
          <el-form-item label="场景条件" prop="situation">
            
            <el-tabs v-model="dialog.activeTab" type="border-card" @tab-click="onTabClick" v-if="dialog.classified.show">
              <el-tab-pane label="基本" name="base" v-if="dialog.classified.data.sourceconfig.situation==='base'">
                  <props-view 
                    :fields="dialog.classified.datasource.data.fields" 
                    :selected="dialog.classified.data.sourceconfig.fields"
                    @update-props="onUpdateProps"
                    @selected-props="onSetSourceConfig"
                    v-if="dialog.classified.datasource.data"
                    ref="propsView"></props-view>
              </el-tab-pane>
              <el-tab-pane label="高级" name="adv">
                  <VueEditor
                      v-model="dialog.classified.data.situation"
                      @init="onEditorInit"
                      :lang="editor.lang.value"
                      :theme="editor.theme.value"
                      width="inherit"
                      height="30vh"
                      style="border:1px solid #f2f2f2;"
                      ref="editorRef"
                  ></VueEditor>
              </el-tab-pane>
            </el-tabs>
            
          </el-form-item>

          <el-form-item label="状态" prop="status" style="display:none;">
            <el-switch
              v-model="dialog.classified.data.status"
              active-color="#13ce66"
              inactive-color="#dddddd"
              :active-value="1"
              :inactive-value="0">>
            </el-switch>
          </el-form-item>
          
        </el-form>
        
        <span slot="footer" class="dialog-footer">
          <el-button @click="onClose">关 闭</el-button>
          <el-button type="primary" @click="onSave">确 定</el-button>
        </span>
      </el-dialog>
  </el-container>
    
</template>

<script>
import _ from 'lodash';
import TagView from '../tags/TagView';
import TagTreeView from '../tags/TagTreeView';
import DatasourceView from './DatasourceView';
import PropsView from './PropsView.vue';

export default {
  name: "ClassifiedView",
  components:{
    VueEditor: require("vue2-ace-editor"),
    TagView,
    TagTreeView,
    PropsView,
    DatasourceView
  },
  data() {
    return {
      tree: {
        data: [],
        defaultProps:{
          children: 'children',
          label: 'name'
        }
      },
      dt: {
        loading: false,
        rows:[],
        columns: [],
        selected: [],
        search: "",
        info: []
      },
      dialog:{
        activeTab:'base',
        classified:{
            show: false,
            datasource: {
                root: "/matrix/devops",
                fields: [],
                class: "/matrix/devops/alert_status",
                data: null
            },
            data: {
              name: "",
              parent:"-1",
              situation:"",
              sourceconfig:{
                mode: "0",
                fields: "",
                class: "",
                situation:'base'
              },
              status:1
            },
            rules: {
                name:[
                  { required: true, message: '请输入名称', trigger: 'blur' }
                ]
            },
            action: "add"            
        }
      },
      editor: {
          value: "",
          loading: false,
          lang: {
              value: "sql",
              list: []
          },
          theme: {
              value: "merbivore",
              list: this.m3.theme.EDITOR_THEME
          }
      }
    };
  },
  watch:{
    'dt.search':{
        handler(val){
          if(_.isEmpty(val)){
            this.initData();
          }else {
            this.dt.rows = this.dt.rows.filter(data => {
                return !val || JSON.stringify(data).includes(val) || JSON.stringify(data).toLowerCase().includes(val)
            })
          }
        }
    },
    'dt.rows': {
          handler(val){

              if(val){
                  
                  this.dt.info = [];
                  this.dt.info.push(`共 ${val.length} 项`);
                  //this.dt.info.push(`已选择 ${this.dt.selected.length} 项`);
                  this.dt.info.push(`操作时间： ${this.moment().format("YYYY-MM-DD HH:mm:ss.SSS")}`);

              }
          },
          immediate:true
      },
      'dt.selected': {
          handler(val){
              this.dt.info = [];
              this.dt.info.push(`共 ${this.dt.rows.length} 项`);
              //this.dt.info.push(`已选择 ${val.length} 项`);
              this.dt.info.push(`操作时间： ${this.moment().format("YYYY-MM-DD HH:mm:ss.SSS")}`);
          }
      }
  },
  created(){
     this.initData();
  },
  methods: {
    rowClassName({rowIndex}){
        return `row-${rowIndex}`;
    },
    initData(){
      this.dt.loading = true;
      let param = encodeURIComponent( JSON.stringify({action:'list'}) );
      this.m3.callFS("/matrix/m3event/notify/situationAction.js",param).then(res=>{
        this.dt.rows = res.message.rows;
        this.dt.columns = _.map(res.message.columns,v=>{
        
                              
          if(_.isUndefined(v.visible)){
            _.extend(v, { visible: true });
          }

          if(!v.render){
            return v;
          } else {
            return _.extend(v, { render: eval(v.render) });
          }
          

        });

        this.$nextTick(()=>{
          this.$refs.table.doLayout();
        })
        setTimeout(()=>{
          this.$refs.table.doLayout();
        },1000)

        let children = res.message.rows;
        this.tree.data = [{ id:"-1",parent:'/通知规则',name:'通知规则',children: children}];

        this.dt.loading = false;
      }).catch(err=>{
        console.error(err);
        this.dt.loading = false;
      })
    },
    onReset(){
      if(this.$refs['classifiedForm']){
        this.$refs['classifiedForm'].resetFields();
      }
      this.dialog.classified.data.name = "";
      this.dialog.classified.data.parent = "-1";
      this.dialog.classified.data.situation = "";
      this.dialog.classified.data.status = 1;
    },
    onNew(){
      this.onReset();
      this.dialog.classified.action = "add";
      this.dialog.classified.show = true;
    },
    onEdit(index,row){
      
      this.dialog.classified.data = row;
      this.dialog.classified.action = "update";

      this.dialog.classified.show = true;

      /* if(_.isNull(this.editor.value)){
        this.dialog.activeTab = 'base';
      }else{
        this.dialog.activeTab = 'adv';
      } */

      this.dialog.activeTab = this.dialog.classified.data.sourceconfig.situation;
    },
    onDelete(index,item){
      
      this.$confirm(`确认要删除该通知规则：${item.name}？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
      }).then(() => {

          // 检查是否被引用
          let param1 = encodeURIComponent( JSON.stringify({action: "check", model:item}) );
          this.m3.callFS("/matrix/m3event/notify/situationAction.js",param1).then((rtn)=>{
            
            if(rtn.message > 0){
              this.$message({
                      effect: 'dark',
                      type: 'warning',
                      message: '该规则已被引用，请确认'
              });
              return false;
            }else{
              
              let param = encodeURIComponent( JSON.stringify({action: "delete", model:item}) );

              this.m3.callFS("/matrix/m3event/notify/situationAction.js",param).then(()=>{
                this.$message({
                        effect: 'dark',
                        type: 'success',
                        message: '删除成功'
                });
                this.initData();
              }).catch((err)=>{
                this.$message({
                    type: 'error',
                    message: '删除失败 ' + err.message
                });
              });
            }
          })  
      })
    },
    onRefresh(){
      this.initData();
    },
    onClose(){

      // this.$refs.propsView.onRemoveAll();
      
      this.dialog.classified.show = false;

      // reset
      this.dialog.activeTab = 'base';
      this.dialog.classified.data = {
                              name: "",
                              parent:"-1",
                              situation:"",
                              sourceconfig:{
                                mode: "0",
                                fields: "",
                                class: "",
                                situation:'base'
                              },
                              status:1
                            };
      
      this.dialog.classified.action = "add";
      
      this.onRefresh();
    },
    onSave(){
      
      this.dialog.classified.data.sourceconfig.situation = this.dialog.activeTab;

      if(this.dialog.activeTab === 'base'){

        if(this.dialog.classified.data.sourceconfig.mode === '1'){
          this.dialog.classified.data.situation = `${this.$refs.propsView.source.replace(/\'/g,"''")} and status!=20 limit -1`;
        }else{
          this.dialog.classified.data.situation = `${this.$refs.propsView.source.replace(/\'/g,"''")}`;
        }
        
      } else{
        if(this.dialog.classified.data.sourceconfig.mode === '1'){
          this.dialog.classified.data.situation = `${this.dialog.classified.data.situation.replace(/\'/g,"''").replace(/ and status!=20 limit -1/igm,'').replace(/ status!=20 limit -1/igm,'')} and status!=20 limit -1`;
        }else{
          this.dialog.classified.data.situation = `${this.dialog.classified.data.situation.replace(/\'/g,"''")}`;
        }
      }

      if(_.isEmpty(this.dialog.classified.data.situation)){
        this.$message.warning("规则条件为空，请确认");
        return false;
      }

      let check = encodeURIComponent( JSON.stringify({action: 'namecheck', model:this.dialog.classified.data}) );

      this.m3.callFS("/matrix/m3event/notify/situationAction.js",check).then(res=>{

          if(res.message && this.dialog.classified.action === 'add'){
            this.$message.warning("通知规则名称已存在，请确认");
            return false;
          } else {
            let param = encodeURIComponent( JSON.stringify({action: this.dialog.classified.action, model:this.dialog.classified.data}) );
            this.m3.callFS("/matrix/m3event/notify/situationAction.js",param).then(rtn=>{
                if(rtn.status === 'ok'){
                  this.$message({
                      type: "success",
                      message: this.dialog.classified.action=='add'?"新建成功":'更新成功'
                    })  
                  this.onClose();
                  this.initData();
                }else{
                  this.$message({
                    type: "error",
                    message: this.dialog.classified.action=='add'?"新建失败 ":"更新失败 " + rtn.message
                  })  
                }
            }).catch((err)=>{
                this.$message({
                  type: "error",
                  message: this.dialog.classified.action=='add'?"新建失败 ":"更新失败 " + err.message
                })
            }) 
          }

      }).catch(err=>{
        console.error(err);
      })
    },
    onToggleStatus(row){
      row.situation = row.situation.replace(/\'/g,"''");
      this.dialog.classified.action = "update";
      let param = encodeURIComponent(JSON.stringify({
                    action: this.dialog.classified.action,
                    model: row
                  }));
      this.m3.callFS("/matrix/m3event/notify/situationAction.js",param).then(()=>{
          
          this.$message({
            type: row.status ? "success" : "info",
            message: row.status ? "场景已启用" : "场景已禁用"
          })

      });
    },
    /* 切换生产模式 */
    onToggleMode(val){
      // 生产模式
      if(val === '1'){
        let content = this.dialog.classified.data.situation;
        let arr = [];
        arr.push(content);
        arr.push('status!=20 limit -1');
        this.dialog.classified.data.situation = arr.join(' and ');
      }else{
        let content = this.dialog.classified.data.situation;
        content = content.replace(/ and status!=20 limit -1/igm,'').replace(/ status!=20 limit -1/igm,'');
        this.dialog.classified.data.situation = content;
      }
    },
    onMouseEnter(data){
      this.$set(data, 'show', true)
    },
    onMouseLeave(data){
      this.$set(data, 'show', false)
    },
    /* 数据源选择切换 */
    onDataSourceSelect(data){
      this.dialog.classified.datasource.class = data.class;
      this.dialog.classified.datasource.data = data;
    },
    onDataFieldsSelect(data){
        this.dialog.classified.datasource.fields = data;
        let content = JSON.parse(this.dialog.classified.data.content);
        content.fields = data;
        this.dialog.classified.data.content = JSON.stringify(content,null,2);
    },
    initEditor(){
        let editor = this.$refs.editorRef.editor;
        
        editor.on('mousemove', ()=> {
            editor.resize();
        });

        editor.on('change',()=>{
            
            if(!this.$refs.propsView) return false;

            let source = this.$refs.propsView.source;
            let value = editor.getValue();
            
            if( value !== "" ){
              if(!value === source){
                this.dialog.activeTab = 'adv';
              }
            } 
        })

    },
    onEditorInit(){
        require("brace/ext/language_tools"); //language extension prerequsite...
        require(`brace/mode/${this.editor.lang.value}`); //language
        require(`brace/snippets/${this.editor.lang.value}`); //snippet
        require(`brace/theme/${this.editor.theme.value}`); //language
        this.initEditor();
    },
    onUpdateProps(data){
      // this.dialog.classified.data.situation = data;
    },
    onSetSourceConfig(data){
      this.dialog.classified.data.sourceconfig.class = this.dialog.classified.datasource.class;
      this.dialog.classified.data.sourceconfig.fields = JSON.stringify(data);
    },
    onTabClick(tab){
      if(tab.name === 'adv'){
        this.dialog.classified.data.situation = this.$refs.propsView.source;
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  
  .el-main{
    overflow: hidden;
  }
  
  .classified-dialog /deep/ .el-dialog {
    width: 70vw!important;
    height: auto;
  }
</style>