<template>
  <el-container>
    <el-header>
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
        <el-table-column label="操作" width="200">
            <!-- <template slot="header">
              <el-input
                v-model="dt.search"
                clearable
                placeholder="关键字搜索" />
            </template> -->
            <template slot-scope="scope">
              <el-button type="text" @click="onEdit(scope.$index, scope.row)"> 编辑</el-button>
              <el-button type="text" @click="onDelete(scope.$index, scope.row)"> 删除</el-button>
            </template>
        </el-table-column>
      </el-table>
      <el-dialog
        title="模版管理"
        :visible.sync="dialog.template.show"
        :append-to-body="true"
        :show-close="false"
        :close-on-press-escape="false"
        :close-on-click-modal="false"
        :destroy-on-close="true"
        v-if="dialog.template.show">
        
          <el-form :model="dialog.template.data"  :rules="dialog.template.rules" ref="templateForm" label-width="100px">
            
            <el-form-item label="名称" prop="name">
              <el-input v-model="dialog.template.data.name" :disabled="dialog.template.action==='update'?true:false"></el-input>
            </el-form-item>

            <el-form-item label="数据源">
                <el-input v-model="dialog.template.datasource.class" disabled>
                    <el-dropdown slot="prepend">
                        <span class="el-dropdown-link">
                            <i class="el-icon-coin el-icon--right" style="cursor:pointer;"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <DatasourceView :root="dialog.template.datasource.root" 
                                @node-click="onDataSourceSelect"></DatasourceView>
                        </el-dropdown-menu>
                    </el-dropdown>
                </el-input>
            </el-form-item>

            <el-form-item label="属性" v-if="dialog.template.datasource.data">
                <DataFieldsView :fields="dialog.template.datasource.data.fields" 
                    @fields-change="onDataFieldsSelect"
                    @node-click="onDataFieldsSelect"></DataFieldsView>
            </el-form-item>
            
            <el-form-item label="模版定义" prop="content">
              <VueEditor
                  v-model="dialog.template.data.content"
                  @init="onEditorInit"
                  :lang="editor.lang.value"
                  :theme="editor.theme.value"
                  width="inherit"
                  height="calc(100vh - 425px)"
                  style="border:1px solid #f2f2f2;"
                  ref="editorRef"
              ></VueEditor>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="dialog.template.data.attr.status"
                active-color="#13ce66"
                inactive-color="#dddddd"
                :active-value="1"
                :inactive-value="0">>
              </el-switch>
            </el-form-item>
          </el-form>
          
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.template.show = false">取 消</el-button>
          <el-button type="primary" @click="onSave">确 定</el-button>
        </span>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script>
import _ from 'lodash';
import TagView from '../tags/TagView';
import DatasourceView from './DatasourceView';
import DataFieldsView from './DataFieldsView';

export default {
  name: "TemplateView",
  props: {
    model: Object
  },
  components:{
    TagView,
    VueEditor: require("vue2-ace-editor"),
    DatasourceView,
    DataFieldsView
  },
  data() {
    return {
      dt: {
        rows:[],
        columns: [],
        selected: [],
        radio:'',
        search: ""
      },
      dialog:{
        template:{
          show: false,
          datasource: {
              root: "/matrix/devops",
              fields: [],
              class: "",
              data: null
          },
          data: {
            name: "",
            ftype: "json",
            attr: {remark: "",status:0},
            parent: `/home/${window.auth.signedUser.username}/Documents/notify`,
            content: ""
          },
          rules: {
              name:[
                { required: true, message: '请输入名称', trigger: 'blur' }
              ]
          },
          action: ""
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
              value: "merbivore",
              list: this.m3.EDITOR_THEME
          }
      }
    };
  },
  watch: {
    'dt.search':{
      handler(val){
        console.log(val)
        if(_.isEmpty(val)){
          this.initData();
        }else {
          this.dt.rows = this.dt.rows.filter(data => !val || data.name.toLowerCase().includes(val.toLowerCase()) || data.name.includes(val))
        }
      }
    }
  },
  created(){
     this.initData();
  },
  methods: {
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
    onDataSourceSelect(data){
      this.dialog.template.datasource.class = data.class;
      this.dialog.template.datasource.data = data;

      let content = JSON.parse(this.dialog.template.data.content);
      content.class = data.class;
      this.dialog.template.data.content = JSON.stringify(content,null,2);
    },
    onDataFieldsSelect(data){
        this.dialog.template.datasource.fields = data;
        let content = JSON.parse(this.dialog.template.data.content);
        content.fields = data;
        this.dialog.template.data.content = JSON.stringify(content,null,2);
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
      });
    },
    onRefresh(){
      this.initData();
    },
    onReset(){
      if(this.$refs['templateForm']){
        this.$refs['templateForm'].resetFields();
      }
    },
    onNew(){
      this.onReset();
      this.dialog.template.show = true;
      this.dialog.template.action = "add";
    },
    onSave(){

      if(_.isEmpty(this.dialog.template.data.name)){
        this.$message.warning("请输入名称");
        return false;
      }
      
      let param = {
                    parent: this.dialog.template.data.parent, name: [this.dialog.template.data.name,this.dialog.template.data.ftype].join(".").replace(/.json.json/,'.json'), 
                    data: {content: this.dialog.template.data.content, type: this.dialog.template.data.ftype, attr: this.dialog.template.data.attr, index: true}    
                  };
      this.m3.dfsNew(param).then(()=>{
          this.$message({
            type: "success",
            message: "新建模板成功！"
          })  
          this.initData();
          this.dialog.template.show = false;
      }).catch((err)=>{
          this.$message({
            type: "error",
            message: "新建模板失败 " + err.message
          })
      })  
    },
    onDelete(index,item){
      console.log(index)
      this.$confirm(`确认要删除该模板：${item.name}？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).then(() => {
          
          let param = {parent: item.parent, name: item.name};

          this.m3.dfsDelete(param).then(()=>{
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
          
          
      })
    },
    onEdit(index,item){
      console.log(index,item)
      this.dialog.template.show = true;
      this.dialog.template.data = item;
      this.dialog.template.action = "update";
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
  }
  .el-main{
    padding:0px;
    overflow: hidden;
  }
</style>
