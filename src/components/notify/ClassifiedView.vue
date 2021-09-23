<template>
  <el-container>
    <el-main>
        <Split>
            <SplitArea :size="20" :minSize="0" style="overflow:hidden;">
                <el-tree 
                    node-key="id"
                    :data="tree.data" 
                    :props="tree.defaultProps" 
                    highlight-current
                    default-expand-all
                    style="background: #f2f2f2;height: 100%;"
                    ref="tree">
                    <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
                      <span v-if="data.id==-1"><svg-icon icon-class="home"/> {{node.label}}</span>
                      <span v-else><svg-icon icon-class="documentation" style="color:#03a9f4;"/> {{node.label}}</span>
                      <el-button v-show="data.show" type="text" @click="onDelete($event,data)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-delete" v-if="data.id!=-1"></el-button>
                      <el-button v-show="data.show" type="text" @click="onNew($event,data)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-plus"></el-button>
                      <el-button v-show="data.show" type="text" @click="onRefresh($event,data)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-refresh"></el-button>
                    </span>   
                  </el-tree>
                  <el-dialog
                    title="分类管理"
                    :visible.sync="dialog.classified.show"
                    :append-to-body="true"
                    class="classified-dialog">
                    <el-form :model="dialog.classified.data"  :rules="dialog.classified.rules" ref="classifiedForm" label-width="100px">
                      

                      <el-form-item label="父节点" prop="parent">
                        <el-input v-model="dialog.classified.data.parent" disabled></el-input>
                      </el-form-item>

                      <el-form-item label="名称" prop="name">
                        <el-input v-model="dialog.classified.data.name" :disabled="dialog.classified.action==='update'?true:false"></el-input>
                      </el-form-item>
                      
                      <!--el-form-item label="数据源">
                          <el-input v-model="dialog.classified.datasource.class" disabled>
                              <el-dropdown slot="prepend">
                                  <span class="el-dropdown-link">
                                      <i class="el-icon-coin el-icon--right" style="cursor:pointer;"></i>
                                  </span>
                                  <el-dropdown-menu slot="dropdown">
                                      <ActionView :root="dialog.classified.datasource.root" 
                                          @node-click="onDataSourceSelect"
                                          @treedata-loaded="initDataSourceFields"></ActionView>
                                  </el-dropdown-menu>
                              </el-dropdown>
                          </el-input>
                      </el-form-item-->
                      
                      <el-form-item label="场景条件" prop="situation">
                        <el-tabs value="base" type="border-card">
                          <el-tab-pane label="基本" name="base">
                              <props-view></props-view>
                          </el-tab-pane>
                          <el-tab-pane label="高级" name="adv">
                              <VueEditor
                                  v-model="dialog.classified.data.situation"
                                  @init="onEditorInit"
                                  :lang="editor.lang.value"
                                  :theme="editor.theme.value"
                                  width="inherit"
                                  height="calc(100vh - 450px)"
                                  style="border:1px solid #f2f2f2;"
                                  ref="editorRef"
                              ></VueEditor>
                          </el-tab-pane>
                        </el-tabs>
                        
                      </el-form-item>

                      <el-form-item label="状态" prop="status">
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
                      <el-button @click="dialog.classified.show = false">取 消</el-button>
                      <el-button type="primary" @click="onSave">确 定</el-button>
                    </span>
                  </el-dialog>
            </SplitArea>
            <SplitArea :size="80" :minSize="0" style="overflow:hidden;">
                <el-container>
                  <el-header>
                    <el-tooltip content="刷新">
                      <el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
                    </el-tooltip>
                    <el-tooltip content="导出">
                      <el-button type="text" icon="el-icon-download"></el-button>
                    </el-tooltip>
                  </el-header>
                  <el-main  style="padding:0px;height:100%;">
                    <el-table
                      :data="dt.rows"
                      :row-class-name="rowClassName"
                      style="width: 100%">
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
                                      <TagView domain='notifyTemplate' :model.sync="scope.row.tags" :id="scope.row.id" :limit="1"></TagView>
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
                      <el-table-column label="操作">
                        <template slot-scope="scope">
                          <el-button type="text" @click="onEdit(scope.$index, scope.row)"> 编辑</el-button>
                          <el-button type="text" @click="onDelete(scope.$index, scope.row)"> 删除</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-main>
              </el-container>
            </SplitArea>
        </Split>
    </el-main>
  </el-container>
    
</template>

<script>
import TagView from '../tags/TagView';
import _ from 'lodash';
import PropsView from './PropsView.vue';

export default {
  name: "ClassifiedView",
  components:{
    VueEditor: require("vue2-ace-editor"),
    TagView,
    PropsView
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
        rows:[],
        columns: [],
        selected: []
      },
      dialog:{
        classified:{
            show: false,
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
              list: this.m3.EDITOR_THEME
          }
      }
    };
  },
  created(){
     this.initData();
  },
  methods: {
    rowClassName({rowIndex}){
        return `row-${rowIndex}`;
    },
    initData(){
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
        let children = res.message.rows;
        this.tree.data = [{ id:"-1",parent:'/我的分类',name:'我的分类',children: children}];
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
      console.log(index)
      this.dialog.classified.show = true;
      this.dialog.classified.data = row;
      this.dialog.classified.action = "update";
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
    onSave(){
      let param = encodeURIComponent( JSON.stringify({action: this.dialog.classified.action, model:this.dialog.classified.data}) );
      this.m3.callFS("/matrix/m3event/notify/situationAction.js",param).then(res=>{
        console.log(res)
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
    onMouseEnter(data){
      this.$set(data, 'show', true)
    },
    onMouseLeave(data){
      this.$set(data, 'show', false)
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
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .el-container{
    height: calc(100vh - 220px)!important;
  }
  .el-header{
    height:40px!important;
    line-height:40px;
    background: #f2f2f2;
  }
  .el-main{
    padding:0px;
    overflow: hidden;
  }
</style>


<style>
  .classified-dialog .el-dialog {
    width: 70vw!important;
    height: auto;
  }
</style>