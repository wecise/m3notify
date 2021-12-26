<template>
  <el-container style="height: calc(100vh - 135px);">
    <el-main style="overflow:hidden;">
        <el-tabs value="base" tabPosition="bottom" type="border-card" v-if="rtype">
          
          <el-tab-pane label="发送配置" name="base" v-if="rtype.base && rtype.base.status">
            <el-container style="height: calc(100vh - 270px);">
              <el-main>
                <el-form :model="rtype.base"  label-width="100px">
                  <el-form-item label="定时器" prop="cron">
                    <el-input v-model="rtype.base.cron"></el-input>
                  </el-form-item>
                  <el-form-item label="服务器" prop="group">
                    <el-input v-model="rtype.base.group"></el-input>
                  </el-form-item>
                  <el-form-item label="开启日志" prop="log_console">
                    <el-switch v-model="rtype.base.log_console"></el-switch>
                  </el-form-item>
                  <template v-if="rtype.base.log_console">
                    <el-form-item label="日志目录" prop="log_dir">
                      <el-input v-model="rtype.base.log_dir" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="日志级别" prop="log_level">
                        <el-radio-group v-model="rtype.base.log_level">
                          <el-radio label="DEBUG">DEBUG</el-radio>
                          <el-radio label="INFO">INFO</el-radio>
                          <el-radio label="WARNING">WARNING</el-radio>
                          <el-radio label="ERROR">ERROR</el-radio>
                        </el-radio-group>
                    </el-form-item>
                  </template>

                  <el-form-item label="重试间隔" prop="retry_interval">
                    <el-input-number v-model="rtype.base.retry_interval"></el-input-number>
                  </el-form-item>
                  <el-form-item label="重试次数" prop="retry_num">
                    <el-input-number v-model="rtype.base.retry_num"></el-input-number>
                  </el-form-item>
                  <el-form-item label="发送数量" prop="send_num">
                    <el-input-number v-model="rtype.base.send_num"></el-input-number>
                  </el-form-item>

                  <el-form-item label="发送方式">
                    <el-checkbox v-model="rtype.email.status">{{rtype.email.name}}</el-checkbox>
                    <el-checkbox v-model="rtype.sms.status">{{rtype.sms.name}}</el-checkbox>
                    <el-checkbox v-model="rtype.wechat.status">{{rtype.wechat.name}}</el-checkbox>
                  </el-form-item>

                  <el-divider content-position="left">发送后动作</el-divider>
                  
                  <el-form-item label="发送后命令" prop="send_fields_name">
                    <el-input v-model="rtype.base.send_fields.name"></el-input>
                  </el-form-item>
                  <el-form-item label="发送后命令路径" prop="send_fields_path">
                    <el-input v-model="rtype.base.send_fields.path"></el-input>
                  </el-form-item>
                  <el-form-item label="发送后命令参数" prop="send_fields_params">
                    <el-input v-model="rtype.base.send_fields.params"></el-input>
                  </el-form-item>

                </el-form>
              </el-main>
            </el-container>
          </el-tab-pane>

          <el-tab-pane label="邮件配置" name="email" v-if="rtype.email && rtype.email.status">
            <el-container style="height: calc(100vh - 270px);">
              <el-main>
                <el-form :model="rtype.email"  label-width="100px">
                  <el-form-item label="SMTP地址" prop="smtp">
                    <el-input v-model="rtype.email.smtp"></el-input>
                  </el-form-item>
                  <el-form-item label="端口" prop="port">
                    <el-input v-model="rtype.email.port"></el-input>
                  </el-form-item>
                  <el-form-item label="用户名" prop="username">
                    <el-input v-model="rtype.email.username"></el-input>
                  </el-form-item>
                  <el-form-item label="用户口令" prop="password">
                    <el-input v-model="rtype.email.password"></el-input>
                  </el-form-item>
                  <el-form-item label="HTML支持" prop="html">
                    <el-switch v-model="rtype.email.html"></el-switch>
                  </el-form-item>
                  <el-form-item label="邮件主题" prop="subject">
                    <el-input v-model="rtype.email.subject"></el-input>
                  </el-form-item>
                  <el-form-item label="命令名称" prop="cmd">
                    <el-input v-model="rtype.email.cmd"></el-input>
                  </el-form-item>
                  <el-form-item label="命令路径" prop="cmdPath">
                    <el-input v-model="rtype.email.cmdPath"></el-input>
                  </el-form-item>
                </el-form>
              </el-main>
            </el-container>
          </el-tab-pane>

          <el-tab-pane label="短信配置" name="sms" v-if="rtype.sms && rtype.sms.status">
            <el-container style="height: calc(100vh - 270px);">
              <el-main>
                <el-form :model="rtype.sms"  label-width="100px">
                    
                    <el-form-item label="接口类型">
                      <el-radio-group v-model="rtype.sms.type">
                        <el-radio label="netgate">网关</el-radio>
                        <el-radio label="jdbc" disabled>JDBC</el-radio>
                        <el-radio label="rest" disabled>REST</el-radio>
                      </el-radio-group>
                    </el-form-item>

                    <template v-if="rtype.sms.type==='netgate'">

                      <el-form-item label="协议" prop="protocol">
                        <el-input v-model="rtype.sms.netgate.protocol"></el-input>
                      </el-form-item>
                      <el-form-item label="地址" prop="address">
                        <el-input v-model="rtype.sms.netgate.address"></el-input>
                      </el-form-item>
                      <el-form-item label="端口" prop="port">
                        <el-input v-model="rtype.sms.netgate.port"></el-input>
                      </el-form-item>
                      <el-form-item label="svcId" prop="svcId">
                        <el-input v-model="rtype.sms.netgate.svcId"></el-input>
                      </el-form-item>
                      <el-form-item label="srvId" prop="srvId">
                        <el-input v-model="rtype.sms.netgate.srvId"></el-input>
                      </el-form-item>
                      <el-form-item label="chanNo" prop="chanNo">
                        <el-input v-model="rtype.sms.netgate.chanNo"></el-input>
                      </el-form-item>
                      <el-form-item label="brNo" prop="brNo">
                        <el-input v-model="rtype.sms.netgate.brNo"></el-input><span class="el-icon-question" style="font-size:8px;color:#999;">机构NO</span>
                      </el-form-item>

                    </template>
                    <template v-if="rtype.sms.type==='jdbc'">
                      
                      <el-form-item label="Driver" prop="driver">
                          <el-input v-model="rtype.sms.jdbc.driver"></el-input>
                        </el-form-item>
                      <el-form-item label="Url" prop="url">
                        <el-input v-model="rtype.sms.jdbc.url"></el-input>
                      </el-form-item>
                      <el-form-item label="用户名" prop="username">
                        <el-input v-model="rtype.sms.jdbc.username"></el-input>
                      </el-form-item>
                      <el-form-item label="用户口令" prop="password">
                        <el-input v-model="rtype.sms.jdbc.password"></el-input>
                      </el-form-item>

                    </template>
                    <template v-if="rtype.sms.type==='rest'">
                      
                      <el-form-item label="URL" prop="url">
                        <el-input v-model="rtype.sms.rest.url"></el-input>
                      </el-form-item>
                      <el-form-item label="端口" prop="port">
                        <el-input v-model="rtype.sms.rest.port"></el-input>
                      </el-form-item>
                      <el-form-item label="用户名" prop="username">
                        <el-input v-model="rtype.sms.rest.username"></el-input>
                      </el-form-item>
                      <el-form-item label="用户口令" prop="password">
                        <el-input v-model="rtype.sms.rest.password"></el-input>
                      </el-form-item>

                    </template>

                     <el-form-item label="命令名称" prop="cmd">
                        <el-input v-model="rtype.sms.cmd"></el-input>
                      </el-form-item>
                      <el-form-item label="命令路径" prop="cmdPath">
                        <el-input v-model="rtype.sms.cmdPath"></el-input>
                      </el-form-item>
                </el-form>  
              </el-main>
            </el-container>
          </el-tab-pane>

          <el-tab-pane label="微信配置" name="wechat"  v-if="rtype.wechat && rtype.wechat.status">

            <el-container style="height: calc(100vh - 270px);">
              <el-main>
                  <el-form :model="rtype.wechat"  label-width="100px">
                  <el-form-item label="企业应用ID" prop="agentid">
                    <el-input v-model="rtype.wechat.agentid"></el-input><span class="el-icon-question" style="font-size:8px;color:#999;"> 企业应用的id，整型。可在应用的设置页面查看</span>
                  </el-form-item>
                  <el-form-item label="接受人" prop="corpid">
                    <el-input v-model="rtype.wechat.corpid"></el-input><span class="el-icon-question" style="font-size:8px;color:#999;"> 企业微信CorpID，ToUserName</span>
                  </el-form-item>
                  <el-form-item label="密钥" prop="corpsecret">
                    <el-input v-model="rtype.wechat.corpsecret"></el-input><span class="el-icon-question" style="font-size:8px;color:#999;"> 企业微信corpsecret，密钥</span>
                  </el-form-item>
                  <el-form-item label="命令名称" prop="cmd">
                    <el-input v-model="rtype.wechat.cmd"></el-input>
                  </el-form-item>
                  <el-form-item label="命令路径" prop="cmdPath">
                    <el-input v-model="rtype.wechat.cmdPath"></el-input>
                  </el-form-item>
                  </el-form> 
              </el-main>
            </el-container>

          </el-tab-pane>

        </el-tabs>
        
    </el-main>
    <el-footer>
      <el-button type="success" @click="onApply" :loading="loading">提交</el-button>
    </el-footer>
  </el-container>

