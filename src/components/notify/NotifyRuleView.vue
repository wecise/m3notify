<template>
  <el-container style="height: calc(100vh - 135px);">
    <el-header>
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
      <div style="position: absolute;right: 20px;top: 0px;">
        <el-input v-model="dt.search" clearable placeholder="关键字"></el-input>
      </div>
    </el-header>
    <el-main>
      <el-table
        :data="dt.rows"
        stripe
        border
        height="calc(100vh - 235px)"
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
                    
                    <div style="height:30px;line-height:30px;" v-else-if="item.field === 'emails' || item.field === 'phones'">
                        <el-select :value="scope.row[item.field]" v-if="scope.row[item.field]">
                          <el-option
                            v-for="subItem in scope.row[item.field].split(',')"
                            :key="subItem"
                            :label="subItem"
                            :value="subItem">
                          </el-option>
                        </el-select>
                    </div>

                    <div style="height:30px;line-height:30px;" v-else-if="item.field === 'rtype'">
                        <el-select :value="scope.row[item.field][0]" v-if="scope.row[item.field]">
                          <el-option
                            v-for="subItem in scope.row[item.field]"
                            :key="subItem"
                            :label="subItem"
                            :value="subItem">
                          </el-option>
                        </el-select>
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
        v-if="dialog.rule.new.show">
        <el-form :model="dialog.rule.new.data"  :rules="dialog.rule.new.rules" ref="notifyRuleForm" label-width="100px">
          <el-form-item label="名称" prop="name">
           <el-input v-model="dialog.rule.new.data.name"></el-input>
          </el-form-item>
          <el-form-item label="接收人员" prop="persons">
            <el-cascader
              v-model="dialog.rule.new.data.persons"
              :options="persons.list"
              :props="persons.props"
              clearable
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
          <el-form-item label="类型" prop="rtype">
            <el-select v-model="dialog.rule.new.data.rtype" multiple placeholder="请选择" style="width:100%;">
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
          <el-form-item label="场景" prop="situation">
            <el-select v-model="dialog.rule.new.data.situation" placeholder="请选择">
              <el-option
                v-for="item in situation.list"
                :key="item.id"
                :label="item.name"
                :value="item.id">
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 8px">{{ item.status }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="模版" prop="template">
            <el-select v-model="dialog.rule.new.data.template" placeholder="请选择">
              <el-option
                v-for="item in templates.list"
                :key="item.name"
                :label="item.name"
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
                :inactive-value="0"
                @change="onToggleStatus(dialog.rule.new.data)">
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
        class="notifyRule-dialog"
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
            <el-select v-model="dialog.rule.edit.data.rtype" multiple placeholder="请选择" style="width:100%;">
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
            <el-select v-model="dialog.rule.edit.data.situation" placeholder="请选择">
              <el-option
                v-for="item in situation.list"
                :key="item.id"
                :label="item.name"
                :value="item.id">
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 8px">
                  <span class="el-icon-tickets" style="color:#999;font-size:8px;padding-left: 5px;" v-if="item.situation"> {{ item.situation }}</span>
                </span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="通知模版" prop="template">
            <el-select v-model="dialog.rule.edit.data.template" placeholder="请选择">
              <el-option
                v-for="item in templates.list"
                :key="item.name"
                :label="item.name"
                :value="item">
                <span style="float: left">{{ item.name | formatName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        
          <el-form-item label="状态" prop="status">
              <el-switch
                v-model="dialog.rule.edit.data.status"
                active-color="#13ce66"
                inactive-color="#dddddd"
                :active-value="1"
                :inactive-value="0"
                @change="onToggleStatus(dialog.rule.edit.data)">
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
        rows:[],
        columns: [],
        selected: [],
        search: "",
        info:[]
      },
      rtype: {
        list: [
          { name:'sms', title:'短信', type:"netgate", 
            netgate:{
              address:"47.92.151.165", port:8080, username:"",password:"", cron: "*/1 * * * *", group: "mxsvr", log: true, retry_interval: 5, retry_num: 3, send_num: 5
            },
            jdbc:{
              driver:"com.mysql.jdbc.Driver", url:"jdbc:mysql://47.92.151.165:port/dbname", username:"",password:"", cron: "*/1 * * * *", group: "mxsvr", log: true, retry_interval: 5, retry_num: 3, send_num: 5
            },
            rest:{
              url:"http://47.92.151.165", username:"",password:"", cron: "*/1 * * * *", group: "mxsvr", log: true, retry_interval: 5, retry_num: 3, send_num: 5
            }
          } ,
          { name:'email', title:'邮件', address:"smtp.mxhichina.com", port:25, username:"",password:"", cron: "*/1 * * * *", group: "mxsvr", log: true, retry_interval: 5, retry_num: 3, send_num: 5},
          { name:'wechat', title:'企业微信', address:"47.92.151.165", port:8080, username:"",password:"", cron: "*/1 * * * *", group: "mxsvr", log: true, retry_interval: 5, retry_num: 3, send_num: 5}
        ]
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
    formatName(val){
      return val.replace(/.json/,'');
    },
    formatTime(val){
      return window.moment(val).format(window.global.register.format);
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
              return !val || data.name.toLowerCase().includes(val.toLowerCase()) || data.emails.includes(val.toLowerCase()) || data.phones.includes(val.toLowerCase())
          })
        }
      }
    },
    'dialog.rule.show'(val){
        if(val){
          this.init();
        }
    },
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
      }
  },
  created(){
     this.initData();
     this.init();
  },
  methods: {
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

      this.m3.callFS("/matrix/m3system/ldap/ldap.js").then(rtn=>{
          this.persons.userList = rtn.message;
      })

      this.m3.user.list().then(rtn=>{
        this.persons.list = this.travelUserTree(rtn.message.nodes);
      })

      this.m3.callFS("/matrix/m3event/notify/getTemplateList.js").then(rtn=>{
        this.templates.list = rtn.message.rows;
      })

      let param = encodeURIComponent( JSON.stringify({action:'list'}) );
      this.m3.callFS("/matrix/m3event/notify/situationAction.js",param).then(rtn=>{
        this.situation.list = rtn.message.rows;
      })
    },
    rowClassName({rowIndex}){
        return `notifyRule-row-${rowIndex}`;
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
      this.onReset('new');
    },
    onSave(){

        let param = encodeURIComponent(JSON.stringify({
                    action: 'add',
                    model: this.dialog.rule.new.data
                  }));
        
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
      this.dialog.rule.edit.data = item;
      this.dialog.rule.edit.data.template = _.find(this.templates.list, {fullname: _.values(item.template)[0]});
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
      let param = encodeURIComponent(JSON.stringify({
                    action: 'update',
                    model: row
                  }));
      this.m3.callFS("/matrix/m3event/notify/ruleAction.js",param).then(()=>{
          
          this.$message({
            type: "success",
            message: row.status ? "策略已启用" : "策略已停止"
          })

      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  
  .el-header{
    height:40px!important;
    line-height:40px;
  }
  .el-main{
    overflow: hidden;
  }
  
  
</style>

<style>
  .notifyRule-dialog .el-dialog{
    width: 70vw!important;
    height: auto;
  }
  .el-table__body .el-input__inner{
    border:unset!important;
  }
</style>