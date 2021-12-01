<template>
  <el-container style="height:calc(100vh - 135px);">
    <el-header style="position:relative;height: 40px!important;line-height: 40px!important;">
      <el-tooltip content="刷新模板">
        <el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
      </el-tooltip>
      <el-tooltip content="新建模板">
        <el-button type="text" icon="el-icon-plus" @click="onNew"></el-button>
      </el-tooltip>
      <!--el-tooltip content="导出模板">
        <el-button type="text" icon="el-icon-upload2"></el-button>
      </el-tooltip>
      <el-tooltip content="导入模板">
        <el-button type="text" icon="el-icon-download"></el-button>
      </el-tooltip-->
    </el-header>
    <el-main>
      <el-table
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
        <el-table-column label="操作" width="220" fixed="right">
            <template slot="header" slot-scope="scope">
                <el-input v-model="dt.search" clearable placeholder="关键字"></el-input>
            </template>
            <template slot-scope="scope">
              <el-button type="text" @click="onEdit(scope.$index, scope.row)"> 编辑</el-button>
              <el-button type="text" @click="onDelete(scope.$index, scope.row)"> 删除</el-button>
              <el-switch v-model="scope.row['status']" 
                  active-color="#13ce66" 
                  inactive-color="#ff4949"
                  active-value="1"
                  inactive-value="0"
                  style="padding-left:10px;"
                  @change="onToggleStatus(scope.row)"></el-switch>
            </template>
        </el-table-column>
      </el-table>
      <el-dialog
        title="新建模版"
        class="template-dialog"
        :visible.sync="dialog.template.new.show"
        :append-to-body="true"
        :show-close="false"
        :close-on-press-escape="false"
        :close-on-click-modal="false"
        :destroy-on-close="true"
        @close="onReset('newTemplateForm')"
        v-if="dialog.template.new.show">
          <div style="display:flex;flex-wrap:nowrap;">
            <el-form :model="dialog.template.new.data" :rules="dialog.template.new.rules" 
              ref="newTemplateForm" label-width="100px"
              style="width:65%;">
              
              <el-form-item label="名称" prop="name">
                <el-input v-model="dialog.template.new.data.name"></el-input>
              </el-form-item>

              <el-form-item label="数据源">
                  <el-input v-model="dialog.template.datasource.class" disabled >
                      <el-dropdown slot="prepend">
                          <span class="el-dropdown-link">
                              <i class="el-icon-coin el-icon--right" style="cursor:pointer;"></i>
                          </span>
                          <el-dropdown-menu slot="dropdown">
                              <DatasourceView :root="dialog.template.datasource.root" 
                                  @node-click="onDataSourceSelect($event,'new')"></DatasourceView>
                          </el-dropdown-menu>
                      </el-dropdown>
                  </el-input>
                  <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 选择数据源</span>
              </el-form-item>

              <el-form-item label="属性" v-if="dialog.template.datasource.data">
                  <DataFieldsView :fields="dialog.template.datasource.data.fields" 
                      @fields-change="onDataFieldsSelect($event,'new')"
                      @node-click="onDataFieldsSelect($event,'new')"
                      style="width:50%"></DataFieldsView>
                      <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 选择属性用来生成通知模版</span>
              </el-form-item>
              
              <el-form-item label="模版定义" prop="content">
                <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 通知模版由所选属性生成，也可自行调整添加常量属性，支持HTML格式化。</span>
                  <VueEditor
                      v-model="dialog.template.new.data.content"
                      @init="onEditorInit"
                      :lang="editor.lang.value"
                      :theme="editor.theme.value"
                      width="100%"
                      height="calc(100vh - 380px)"
                      style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);border: 3px solid #dddddd;border-radius: 15px;"
                      ref="editorRef"
                  ></VueEditor>
              </el-form-item>
              <el-form-item label="状态" prop="status">
                <el-switch
                  v-model="dialog.template.new.data.attr.status"
                  active-color="#13ce66"
                  inactive-color="#dddddd"
                  active-value="1"
                  inactive-value="0">>
                </el-switch>
              </el-form-item>
            </el-form>
            <div style="width:35%;margin-top:-70px;">
                
                <!-- <div v-for="(v,k) in getTemplate(dialog.template.new.data.content)" :key="k" v-if="newTemplatePriview">
                    {{k}}{{v}}
                </div> -->
                <div class="iphone">
                  <div class="iphone-top">
                    <span class="camera"></span>
                    <span class="sensor"></span>
                    <span class="speaker"></span>
                  </div>
                  <div class="iphone-screen">
                    <div v-html="newTemplatePriview" style="padding: 10px;overflow-y: auto;"></div>
                  </div>
                  <div class="iphone-bottom">
                    <span></span>
                  </div>
                </div>
            </div>
          </div>
          
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.template.new.show = false">取 消</el-button>
          <el-button @click="onReset('newTemplateForm')">重置</el-button>
          <el-button type="primary" @click="onSave" :loading="dialog.template.new.loading">确 定</el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="模版管理"
        class="template-dialog"
        :visible.sync="dialog.template.edit.show"
        :append-to-body="true"
        :show-close="false"
        :close-on-press-escape="false"
        :close-on-click-modal="false"
        :destroy-on-close="true"
        v-if="dialog.template.edit.show">
        <div style="display:flex;flex-wrap:nowrap;">
          <el-form :model="dialog.template.edit.data" :rules="dialog.template.edit.rules" 
            ref="editTemplateForm" label-width="100px"
            style="width:70%;">
            
            <el-form-item label="名称" prop="name">
              <el-input v-model="dialog.template.edit.data.name" disabled></el-input>
            </el-form-item>

            <el-form-item label="数据源">
                <el-input v-model="dialog.template.datasource.class" disabled style="width:50%">
                    <el-dropdown slot="prepend">
                        <span class="el-dropdown-link">
                            <i class="el-icon-coin el-icon--right" style="cursor:pointer;"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <DatasourceView :root="dialog.template.datasource.root" 
                                @node-click="onDataSourceSelect($event,'edit')"></DatasourceView>
                        </el-dropdown-menu>
                    </el-dropdown>
                </el-input>
                <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 选择数据源</span>
            </el-form-item>

            <el-form-item label="属性" v-if="dialog.template.datasource.data">
                <DataFieldsView :fields="dialog.template.datasource.data.fields" 
                    @fields-change="onDataFieldsSelect($event,'edit')"
                    @node-click="onDataFieldsSelect($event,'edit')"
                    style="width:50%"></DataFieldsView>
                    <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 选择属性用来生成通知模版</span>
            </el-form-item>
            
            <el-form-item label="模版定义" prop="content">
              <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 通知模版由所选属性生成，也可自行调整添加常量属性，支持HTML格式化。</span>
              <VueEditor
                  v-model="dialog.template.edit.data.content"
                  @init="onEditorInit"
                  :lang="editor.lang.value"
                  :theme="editor.theme.value"
                  width="100%"
                  height="calc(100vh - 380px)"
                  style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);border: 3px solid #dddddd;border-radius: 15px;"
                  ref="editorRef"
              ></VueEditor>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="dialog.template.edit.data.attr.status"
                active-color="#13ce66"
                inactive-color="#dddddd"
                active-value="1"
                inactive-value="0">>
              </el-switch>
            </el-form-item>
          </el-form>

          <div style="width:30%;margin-top:-70px;">
                
                <div class="iphone">
                  <div class="iphone-top">
                    <span class="camera"></span>
                    <span class="sensor"></span>
                    <span class="speaker"></span>
                  </div>
                  <div class="iphone-screen">
                    <div v-html="editTemplatePriview" style="padding: 10px;overflow-y: auto;"></div>
                  </div>
                  <div class="iphone-bottom">
                    <span></span>
                  </div>
                </div>
          </div>

        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.template.edit.show = false">取 消</el-button>
          <el-button type="primary" @click="onUpdate" :loading="dialog.template.edit.loading">确 定</el-button>
        </span>
      </el-dialog>
    </el-main>
    <el-footer style="height:40px;line-height:40px;background:#f2f2f2;">
        {{ dt.info.join(' &nbsp; | &nbsp;') }}
    </el-footer>
  </el-container>