</template>

<script>
import _ from 'lodash';

export default {
  name: "SetupView",
  data() {
    return {
      root: '/script/matrix/m3event/notify/server',
      rtype: null,
      loading: false
    };
  },
  created(){
     this.initData();
  },
  methods: {
    initData(){
        let param = {parent: this.root , fullname: this.root, name: 'server.json'};
        this.m3.dfs.read(param).then( res=>{
            this.rtype = JSON.parse(res);
        } );
    },
    onNodeClick(node){
      this.dt.columns = [];
      
      this.m3.dfs.read(node).then(res=>{
        let rt = JSON.parse(res.message);
        this.dt.rows = rt.rows;
        this.dt.columns = _.map(rt.columns,v=>{
          if(_.isUndefined(v.visible)){
              _.extend(v, { visible: true });
          }

          if(!v.render){
              return v;
          } else {
              return _.extend(v, { render: eval(v.render) });
          }
        });  
      })
    },
    onRefresh(){
      this.initData();
    },
    onApply(){

      let content = JSON.stringify(this.rtype,null,2);
    
      let param = {
                      parent: this.root, name: "server.json", 
                      data: { content: content, type: 'json', attr: {}, index: true }    
                  };
      
      this.loading = true;

      this.m3.dfs.write(param).then(()=>{
          
          let param = encodeURIComponent( JSON.stringify(content) );
          
          this.m3.callFS("/matrix/m3event/notify/setup.js", param).then(()=>{
              this.loading = false;
          }).catch(()=>{
            this.loading = false;
          })
          
          this.$message({
            type: "success",
            message: "更新成功"
          })

      }).catch((err)=>{
          this.$message({
            type: "warning",
            message: "更新失败 " + err
          })
          this.loading = false;
      })

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
  
  .el-footer{
    text-align: center;
    line-height: 60px;
  }
</style>
