<template>
  <el-container style="height:calc(100vh - 135px);" @mouseover.native="onLayout">
    <el-header style="position:relative;line-height: 60px;display:flex;">
      <span style="width:70%;">
        <el-tooltip content="刷新模板">
          <el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
        </el-tooltip>
        <el-tooltip content="新建模板">
          <el-button type="success" icon="el-icon-plus" @click="onNew" size="mini">新建模板</el-button>
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
        <el-table-column label="操作" width="160" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" icon="el-icon-edit" @click="onEdit(scope.row)"> 编辑</el-button>
              <el-button type="text" icon="el-icon-delete" @click="onDelete(scope.row)"> 删除</el-button>
              <el-switch v-model="scope.row['status']" 
                  active-color="#13ce66" 
                  inactive-color="#ff4949"
                  active-value="1"
                  inactive-value="0"
                  style="padding-left:10px;display:none;"
                  @change="onToggleStatus(scope.row)"></el-switch>
            </template>
        </el-table-column>
      </el-table>
      <!-- 新建模版 -->
      <el-dialog
        title="新建模版"
        width="80%"
        style="height: auto;"
        :visible.sync="dialog.new.show"
        :append-to-body="true"
        :close-on-press-escape="false"
        :close-on-click-modal="false"
        :destroy-on-close="true"
        @close="onReset('newTemplateForm')"
        v-if="dialog.new.show">
          <el-container>
            <el-main style="display: flex;flex-wrap: nowrap;background: #f2f2f2;">
              <el-form :model="dialog.new.data" :rules="dialog.new.rules" 
                ref="newTemplateForm" label-width="100px"
                :style="newTemplatePriview.length>0 ? 'width:70%;':'width:100%;'">
                
                <el-form-item label="名称" prop="name">
                  <el-input v-model="dialog.new.data.name"></el-input>
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

                <template v-if="dialog.new.data.content.class">
                  
                  <el-form-item label="属性">
                      <DataFieldsView :fields="dialog.template.datasource.fields" 
                          @fields-change="onDataFieldsSelect($event,'new')"
                          @node-click="onDataFieldsSelect($event,'new')"
                          style="width:50%"></DataFieldsView>
                          <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 选择属性用来生成通知模版</span>
                  </el-form-item>
                  
                  <el-form-item label="HTML支持" prop="content">
                      <el-switch v-model="dialog.new.data.content.html"
                        active-color="#13ce66"
                        :active-value="true"
                        :inactive-value="false"></el-switch>
                  </el-form-item>

                  <el-form-item label="自定义模版">
                    <span>
                        <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 可自行调整添加常量属性</span>
                        <el-input type="textarea" :rows="8" v-model="dialog.new.data.template"></el-input>
                        <VueEditor
                            v-model="dialog.new.data.source"
                            @init="onEditorInit('newEditorRef','new')"
                            :lang="editor.lang.value"
                            :theme="editor.theme.value"
                            width="100%"
                            height="calc(100vh - 560px)"
                            style="border: 1px solid #dddddd;border-radius: 15px;display:none;"
                            ref="newEditorRef"
                        ></VueEditor>
                      </span>
                  </el-form-item>

                  <el-form-item label="开启抑制策略">
                    <el-switch v-model="dialog.new.data.content.compression.enable"
                      active-color="#13ce66"
                      :active-value="true"
                      :inactive-value="false"></el-switch>
                      <div v-if="dialog.new.data.content.compression.enable">
                        <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 选择属性用来生成抑制主键</span>
                        <br>
                        <DataFieldsView :fields="dialog.template.datasource.fields" 
                              @fields-change="onCompressionFieldsSelect($event,'new')"
                              @node-click="onCompressionFieldsSelect($event,'new')"
                              style="width:50%"></DataFieldsView>
                        <p>
                          <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 抑制时间窗口(单位：秒)</span>
                          <br>
                          <el-input-number v-model="dialog.new.data.content.compression.timer" :min="0"></el-input-number>
                        </p>
                        <p>
                          <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 抑制告警消息模版</span>
                          <br>
                          <el-input type="textarea" :rows="2" v-model="dialog.new.data.content.compression.template"></el-input>
                        </p>
                      </div>
                  </el-form-item>

                </template>
                
                <el-form-item label="是否启用" prop="status" style="display:none;">
                  <el-switch
                    v-model="dialog.new.data.attr.status"
                    active-color="#13ce66"
                    inactive-color="#dddddd"
                    active-value="1"
                    inactive-value="0">>
                  </el-switch>
                </el-form-item>
                
              </el-form>
              <transition name="fade">
                <div :style="newTemplatePriview?'width:30%;display:;':'display:none;'">
                    
                    <div class="iphone">
                      <div class="iphone-top">
                        <span class="camera"></span>
                        <span class="sensor"></span>
                        <span class="speaker"></span>
                      </div>
                      <div class="iphone-screen">
                        <div v-html="newTemplatePriview" contenteditable="true" style="padding: 10px;overflow-y: auto;" ref="newTemplatePriviewRef"></div>
                      </div>
                      <div class="iphone-bottom">
                        <span></span>
                      </div>
                    </div>
                </div>
              </transition>
            </el-main>
          </el-container>
          
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.new.show = false">关 闭</el-button>
          <!-- <el-button @click="onReset('newTemplateForm')">重置</el-button> -->
          <el-button type="primary" @click="onSave" :loading="dialog.new.loading">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑模版 -->
      <el-dialog
        title="模版管理"
        width="80%"
        style="height: auto;"
        :visible.sync="dialog.edit.show"
        :append-to-body="true"
        :close-on-press-escape="false"
        :close-on-click-modal="false"
        :destroy-on-close="true"
        v-if="dialog.edit.show">
        <el-container>
            <el-main style="display: flex;flex-wrap: nowrap;background: #f2f2f2;">
              <el-form :model="dialog.edit.data" :rules="dialog.edit.rules" 
                ref="editTemplateForm" label-width="100px"
                :style="editTemplatePriview ? 'width:70%;padding:20px;' : 'width:100%;padding:20px;'"
                v-if="dialog.edit.data.content"
                size="mini">
                
                <el-form-item label="名称" prop="name">
                  <el-input v-model="dialog.edit.data.name" disabled></el-input>
                </el-form-item>
                
                <!-- 高级模式下不再允许选择属性 -->
                <template v-if="editEnable">
                  
                  
                </template>
                <el-form-item label="数据源">
                      <el-input v-model="dialog.template.datasource.class" disabled style="width:50%">
                          <el-dropdown slot="prepend">
                              <span class="el-dropdown-link">
                                  <i class="el-icon-coin el-icon--right" style="cursor:pointer;"></i>
                              </span>
                              <el-dropdown-menu slot="dropdown">
                                  <DatasourceView ref="datasourceEditRef"
                                      :root="dialog.template.datasource.root" 
                                      @node-click="onDataSourceSelect($event,'edit')"></DatasourceView>
                              </el-dropdown-menu>
                          </el-dropdown>
                      </el-input>
                      <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 选择数据源</span>
                </el-form-item>

                <el-form-item label="属性" v-if="dialog.template.datasource.class">
                      <DataFieldsView :fields="dialog.template.datasource.fields"
                          @fields-change="onDataFieldsSelect($event,'edit')"
                          @node-click="onDataFieldsSelect($event,'edit')"
                          :selected="dialog.edit.data.content.fields"
                          style="width:50%"></DataFieldsView>
                        <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 选择属性用来生成通知模版</span>
                </el-form-item>
                  
                <el-form-item label="HTML支持" prop="content">
                    <el-switch v-model="dialog.edit.data.content.html"
                      active-color="#13ce66"
                      :active-value="true"
                      :inactive-value="false"></el-switch>
                </el-form-item>
                
                <el-form-item label="自定义模版">
                  <span>
                    <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 可自行调整添加常量属性</span>
                    <el-input type="textarea" :rows="8" v-model="dialog.edit.data.template"></el-input>
                    <VueEditor
                        v-model="dialog.edit.data.source"
                        @init="onEditorInit('editorRef','edit')"
                        :lang="editor.lang.value"
                        :theme="editor.theme.value"
                        width="100%"
                        height="calc(100vh - 525px)"
                        style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);border: 3px solid #dddddd;border-radius: 15px;display:none;"
                        ref="editorRef"
                    ></VueEditor>
                  </span>
                </el-form-item>

                <el-form-item label="开启抑制策略" v-if="dialog.template.datasource.class">
                  <el-switch v-model="dialog.edit.data.content.compression.enable"
                        active-color="#13ce66"
                        :active-value="true"
                        :inactive-value="false"
                        size="mini"></el-switch>
                  <div v-if="dialog.edit.data.content.compression.enable" style="padding:20px;background:#ffffff;">
                    <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 选择属性用来生成抑制主键</span>
                    <br>
                    <DataFieldsView :fields="dialog.template.datasource.fields" 
                          @fields-change="onCompressionFieldsSelect($event,'edit')"
                          @node-click="onCompressionFieldsSelect($event,'edit')"
                          :selected="dialog.edit.data.content.compression.keys"
                          style="width:50%"></DataFieldsView>
                    <p>
                      <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 抑制时间窗口(单位：秒)</span>
                      <br>
                      <el-input-number v-model="dialog.edit.data.content.compression.timer" :min="0" :step="5"></el-input-number>
                    </p>
                    <p>
                      <span style="color:#999;font-size:8px;padding-left:10px;"><i class="el-icon-question"></i> 抑制告警消息模版</span>
                      <el-input type="textarea" :rows="2" v-model="dialog.edit.data.content.compression.template"></el-input>
                    </p>
                  </div>
                </el-form-item>

                <el-form-item label="是否启用" prop="status" style="display:none;">
                  
                  <el-switch
                    v-model="dialog.edit.data.attr.status"
                    active-color="#13ce66"
                    inactive-color="#dddddd"
                    active-value="1"
                    inactive-value="0">>
                  </el-switch>
                </el-form-item>

              </el-form>

              <transition name="fade">
                <div :style="editTemplatePriview?'width:30%;display:;':'width:0%;display:none;'">
                      
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
              </transition>
            </el-main>
        </el-container>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.edit.show = false">关 闭</el-button>
          <!-- <el-button @click="dialog.edit.data.content.template =dialog.edit.data.template = ''">重 置 </el-button> -->
          <el-button type="primary" @click="onUpdate" :loading="dialog.edit.loading">确 定</el-button>
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
        loading: false,
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
          }
        },
        new:{
          loading: false,
          show: false,
          data: {
            name: "",
            ftype: "json",
            attr: {remark: "",status:"1"},
            parent: `/script/matrix/m3event/notify/template`,
            source: "",
            template: "",
            content: {
              class: "",
              fields: "",
              compression:{
                enable: false,
                keys: [],
                timer: 0,
                disenable_expired_send: true,
                template: "Host {{.host}} test alert message: {{.msg}} Template compression count: {{.count}}"
              },
              template: "",
              html: false
            }
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
              attr: {remark: "",status:"1"},
              parent: `/script/matrix/m3event/notify/template`,
              source: "",
              template: "",
              content: {
                class: "",
                fields: "",
                compression:{
                  enable: false,
                  keys: [],
                  timer: 0,
                  disenable_expired_send: true,
                  template: ""
                },
                template: "",
                html: false
              }
            },
            rules: {
                name:[
                  { required: true, message: '请输入名称', trigger: 'blur' }
                ]
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
        return "";//this.dialog.new.data.content.template;
      }catch(err){
        return "";
      }
    },
    editTemplatePriview(){
      try{
        return "";//this.dialog.edit.data.content.template; 
      }catch(err){
        return "";
      }
    },
    editEnable(){
      return this.dialog.edit.data.template.length <=0 ? true : false;
    }
  },
  watch: {
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
    },
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
    'dialog.new.data.content':{
      handler(val){
        // 根据fields的name找出title，生产模版用做title显示用
        let content = this.genTemplateByFields(val);
        this.dialog.new.data.source = JSON.stringify(content,null,2);

        this.dialog.new.data.template = val.template;
      },
      deep: true,
      immediate: true
    },
    'dialog.edit.data.content':{
      handler(val){
        
        if(_.isEmpty(val.template)){
          // 根据fields的name找出title，生产模版用做title显示用
          let content = this.genTemplateByFields(val);
          this.dialog.edit.data.source = JSON.stringify(content,null,2);
        }else{
          this.dialog.edit.data.template = val.template;
          this.dialog.edit.data.source = JSON.stringify(val,null,2);
        }
      },
      deep: true
    },
    'dialog.new.data.content.compression.enable'(val){
      if(!val){
        this.dialog.new.data.content.compression.keys = [];
        this.dialog.new.data.content.compression.timer = 0;
      }
      this.dialog.new.data.content.compression.disenable_expired_send = !val;
    },
    'dialog.edit.data.content.compression.enable'(val){
      if(!val){
        this.dialog.edit.data.content.compression.keys = [];
        this.dialog.edit.data.content.compression.timer = 0;
      }
      this.dialog.edit.data.content.compression.disenable_expired_send = !val;
    },
    'dialog.new.data.content.compression.timer'(val){
      if(val === 0){
        this.dialog.new.data.content.compression.enable = false;
      }else{
        this.dialog.new.data.content.compression.enable = true;
      }
    },
    'dialog.new.data.content.compression.enable'(val){
      if(!val){
        this.dialog.new.data.content.compression.timer = 0;
      } 
    },
    'dialog.edit.data.content.compression':{
      handler(val){
        if(val.keys.length > 0 && val.timer > 0){
          this.dialog.edit.data.content.compression.enable = true;
        }else{
          this.dialog.edit.data.content.compression.enable = false;
        }
      }
    },
    'dialog.edit.data.content.compression.enable':{
      handler(val){
        if(!val){
          this.dialog.edit.data.content.compression.timer = 0;
          this.dialog.edit.data.content.compression.keys = [];
        } 
      }
    }
  },
  created(){
     this.initData();
  },
  methods: {
    genTemplateByFields(data){
      
      // 根据fields的name找出title，生产模版用做title显示用
      if(_.isEmpty(data.fields)){
        data.template = "";
      } else{
          data.template = data.fields.map(v=>{
                                let field = _.find(this.dialog.template.datasource.fields,{name:v});
                                let title = v.toUpperCase();
                                let value = v;
                                if(field){
                                  title = field.title;
                                  value = ['date','timestamp'].includes(field.ftype) ? `${v}.Format "2006-01-02 15:04:05"` : v;
                                }

                                if(data.html){
                                  return `<p>${title}：{{.${value}}}</p>`
                                }else{
                                  return `${title}：{{.${value}}} `
                                }
                            }).join("");
      }
      
      return data;
    },
    onLayout(){
      this.$nextTick(()=>{
          this.$refs.table.doLayout();
      })
    },
    initEditor(ref,ac){
      let editor = this.$refs[ref].editor;  
    },
    onEditorInit(ref,ac){
        require("brace/ext/language_tools"); //language extension prerequsite...
        require(`brace/mode/${this.editor.lang.value}`); //language
        require(`brace/snippets/${this.editor.lang.value}`); //snippet
        require(`brace/theme/${this.editor.theme.value}`); //language
        this.initEditor(ref,ac);
    },
    rowClassName({rowIndex}){
        return `row-${rowIndex}`;
    },
    /* 数据源选择切换 */
    onDataSourceSelect(data,ac){
      this.dialog.template.datasource.class = data.class;
      this.$set(this.dialog[ac].data.content, 'class', data.class);
      this.dialog.template.datasource.fields = data.fields;
    },
    onDataFieldsSelect(data,ac){
        this.$set(this.dialog[ac].data.content, 'fields', data);
    },
    onCompressionFieldsSelect(data,ac){
        this.$set(this.dialog[ac].data.content.compression, 'keys', data);
    },
    initData(){
      this.dt.loading = true;
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

        this.$nextTick(()=>{
          this.$refs.table.doLayout();
        })
        setTimeout(()=>{
          this.$refs.table.doLayout();
        },1000)

        this.dt.loading = false;
      }).catch(err=>{
        console.error(err);
        this.dt.loading = false;
      });
    },
    onRefresh(){
      this.initData();
    },
    onReset(form){
      this.$refs[form].resetFields();
    },
    onNew(){
      this.dialog.new.show = true;
    },
    onSave(){

      if(_.isEmpty(this.dialog.new.data.name)){
        this.$message.warning("请输入名称");
        return false;
      }

      this.dialog.new.loading = true;

      let content = this.dialog.new.data.content;
      content.template = this.dialog.new.data.template;


      
      let param = {
                    parent: this.dialog.new.data.parent, name: [this.dialog.new.data.name,this.dialog.new.data.ftype].join(".").replace(/.json.json/,'.json'), 
                    data: {content: JSON.stringify(content,null,2), ftype: this.dialog.new.data.ftype, attr: this.dialog.new.data.attr, index: true}    
                  };

      this.m3.dfs.check(param).then(rtn=>{
        if(rtn){
          this.$message.warning("通知模版名称已存在，请确认");
          this.dialog.new.loading = false;
          return false;
        } else{
          this.m3.dfs.newFile(param).then((res)=>{
        
            this.$message({
              type: "success",
              message: "新建模板成功！"
            })  
            this.initData();
            this.dialog.new.loading = false;
            this.dialog.new.show = false;
            this.dialog.new.data = {
              name: "",
              ftype: "json",
              attr: {remark: "",status:"1"},
            
              source: "",
              template: "",
              content: {
                class: "",
                fields: "",
                compression:{
                  enable: false,
                  keys: [],
                  timer: 0,
                  disenable_expired_send: true,
                  template: "Host {{.host}} test alert message: {{.msg}} Template compression count: {{.count}}"
                },
                template: "",
                html: false
              }
            };
        }).catch((err)=>{
              this.$message({
                type: "error",
                message: "新建模板失败 " + err
              })
              this.dialog.new.loading = false;
          })  
        }
      }).catch(err=>{
        this.dialog.new.loading = false;
        console.error(err);
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
            type: row.status==1 ? "success" : "info",
            message: row.status==1 ? "模板已启用" : "模板已禁用"
          })
      })  
    },
    onDelete(item){
      
      this.$confirm(`确认要删除该模板：${item.name}？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
      }).then(() => {

          // 检查是否被引用
          let param1 = encodeURIComponent( JSON.stringify({action: "check", model:item}) );
          this.m3.callFS("/matrix/m3event/notify/templateAction.js",param1).then((rtn)=>{
            if(rtn.message > 0){
              this.$message({
                      type: 'warning',
                      message: '该模版已被引用，请确认'
              });
              return false;
            }else{
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
            }
          })  
          
      }).catch((err)=>{
        this.$message({
            type: 'info',
            message: '删除模板操作已取消 ' + err
        });
      })
    },
    onEdit(item){
      
      this.dialog.edit.show = true;

      this.dialog.edit.data.name = item.title;
      this.dialog.edit.data.attr = item.attr;
      
      let content = JSON.parse(item.content);
      
      this.$set(this.dialog.edit.data,'content',content);
      this.dialog.template.datasource.class = content.class;
      
      this.$nextTick(()=>{
        setTimeout(()=>{
          let node = this.$refs['datasourceEditRef'].$refs['tree'].getNode(content.class);
          this.dialog.template.datasource.fields = node.data.fields;
        },2000)
      })

      
    },
    onUpdate(){

      this.dialog.edit.loading = true;

      let content = this.dialog.edit.data.content;
      content.template = this.dialog.edit.data.template;
      
      let param = {
                    parent: this.dialog.edit.data.parent, name: [this.dialog.edit.data.name,this.dialog.edit.data.ftype].join(".").replace(/.json.json/,'.json'), 
                    data: {content: JSON.stringify(content,null,2), ftype: this.dialog.edit.data.ftype, attr: this.dialog.edit.data.attr, index: true}    
                  };
      this.m3.dfs.newFile(param).then((res)=>{
        
          this.$message({
            type: "success",
            message: "更新模板成功！"
          })  
          this.initData();
          this.dialog.edit.loading = false;
          this.dialog.edit.show = false;
      }).catch((err)=>{
          this.$message({
            type: "error",
            message: "更新模板失败 " + err
          })
          this.dialog.edit.loading = false;
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
      font-size:16px;
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
      min-height: 60vh;
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

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
</style>