</template>

<script>
import _ from 'lodash';
import TagView from '../tags/TagView';
import DatasourceView from './DatasourceView';
import DataFieldsView from './DataFieldsView';
import ApiPerm from '../system/apiPerm.vue';

export default {
  name: "TemplateView",
  props: {
    model: Object
  },
  components:{
    TagView,
    VueEditor: require("vue2-ace-editor"),
    DatasourceView,
    DataFieldsView,
    ApiPerm
  },
  data() {
    return {
      dt: {
        rows:[],
        columns: [],
        selected: [],
        radio:'',
        search: "",
        info: []
      },
      dialog:{
        template:{
          datasource: {
              root: "/matrix/devops",
              fields: [],
              class: "",
              data: null
          },
          new:{
            loading: false,
            show: false,
            data: {
              name: "",
              ftype: "json",
              attr: {remark: "",status:0},
              parent: `/script/matrix/m3event/notify/template`,
              content: ""
            },
            rules: {
                name:[
                  { required: true, message: '请输入名称', trigger: 'blur' }
                ]
            }
          },
          edit: {
              loading: false,
              show: false,
              data: {
                name: "",
                ftype: "json",
                attr: {remark: "",status:0},
                parent: `/script/matrix/m3event/notify/template`,
                content: ""
              },
              rules: {
                  name:[
                    { required: true, message: '请输入名称', trigger: 'blur' }
                  ]
              }
          }
        }
      },
      editor: {
          value: "",
          loading: false,
          lang: {
              value: "javascript",
              list: []
          },
          theme: {
              value: "chrome",
              list: this.m3.theme.EDITOR_THEME
          }
      }
    };
  },
  computed:{
    newTemplatePriview(){
      try{
        return JSON.parse(this.dialog.template.new.data.content).template;
      }catch(err){
        return "";
      }
    },
    editTemplatePriview(){
      try{
        return JSON.parse(this.dialog.template.edit.data.content).template; 
      }catch(err){
        return "";
      }
    }
  },
  watch: {
    'dt.rows': {
        handler(val){

            if(val){
                
                this.dt.info = [];
                this.dt.info.push(`共 ${val.length} 项`);
                this.dt.info.push(`已选择 ${this.dt.selected.length} 项`);
                this.dt.info.push(this.moment().format("YYYY-MM-DD HH:mm:ss.SSS"));

            }
        },
        immediate:true
    },
    'dt.selected': {
        handler(val){
            this.dt.info = [];
            this.dt.info.push(`共 ${this.dt.rows.length} 项`);
            this.dt.info.push(`已选择 ${val.length} 项`);
            this.dt.info.push(this.moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
        }
    },
    'dt.search':{
        handler(val){
          if(_.isEmpty(val)){
            this.initData();
          }else {
            this.dt.rows = this.dt.rows.filter(data => {
                return !val || data.name.toLowerCase().includes(val.toLowerCase())
            })
          }
        }
    }
  },
  created(){
     this.initData();
  },
  methods: {
    getTemplate(data){
      console.log(data)
      return JSON.parse(data).template;
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
    rowClassName({rowIndex}){
        return `row-${rowIndex}`;
    },
    /* 数据源选择切换 */
    onDataSourceSelect(data,ac){
      this.dialog.template.datasource.class = data.class;
      this.dialog.template.datasource.data = data;

      let content = this.dialog.template[ac].data.content?JSON.parse(this.dialog.template[ac].data.content):{};
      content.class = data.class;
      this.dialog.template[ac].data.content = JSON.stringify(content,null,2);
    },
    onDataFieldsSelect(data,ac){
        this.dialog.template.datasource.fields = data;
        
        let content = JSON.parse(this.dialog.template[ac].data.content) ;
        content.fields = data;
        content.template = data.map(v=>{
                            return `<p>${v.toUpperCase()}：{{.${v}}}</p>`
                          }).join("");
        this.dialog.template[ac].data.content = JSON.stringify(content,null,2);
    },
    initData(){
      this.m3.callFS("/matrix/m3event/notify/getTemplateList.js",null).then((rt)=>{
        let rtn = rt.message;

        this.$set(this.dt,'rows', rtn.rows);
        this.$set(this.dt,'columns', _.map(rtn.columns, (v)=>{
                              
          if(_.isUndefined(v.visible)){
            _.extend(v, { visible: true });
          }

          if(!v.render){
            return v;
          } else {
            return _.extend(v, { render: eval(v.render) });
          }
          
        }));

        setTimeout(()=>{
          this.$refs.table.doLayout();
        },500)
      });
    },
    onRefresh(){
      this.initData();
    },
    onReset(form){
      this.$refs[form].resetFields();
    },
    onNew(){
      this.dialog.template.new.show = true;
    },
    onSave(){

      if(_.isEmpty(this.dialog.template.new.data.name)){
        this.$message.warning("请输入名称");
        return false;
      }

      this.dialog.template.new.loading = true;
      
      let param = {
                    parent: this.dialog.template.new.data.parent, name: [this.dialog.template.new.data.name,this.dialog.template.new.data.ftype].join(".").replace(/.json.json/,'.json'), 
                    data: {content: this.dialog.template.new.data.content, ftype: this.dialog.template.new.data.ftype, attr: this.dialog.template.new.data.attr, index: true}    
                  };
      this.m3.dfs.newFile(param).then((res)=>{
        
          this.$message({
            type: "success",
            message: "新建模板成功！"
          })  
          this.initData();
          this.dialog.template.new.loading = false;
          this.dialog.template.new.show = false;
      }).catch((err)=>{
          this.$message({
            type: "error",
            message: "新建模板失败 " + err
          })
          this.dialog.template.new.loading = false;
      })  
    },
    onToggleStatus(row){
      
      let attr = _.extend(row.attr, {status:row.status});
      let param = {
                    parent: row.parent, name: [row.name,row.ftype].join(".").replace(/.json.json/,'.json'), 
                    data: {content: row.content, ftype: row.ftype, attr: attr, index: true}    
                  };
      this.m3.dfs.newFile(param).then(()=>{
          this.$message({
            type: "success",
            message: row.status ? "模板已启用" : "模板已禁用"
          })
      })  
    },
    onDelete(index,item){
      
      this.$confirm(`确认要删除该模板：${item.name}？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
      }).then(() => {
          
          let param = {parent: item.parent, name: item.name};

          this.m3.dfs.deleteFile(param).then(()=>{
            this.$message({
                    type: 'success',
                    message: '删除模板成功!'
            });
            this.initData();
          }).catch((err)=>{
            this.$message({
                type: 'error',
                message: '删除模板失败 ' + err.message
            });
          });
          
          
      }).catch((err)=>{
        this.$message({
            type: 'info',
            message: '删除模板操作已取消 ' + err
        });
      })
    },
    onEdit(index,item){
      this.dialog.template.edit.show = true;
      this.dialog.template.edit.data = item;
    },
    onUpdate(){

      this.dialog.template.edit.loading = true;
      
      let param = {
                    parent: this.dialog.template.edit.data.parent, name: [this.dialog.template.edit.data.name,this.dialog.template.edit.data.ftype].join(".").replace(/.json.json/,'.json'), 
                    data: {content: this.dialog.template.edit.data.content, ftype: this.dialog.template.edit.data.ftype, attr: this.dialog.template.edit.data.attr, index: true}    
                  };
      this.m3.dfs.newFile(param).then((res)=>{
        
          this.$message({
            type: "success",
            message: "更新模板成功！"
          })  
          this.initData();
          this.dialog.template.edit.loading = false;
          this.dialog.template.edit.show = false;
      }).catch((err)=>{
          this.$message({
            type: "error",
            message: "更新模板失败 " + err
          })
          this.dialog.template.edit.loading = false;
      })  
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  
  .el-main{
    overflow: hidden;
  }

  .template-dialog /deep/ .el-dialog{
    width: 80vw!important;
    height: auto;
  }

  /* 样式1 */
  .iphone {
      box-shadow: inset 0 0 3px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px #999, 0 0 30px 0px rgba(0, 0, 0, 0.7);
      border: 5px solid #d9dbdc;
      background: #f8f8f8;
      padding: 15px;
      border-radius: 50px;
      height: auto;
      width: 100%;
      position: relative;
      -webkit-transform: scale(0.8);
      transform: scale(0.8);
  }
  .iphone-top {
      padding: 5px 110px 40px;
      position: relative;
  }
  .iphone-top .speaker {
      display: block;
      width: 70px;
      height: 6px;
      margin: 0 auto;
      border-radius: 6px;
      background: #292728;
  }
  .iphone-top .camera {
      display: block;
      margin: 0 auto;
      height: 10px;
      width: 10px;
      border-radius: 50%;
      margin-bottom: 13px;
      background: #333;
  }
  .iphone-top .sensor {
      display: block;
      width: 15px;
      height: 15px;
      float: left;
      background: #333;
      margin-top: -5px;
      border-radius: 50%;
  }
  .iphone .top-bar, .iphone .bottom-bar {
      display: block;
      width: 423px;
      height: 15px;
      border-left: 5px solid #BBB;
      border-right: 5px solid #BBB;
      position: absolute;
      left: -5px;
  }
  .iphone .top-bar {
      top: 65px;
  }
  
  .iphone-screen {
      background: #eee;
      border: 1px solid #fff;
      height: 100%;
      min-height: 70vh;
      width: 100%;
      margin: 0 auto;
      border: 2px solid rgba(0, 0, 0, 0.9);
      border-radius: 3px;
      overflow: hidden;
  }
  .iphone-bottom {
      padding: 10px 0 0;
  }
  .iphone-bottom span {
      display: block;
      margin: 0 auto;
      width: 68px;
      height: 68px;
      background: #ccc;
      border-radius: 50%;
      background: -webkit-linear-gradient(315deg, #303233 0%, #b5b7b9 50%, #f0f2f2 69%, #303233 100%);
      background: linear-gradient(135deg, #303233 0%, #b5b7b9 50%, #f0f2f2 69%, #303233 100%);
      position: relative;
  }
  .iphone-bottom span:after {
      content: "";
      display: block;
      width: 60px;
      height: 60px;
      background: #fff;
      border-radius: 50%;
      position: absolute;
      left: 4px;
      top: 4px;
  }
</style>
