<template>
  <el-container style="height: calc(100vh - 135px);">
    <el-header style="height: 40px!important;line-height: 40px!important;position:relative;">
      <el-tooltip content="刷新">
        <el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
      </el-tooltip>
      <el-tooltip content="新建策略">
        <el-button type="text" icon="el-icon-plus" @click="onNew"></el-button>
      </el-tooltip>
      <!--el-tooltip content="导出策略">
        <el-button type="text" icon="el-icon-upload2"></el-button>
      </el-tooltip>
      <el-tooltip content="导入策略">
        <el-button type="text" icon="el-icon-download"></el-button>
      </el-tooltip-->
    </el-header>
    <el-main>
      <el-table
        v-loading="dt.loading"
        element-loading-spinner="el-icon-loading"
        :data="dt.rows"
        stripe
        border
        height="calc(100vh - 255px)"
        :row-class-name="rowClassName"
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
                  
                    <div style="height:30px;line-height:30px;" v-if="item.field === 'tags'">
                        <TagView domain='notifyRule' :model.sync="scope.row.tags" :id="scope.row.id" :limit="1"></TagView>
                    </div>
                    
                    <div style="display:flex;flex-wrap:wrap;" v-else-if="item.field === 'people' || item.field === 'emails' || item.field === 'phones'">
                        <el-popover
                            width="550"
                            trigger="click">
                            <el-container>
                                <el-main>
                                    <el-input type="textarea" :value="JSON.parse(scope.row[item.field]).join('\n')" :rows="6" style="width:98%;white-space:nowrap;"></el-input>
                                </el-main>
                            </el-container>
                            <el-button type="text" slot="reference"><i class="el-icon-user"></i> {{ scope.row[item['field']] | pickPeople }}</el-button>
                        </el-popover>
                    </div>

                    <div style="height:30px;line-height:30px;" v-else-if="item.field === 'rtype'">
                        <el-tag class="el-icon-mobile-phone" v-for="subItem in scope.row[item.field]" :key="subItem" v-if="scope.row[item.field]" style="margin-left:5px;"> {{ getRtypeTitleByName(subItem) }}</el-tag>
                    </div>
                    
                    <div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
                        v-else-if="(item.field === 'status' || item.field === 'template') && typeof item.render === 'function'">
                    </div>
                    
                    <div v-else>
                        {{scope.row[item.field]}}
                    </div>

                </template>
            </el-table-column>
        </template>
        <el-table-column label="操作" width="160" fixed="right">
          <template slot="header" slot-scope="scope">
              <el-input v-model="dt.search" clearable placeholder="关键字"></el-input>
          </template>
          <template slot-scope="scope">
            <el-button type="text"  @click="onEdit(scope.row)"> 编辑</el-button>
            <el-button type="text"  @click="onDelete(scope.row)" :loading="loading"> 删除</el-button>
            <el-switch v-model="scope.row['status']" 
              active-color="#13ce66" 
              inactive-color="#ff4949"
              :active-value="1"
              :inactive-value="0"
              style="padding-left:10px;"
              @change="onToggleStatus(scope.row)"></el-switch>
          </template>
        </el-table-column>
      </el-table>
      <!-- 新建策略 -->
      <el-dialog
        title="新建策略"
        :visible.sync="dialog.rule.new.show"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :append-to-body="true"
        class="notifyRule-dialog"
        @open="onOpen"
        v-if="dialog.rule.new.show">
        <el-form :model="dialog.rule.new.data"  :rules="dialog.rule.new.rules" ref="notifyRuleForm" label-width="100px">
          <el-form-item label="策略名称" prop="name">
           <el-input v-model="dialog.rule.new.data.name"></el-input>
          </el-form-item>
          <el-form-item label="接收人员" prop="persons">
            <el-cascader
              v-model="dialog.rule.new.data.persons"
              :options="persons.list"
              :props="persons.props"
              clearable
              filterable
              style="width:100%;"
              >              
              <template slot-scope="{ node, data }">
                <span v-if="data.username==='/'">{{m3.auth.Company.fullname}}</span>
                <span v-else>{{ (data.firstname || "") + (data.lastname || "") ||  data.username }} 
                    <span class="el-icon-platform-eleme" style="color:#999;font-size:8px;padding-left: 5px;" v-if="data.email"> {{ data.email.join(" ") }}</span>
                    <span class="el-icon-phone" style="color:#999;font-size:8px;padding-left: 5px;" v-if="data.mobile"> {{ data.mobile.join(" ") }}</span>
                    <span class="el-icon-message-solid" style="color:#999;font-size:8px;padding-left: 5px;" v-if="data.wechat"> {{ data.wechat }}</span>
                </span>
                <span v-if="!node.isLeaf && data.nodes.length>0"> ({{ data.nodes.length }})</span>
              </template>
              </el-cascader>
          </el-form-item>
          <el-form-item label="通知类型" prop="rtype">
            <el-select v-model="dialog.rule.new.data.rtype" multiple placeholder="请选择" filterable style="width:100%;">
              <el-option
                v-for="item in rtype.list"
                :key="item.name"
                :label="item.title"
                :value="item.name">
                <span style="float: left">{{ item.title }}</span>
                <span style="float: right; color: #8492a6; font-size: 8px">{{ item.address }}:{{item.port}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="通知规则" prop="situation">
            <el-select v-model="dialog.rule.new.data.situation" filterable placeholder="请选择">
              <el-option
                v-for="item in situation.list"
                :key="item.id"
                :label="item.name"
                :value="item.id">
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 8px">
                  <span class="el-icon-tickets" style="color:#999;font-size:8px;padding-left: 5px;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;width: 40vw;" v-if="item.situation"> {{ item.situation }}</span>
                </span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="通知模版" prop="template">
            <el-select v-model="dialog.rule.new.data.template" value-key="name" filterable placeholder="请选择">
              <el-option
                v-for="item in templates.list"
                :key="item.name"
                :label="item.title"
                :value="item">
                <span style="float: left">{{ item.name | formatName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        
          <el-form-item label="状态" prop="status">
              <el-switch
                v-model="dialog.rule.new.data.status"
                active-color="#13ce66"
                inactive-color="#dddddd"
                :active-value="1"
                :inactive-value="0">
              </el-switch>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.rule.new.show = false">取 消</el-button>
          <el-button type="primary" @click="onSave" :loading="dialog.rule.new.loading">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 策略管理 -->
      <el-dialog
        title="策略管理"
        :visible.sync="dialog.rule.edit.show"
        :append-to-body="true"
        :close-on-press-escape="false"
        :close-on-click-modal="false"
        class="notifyRule-dialog"
        @open="onOpen"
        v-if="dialog.rule.edit.show">
        <el-form :model="dialog.rule.edit.data"  :rules="dialog.rule.edit.rules" ref="notifyRuleForm" label-width="100px">
          <el-form-item label="名称" prop="name">
           <el-input v-model="dialog.rule.edit.data.name" disabled></el-input>
          </el-form-item>
          <el-form-item label="接收人员" prop="persons">
            <el-cascader
              v-model="dialog.rule.edit.data.persons"
              :options="persons.list"
              :props="persons.props"
              clearable
              filterable
              style="width:100%;">              
              <template slot-scope="{ node, data }">
                <span v-if="data.username==='/'">{{m3.auth.Company.fullname}}</span>
                <span v-else>{{ (data.firstname || "") + (data.lastname || "") ||  data.username }} 
                    <span class="el-icon-platform-eleme" style="color:#999;font-size:8px;padding-left: 5px;" v-if="data.email"> {{ data.email.join(" ") }}</span>
                    <span class="el-icon-phone" style="color:#999;font-size:8px;padding-left: 5px;" v-if="data.mobile"> {{ data.mobile.join(" ") }}</span>
                    <span class="el-icon-message-solid" style="color:#999;font-size:8px;padding-left: 5px;" v-if="data.wechat"> {{ data.wechat }}</span>
                </span>
                <span v-if="!node.isLeaf && data.nodes.length>0"> ({{ data.nodes.length }})</span>
              </template>
              </el-cascader>
          </el-form-item>
          <el-form-item label="通知类型" prop="rtype">
            <el-select v-model="dialog.rule.edit.data.rtype" multiple placeholder="请选择" style="width:100%;" filterable>
              <el-option
                v-for="item in rtype.list"
                :key="item.name"
                :label="item.title"
                :value="item.name">
                <span style="float: left">{{ item.title }}</span>
                <span style="float: right; color: #8492a6; font-size: 8px">{{ item.address }}:{{item.port}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="通知规则" prop="situation">
            <el-input placeholder="选择通知规则" :value="situation.list,dialog.rule.edit.data.situation | getSituationName">
                  <template slot="prepend">
                    <i class="el-icon-tickets"></i>
                    <el-select v-model="dialog.rule.edit.data.situation" value-key="id" placeholder="请选择" filterable style="width:47px;">
                      <el-option
                        v-for="item in situation.list"
                        :key="item.id"
                        :value="item.id">
                        <span style="float: left">{{ item.name }}</span>
                        <span style="float: right; color: #8492a6; font-size: 8px">
                          <span class="el-icon-tickets" style="color:#999;font-size:8px;padding-left: 5px;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;width: 40vw;" v-if="item.situation"> {{ item.situation }}</span>
                        </span>
                      </el-option>
                    </el-select>
                  </template>
            </el-input>
          </el-form-item>
          <el-form-item label="通知模版" prop="template">
            <el-input placeholder="选择通知模版" :value="dialog.rule.edit.data.template.title" v-if="dialog.rule.edit.data.template">
                  <template slot="prepend">
                    <i class="el-icon-notebook-2"></i>
                    <el-select v-model="dialog.rule.edit.data.template" value-key="name" placeholder="请选择" filterable style="width:47px;">
                      <el-option
                        v-for="item in templates.list"
                        :key="item.name"
                        :value="item">
                        <span style="float: left">{{ item.title }}</span>
                      </el-option>
                    </el-select>
                  </template>
              </el-input>
          </el-form-item>
        
          <el-form-item label="状态" prop="status">
              <el-switch
                v-model="dialog.rule.edit.data.status"
                active-color="#13ce66"
                inactive-color="#dddddd"
                :active-value="1"
                :inactive-value="0">
              </el-switch>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.rule.edit.show = false">取 消</el-button>
          <el-button type="primary" @click="onUpdate" :loading="dialog.rule.edit.loading">更 新</el-button>
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

export default {
  name: "NotifyRuleView",
  data() {
    return {
      loading: false,
      dt: {
        loading: false,
        rows:[],
        columns: [],
        selected: [],
        search: "",
        info:[]
      },
      rtype: {
        root: '/script/matrix/m3event/notify/server',
        list: []
      },
      persons: {
        props: {
          value: 'id',
          label: 'flname',
          children: 'nodes',
          multiple: true,
          emitPath: false,
          checkStrictly: true
        },
        list: [],
        userList: []
      },
      situation:{
        list: []
      },
      templates: {
        value: '',
        list: []
      },
      dialog:{
        rule:{
          new:{
            loading: false,
            show: false,
            data: {
              name: "",
              persons: null,
              rtype: "",
              situation: null,
              status: 0,
              template: null
            },
            rules: {
                name:[
                  { required: true, message: '请输入名称', trigger: 'blur' }
                ]
            }
          },
          edit:{
            loading: false,
            show: false,
            data: {
              name: "",
              persons: null,
              rtype: "",
              situation: null,
              status: 0,
              template: null
            },
            rules: {
                name:[
                  { required: true, message: '请输入名称', trigger: 'blur' }
                ]
            }
          }
        }
      }
    };
  },
  filters:{
    pickPeople(val){
      try{
        return JSON.parse(val).map(v=>{
          return v.split(",")[0]}
        ).sort().join(" ")
      }catch(err){
        console.error(err);
        return null;
      }
    },
    formatName(val){
      return val.replace(/.json/,'');
    },
    formatTime(val){
      return window.moment(val).format(window.global.register.format);
    },
    getSituationName(situations,val){
      return _.find(situations,{id:val}).name;
    }
  },
  components:{
    TagView
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
    'dialog.rule.new.show'(val){
        if(val){
          this.init();
        }
    },
    'dialog.rule.edit.show'(val){
        if(val){
          this.init();
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
     this.init();
  },
  methods: {
    getRtypeTitleByName(val){
      try{
        let o = _.find(this.rtype.list,{name:val});
        return o?o.title:val;
      }catch(err){
        console.error(err);
        return "";
      }
    },
    initData(){
      this.m3.callFS("/matrix/m3event/notify/getRuleList.js").then((rt)=>{
        
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
      })
    },
    // 递归判断列表，把最后的children设为undefined
    travelUserTree(data){
      
      for(var i=0;i<data.length;i++){
        data[i].flname = (data[i]['firstname'] || "")+(data[i]['lastname'] || "") || data[i]['username'];
        if(data[i].nodes.length<1){
          data[i].nodes = undefined;
        }else {
          this.travelUserTree(data[i].nodes);
        } 
      }
      return data;
    },
    init(){
      this.dt.loading = true;
      this.m3.callFS("/matrix/m3system/ldap/ldap.js").then(rtn=>{
          this.persons.userList = rtn.message;
      })

      this.m3.user.list().then(rtn=>{
        this.persons.list = this.travelUserTree(rtn.message.nodes);
      })

      this.m3.callFS("/matrix/m3event/notify/getTemplateList.js").then(rtn=>{
        this.templates.list = _.orderBy(_.map(rtn.message.rows,v=>{
          return {name:v.name, value: {[v.name]:v.fullname}, title: v.name.replace(/.json/,'')};
        }),['title'],['asc']);
      })

      let param = encodeURIComponent( JSON.stringify({action:'list'}) );
      this.m3.callFS("/matrix/m3event/notify/situationAction.js",param).then(rtn=>{
        this.situation.list = _.orderBy(rtn.message.rows,['name'],['asc']);
        this.dt.loading = false;
      }).catch(err=>{
        console.error(err);
        this.dt.loading = false;
      })

      /* rtype.list */
      let rtypeParam = { parent: this.rtype.root, fullname: this.rtype.root, name: 'server.json' };
      this.m3.dfs.read(rtypeParam).then( res=>{
          let rtn = JSON.parse(res);
          this.rtype.list = _.compact(_.map(rtn,(v,k)=>{ 
            if(v.status && k !== 'base'){
              return  v; 
            }
          }));
      }).catch(err=>{
        console.error(err);
        this.dt.loading = false;
      })
      
    },
    rowClassName({rowIndex}){
        return `notifyRule-row-${rowIndex}`;
    },
    onOpen(){
      this.init();
    },
    onRefresh(){
      this.initData();
    },
    onReset(form){
      this.dialog.rule[form].data = {
                                name: "",
                                persons: [],
                                rtype: "",
                                situation: null,
                                status: 0,
                                template: null
                              };
    },
    onNew(){
      this.dialog.rule.new.show = true;
      _.extend(this.dialog.rule.new.data,{template:{title:""}});
      this.onReset('new');
    },
    onSave(){

        if(_.isEmpty(this.dialog.rule.new.data.name)){
          this.$message.warning("请输入名称");
          return false;
        }

        if(_.isEmpty(this.dialog.rule.new.data.persons)){
          this.$message.warning("请选择接收人员");
          return false;
        }

        if(_.isEmpty(this.dialog.rule.new.data.situation)){
          this.$message.warning("请选择场景");
          return false;
        }

        if(_.isEmpty(this.dialog.rule.new.data.template)){
          this.$message.warning("请选择通知内容模版");
          return false;
        }

        this.dialog.rule.new.loading = true;

        let check = encodeURIComponent(JSON.stringify({
                    action: 'check',
                    model: this.dialog.rule.new.data
                  }));

        this.m3.callFS("/matrix/m3event/notify/ruleAction.js",check).then(rtn=>{
          
          if(rtn.message){

            this.$message.warning("通知策略名称已存在，请确认");
            this.dialog.rule.new.loading = false;
            return false;

          } else{

            let param = encodeURIComponent(JSON.stringify({
                    action: 'add',
                    model: this.dialog.rule.new.data
                  }));

            this.m3.callFS("/matrix/m3event/notify/ruleAction.js",param).then(()=>{
              
              this.$message({
                type: "success",
                message: "新建策略成功"
              })
              this.onReset('new');
              this.initData();
              this.dialog.rule.new.loading = false;
              this.dialog.rule.new.show = false;

            }).catch(err=>{
              this.$message({
                type: "error",
                message: "新建策略失败 " + err
              })
            });
          }

        }).catch(err=>{
            console.error(err);
        })
          

    },
    onDelete(item){
      
      this.$confirm(`确认要删除该策略：${item.name}？`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'error'
                    }).then(() => {
        
        this.loading = true;

        let param = encodeURIComponent(JSON.stringify({action:"delete",model:item}));

        this.m3.callFS("/matrix/m3event/notify/ruleAction.js",param).then(()=>{
          
          this.$message({
                type: 'success',
                message: '删除策略成功!'
          })

          this.initData();
          this.loading = false;

        }).catch((err)=>{
          
          this.$message({
              type: 'error',
              message: '删除策略失败 ' + err.message
          });

          this.loading = false;

        });
          
      })
    },
    onEdit(item){
      this.dialog.rule.edit.data = _.cloneDeep(item);
      _.extend(this.dialog.rule.edit.data, {template: _.find(this.templates.list, {name: _.keys(item.template)[0]})});
      this.dialog.rule.edit.show = true;
    },
    onUpdate(){

        let param = encodeURIComponent(JSON.stringify({
                    action: 'update',
                    model: this.dialog.rule.edit.data
                  }));
        
        if(_.isEmpty(this.dialog.rule.edit.data.name)){
          this.$message.warning("请输入名称");
          return false;
        }

        if(_.isEmpty(this.dialog.rule.edit.data.persons)){
          this.$message.warning("请选择接收人员");
          return false;
        }

        if(_.isEmpty(this.dialog.rule.edit.data.situation)){
          this.$message.warning("请选择场景");
          return false;
        }

        if(_.isEmpty(this.dialog.rule.edit.data.template)){
          this.$message.warning("请选择通知内容模版");
          return false;
        }

        this.dialog.rule.edit.loading = true;

        this.m3.callFS("/matrix/m3event/notify/ruleAction.js",param).then(res=>{
          this.$message({
            type: "success",
            message: "策略更新成功"
          })
          this.initData();
          this.dialog.rule.edit.loading = false;
          this.dialog.rule.edit.show = false;

        }).catch(err=>{
          this.$message({
            type: "error",
            message: "策略更新失败 " + err
          })
          this.dialog.rule.edit.loading = false;
        });
    },
    onToggleStatus(row){
      
      let template = _.find(this.templates.list, {value:row.template});

      this.$set(row,'template',template);

      let param = encodeURIComponent(JSON.stringify({
                    action: 'update',
                    model: row
                  }));
      this.m3.callFS("/matrix/m3event/notify/ruleAction.js",param).then(()=>{
          
          this.$message({
            type: row.status ? "success" : "info",
            message: row.status ? "策略已启用" : "策略已停止"
          })

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
  
  .notifyRule-dialog /deep/ .el-dialog{
    width: 70vw!important;
    height: auto;
  }
  .el-table__body /deep/ .el-input__inner{
    border:unset!important;
  }
</style>