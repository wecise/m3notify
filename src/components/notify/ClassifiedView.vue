<template>
  <el-container style="height: calc(100vh - 135px);">
    <el-main style="padding:0px;">
        <Split :gutterSize="0" style="display:flex;">
            <SplitArea :size="0" :minSize="0" style="overflow:hidden;background:#f2f2f2;">
                <TagTreeView :model="{domain:'notifySituation'}" :fun="onRefreshByTag" ref="notifySituationTagTree"></TagTreeView>
            </SplitArea>
            <SplitArea :size="100" :minSize="0" style="overflow:hidden;">
                <el-container>
                  <el-header style="position: relative;height:40px;line-height:40px;">
                    <el-tooltip content="刷新">
                      <el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
                    </el-tooltip>
                    <el-tooltip content="新建规则">
                      <el-button type="text" icon="el-icon-plus" @click="onNew"></el-button>
                    </el-tooltip>
                    <el-tooltip content="导出">
                      <el-button type="text" icon="el-icon-download"></el-button>
                    </el-tooltip>
                  </el-header>
                  <el-main>
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
                                  <div style="height:30px;line-height:30px;" v-if="item.field=='tags'">
                                      <TagView domain='notifySituation' :model.sync="scope.row.tags" :id="scope.row.id" :limit="1"></TagView>
                                  </div>
                                  <div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
                                      v-else-if="typeof item.render === 'function'">
                                  </div>
                                  <div v-else>
                                      {{scope.row[item.field]}}
                                  </div>
                              </template>
                          </el-table-column>
                      </template>
                      <el-table-column label="操作"  width="180" fixed="right">
                        <template slot="header" slot-scope="scope">
                            <el-input v-model="dt.search" clearable placeholder="关键字"></el-input>
                        </template>
                        <template slot-scope="scope">
                          <el-button type="text" @click="onEdit(scope.$index, scope.row)"> 编辑</el-button>
                          <el-button type="text" @click="onDelete(scope.$index, scope.row)"> 删除</el-button>
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
          
          <el-form-item label="数据源">
              <el-input v-model="dialog.classified.datasource.class" disabled>
                  <el-dropdown slot="prepend">
                      <span class="el-dropdown-link">
                          <i class="el-icon-coin el-icon--right" style="cursor:pointer;"></i>
                      </span>
                      <el-dropdown-menu slot="dropdown">
                          <DatasourceView :root="dialog.classified.datasource.root" 
                              @node-click="onDataSourceSelect"></DatasourceView>
                      </el-dropdown-menu>
                  </el-dropdown>
              </el-input>
          </el-form-item>
          
          <el-form-item label="场景条件" prop="situation">
            <el-tabs v-model="dialog.activeTab" type="border-card" @tab-click="onTabClick" v-if="dialog.classified.show">
              <el-tab-pane label="基本" name="base" >
                  <props-view :fields="dialog.classified.datasource.data.fields" 
                    @update-props="onUpdateProps"
                    v-if="dialog.classified.datasource.data"></props-view>
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
          <el-button @click="onClose">取 消</el-button>
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
                class: "",
                data: null
            },
            data: {
              name: "",
              parent:"-1",
              situation:"",
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
                return !val || JSON.stringify(data).includes(val.toLowerCase())
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
        this.tree.data = [{ id:"-1",parent:'/我的分类',name:'我的分类',children: children}];

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

      if(_.isNull(this.editor.value)){
        this.dialog.activeTab = 'base';
      }else{
        this.dialog.activeTab = 'adv';
      }
    },
    onDelete(index,item){
      console.log(index)
      this.$confirm(`确认要删除该分类：${item.name}？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).then(() => {
          
          let param = encodeURIComponent( JSON.stringify({action: "delete", model:item}) );

          this.m3.callFS("/matrix/m3event/notify/situationAction.js",param).then(()=>{
            this.$message({
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
          
          
      })
    },
    onRefresh(){
      this.initData();
    },
    onClose(){
      this.dialog.classified.show = false;
      this.onRefresh();
    },
    onSave(){
      this.dialog.classified.data.situation = this.dialog.classified.data.situation.replace(/\'/g,"''");
      let param = encodeURIComponent( JSON.stringify({action: this.dialog.classified.action, model:this.dialog.classified.data}) );
      this.m3.callFS("/matrix/m3event/notify/situationAction.js",param).then(()=>{
        this.$message({
            type: "success",
            message: this.dialog.classified.action=='add'?"新建成功":'更新成功'
          })  
        this.initData();
        this.dialog.classified.show = false;
      }).catch((err)=>{
          this.$message({
            type: "error",
            message: this.dialog.classified.action=='add'?"新建失败 ":"更新失败 " + err.message
          })
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
    },
    onEditorInit(){
        require("brace/ext/language_tools"); //language extension prerequsite...
        require(`brace/mode/${this.editor.lang.value}`); //language
        require(`brace/snippets/${this.editor.lang.value}`); //snippet
        require(`brace/theme/${this.editor.theme.value}`); //language
        this.initEditor();
    },
    onUpdateProps(data){
      this.dialog.classified.data.situation = data;
    },
    onTabClick(tab){
      if(tab.name === 'adv'){
        this.$emit('refresh-props');
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