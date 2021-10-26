<template>
  <el-container>
    <el-header>
      <el-tooltip content="刷新">
        <el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
      </el-tooltip>
      <el-tooltip content="新建规则">
        <el-button type="text" icon="el-icon-plus" @click="onNew"></el-button>
      </el-tooltip>
      <!--el-tooltip content="导出规则">
        <el-button type="text" icon="el-icon-upload2"></el-button>
      </el-tooltip>
      <el-tooltip content="导入规则">
        <el-button type="text" icon="el-icon-download"></el-button>
      </el-tooltip-->
      <div style="position: absolute;right: 20px;top: 14px;">
        <el-input v-model="dt.search" clearable placeholder="关键字"></el-input>
      </div>
    </el-header>
    <el-main>
      <el-table
        :data="dt.rows"
        stripe
        height="calc(100vh - 200px)"
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
        <el-table-column label="操作" width="200">
          
          <template slot-scope="scope">
            <el-button type="text"  @click="onEdit(scope.row)"> 编辑</el-button>
            <el-button type="text"  @click="onDelete(scope.row)"> 删除</el-button>
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
      <el-dialog
        title="规则管理"
        :visible.sync="dialog.rule.show"
        :append-to-body="true"
        class="notifyRule-dialog"
        v-if="dialog.rule.show">
        <el-form :model="dialog.rule.data"  :rules="dialog.rule.rules" ref="notifyRuleForm" label-width="100px">
          <el-form-item label="名称" prop="name">
           <el-input v-model="dialog.rule.data.name" :disabled="dialog.rule.action==='update'?true:false"></el-input>
          </el-form-item>
          <el-form-item label="接收人员" prop="persons">
            <el-cascader
              v-model="dialog.rule.data.persons"
              :options="persons.list"
              :props="persons.props"
              clearable>              
              <template slot-scope="{ node, data }">
                <span>{{ data.username }}</span>
                <span v-if="!node.isLeaf && data.nodes.length>0"> ({{ data.nodes.length }})</span>
              </template>
              </el-cascader>
          </el-form-item>
          <el-form-item label="类型" prop="rtype">
            <el-select v-model="dialog.rule.data.rtype" multiple placeholder="请选择">
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
            <el-select v-model="dialog.rule.data.situation" placeholder="请选择">
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
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="dialog.rule.data.status"
              active-color="#13ce66"
              inactive-color="#dddddd"
              :active-value="1"
              :inactive-value="0"
              @change="onToggleStatus(dialog.rule.data)">
            </el-switch>
          </el-form-item>
          <el-form-item label="模版" prop="template">
            <el-select v-model="dialog.rule.data.template" placeholder="请选择">
              <el-option
                v-for="item in templates.list"
                :key="item.name"
                :label="item.name"
                :value="item">
                <span style="float: left">{{ item.name | formatName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.rule.show = false">取 消</el-button>
          <el-button type="primary" @click="onSave">确 定</el-button>
        </span>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script>
import _ from 'lodash';
import TagView from '../tags/TagView';

export default {
  name: "NotifyRuleView",
  data() {
    return {
      dt: {
        rows:[],
        columns: [],
        selected: [],
        search: ""
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
          label: 'username',
          children: 'nodes',
          multiple: true,
          emitPath: false,
          checkStrictly: true
        },
        list: []
      },
      situation:{
        list: []
      },
      templates: {
        list: []
      },
      dialog:{
        rule:{
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
            },
            action: "add"            
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
      })
    },
    init(){
      this.m3.userList().then(rtn=>{
        this.persons.list = [rtn.message];
      })

      this.m3.callFS("/matrix/m3event/notify/getTemplateList.js").then(rtn=>{
        this.templates.list = rtn.message.rows;
      })

      let param = encodeURIComponent( JSON.stringify({action:'list'}) );
      this.m3.callFS("/matrix/m3event/notify/situationAction.js",param).then(res=>{
        this.situation.list = res.message.rows;
      })
    },
    rowClassName({rowIndex}){
        return `notifyRule-row-${rowIndex}`;
    },
    onRefresh(){
      this.initData();
    },
    onReset(){
      this.dialog.rule.data = {
                                name: "",
                                persons: [],
                                rtype: "",
                                situation: null,
                                status: 0,
                                template: null
                              };
    },
    onNew(){
      this.dialog.rule.show = true;
      this.dialog.rule.action = "add";
      this.onReset();
    },
    onSave(){

        let param = encodeURIComponent(JSON.stringify({
                    action: this.dialog.rule.action,
                    model: this.dialog.rule.data
                  }));
        
        if(_.isEmpty(this.dialog.rule.data.name)){
          this.$message.warning("请输入名称");
          return false;
        }

        if(_.isEmpty(this.dialog.rule.data.persons)){
          this.$message.warning("请选择接收人员");
          return false;
        }

        if(_.isEmpty(this.dialog.rule.data.situation)){
          this.$message.warning("请选择场景");
          return false;
        }

        if(_.isEmpty(this.dialog.rule.data.template)){
          this.$message.warning("请选择通知内容模版");
          return false;
        }

        this.m3.callFS("/matrix/m3event/notify/ruleAction.js",param).then(()=>{
          
          this.$message({
            type: "success",
            message: "新建规则成功！"
          })
          this.initData();
          this.onReset();
          this.dialog.rule.show = false;

        });
    },
    onDelete(item){
      this.$confirm(`确认要删除该规则：${item.name}？`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
        
        let param = encodeURIComponent(JSON.stringify({action:"delete",model:item}));
        this.m3.callFS("/matrix/m3event/notify/ruleAction.js",param).then(()=>{
          
          this.$message({
                type: 'success',
                message: '删除规则成功!'
          })

          this.initData();

        }).catch((err)=>{
          
          this.$message({
              type: 'error',
              message: '删除规则失败 ' + err.message
          });

        });
          
      })
    },
    onEdit(item){
      this.dialog.rule.data = item;
      this.dialog.rule.data.template = _.find(this.templates.list, {fullname: _.values(item.template)[0]});
      this.dialog.rule.action = "update";
      this.dialog.rule.show = true;
    },
    onToggleStatus(row){
      this.dialog.rule.action = "update";
      let param = encodeURIComponent(JSON.stringify({
                    action: this.dialog.rule.action,
                    model: row
                  }));
      this.m3.callFS("/matrix/m3event/notify/ruleAction.js",param).then(()=>{
          
          this.$message({
            type: "success",
            message: row.status ? "规则已启用" : "规则已停止"
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
    padding:0px;
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