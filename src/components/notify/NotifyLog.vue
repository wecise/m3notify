<template>
    <el-container style="height:calc(100vh - 135px);">
        <el-header>
            <el-tooltip content="刷新">
                <el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
            </el-tooltip>
        </el-header>
        <el-main style="overflow: hidden;">
            <el-table
                :loading="dt.loading"
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
                            <div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' v-if="typeof item.render === 'function'"></div>
                            <div v-else>
                                <div v-if="item.field==='sendstatus' || item.field==='content'">
                                    <el-input type="textarea" :rows="4" :value="renderContent(scope.row[item.field])"></el-input>
                                </div>
                                <div v-else>
                                    {{scope.row[item.field]}}
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                </template>
                <el-table-column label="操作" width="260" fixed="right">
                    <template slot="header" slot-scope="scope">
                        <el-input v-model="dt.filter" clearable placeholder="关键字"></el-input>
                    </template>
                    <template slot-scope="scope">
                        <!-- <el-button type="text" @click="onLookLog(scope.row)"><i class="el-icon-document-copy"></i> 发送日志</el-button> -->
                        <el-button type="text" @click="onLookContent(scope.row)"><i class="el-icon-tickets"></i>  查看详情</el-button>
                        <!-- <el-button type="text" @click="onDelete(scope.$index, scope.row)"> 删除</el-button> -->
                    </template>
                </el-table-column>
            </el-table>
            <el-drawer
                :title="'发送日志 ' + dt.drawer.sendstatus.data.id"
                :visible.sync="dt.drawer.sendstatus.show"
                v-if="dt.drawer.sendstatus.data">
                <div style="height: calc(100vh - 0px);overflow:auto;padding:20px;">
                    {{dt.drawer.sendstatus.data}}
                    <h4>{{new Date(dt.drawer.sendstatus.data.sendtime).toLocaleString()}}</h4>
                    <el-timeline>
                        <el-timeline-item
                            placement="top"
                            v-for="activity in dt.drawer.sendstatus.data.send"
                            :key="activity.id"
                            :timestatmp="dt.drawer.sendstatus.data.sendtime">
                            <el-card>
                                <div v-for="v in Object.entries(activity)" :key="index">
                                    <p v-if="v[0]==='status'">
                                        发送状态: <span v-if="v[1]==='fail'" style="background:#ff0000;color:#ffffff;padding:3px;font-size:10px;">发送失败</span>
                                                    <span v-else style="background:#4caf50;color:#ffffff;padding:3px;font-size:10px;">发送成功</span>
                                    </p>
                                    <p v-else-if="v[0]==='id'">
                                        告警ID：<code>{{v[1]}}</code>
                                    </p>
                                    <p v-else-if="v[0]==='msg'">
                                        发送摘要：<code>{{v[1]}}</code>
                                    </p>
                                    <p v-else>
                                        v[0]：<code>{{v[1]}}</code>
                                    </p>
                                </div>
                            </el-card>
                        </el-timeline-item>
                    </el-timeline>
                </div>
            </el-drawer>
            <el-drawer
                title="发送详情"
                :visible.sync="dt.drawer.sendcontent.show"
                v-if="dt.drawer.sendcontent.data">
                <div style="height: calc(100vh - 90px);overflow:auto;padding:20px;">
                    <el-timeline>
                        <el-timeline-item
                            placement="top"
                            v-for="(activity,idx) in dt.drawer.sendcontent.data.sendContent"
                            :key="activity.id"
                            :timestatmp="activity.ctime">
                            <el-card>
                                <div v-for="v in Object.entries(activity)" :key="index">
                                    <div v-if="v[0]==='rule'">
                                        发送规则：{{v[1]}}
                                    </div>
                                    <div v-else-if="v[0]==='id'">
                                        告警ID：<code>{{v[1]}}</code>
                                        <p>发送状态：
                                            <el-button type="success" v-if="getSendStatus(dt.drawer.sendcontent.data,idx)==='ok'">成功</el-button>
                                            <el-button type="danger" v-else-if="getSendStatus(dt.drawer.sendcontent.data,idx)==='fail'">失败</el-button>
                                            <el-button type="primary" v-else>未知</el-button>
                                        </p>
                                    </div>
                                    <p v-else-if="v[0]==='to'">
                                        接收人员：<el-select :value="v[1][0]" clearable placeholder="接收人员">
                                                    <el-option
                                                        v-for="item in v[1]"
                                                        :key="item.name"
                                                        :label="item.name"
                                                        :value="item">
                                                    </el-option>
                                                    <span style="float: left">{{ item }}</span>
                                                </el-select>
                                    </p>
                                    <p v-else-if="v[0]==='ctime'">
                                        发送时间：{{ new Date(v[1]).toLocaleString() }}
                                    </p>
                                    <div v-else-if="v[0]==='msg'">
                                        发送内容：
                                        <div class="iphone">
                                            <div class="iphone-top">
                                                <span class="camera"></span>
                                                <span class="sensor"></span>
                                                <span class="speaker"></span>
                                            </div>
                                            <div class="iphone-screen">
                                                <div v-html="v[1]" style="padding: 10px;overflow-y: auto;"></div>
                                            </div>
                                            <div class="iphone-bottom">
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <p v-else>
                                        {{v[0]}}：<code>{{v[1]}}</code>
                                    </p>
                                </div>
                            </el-card>
                        </el-timeline-item>
                    </el-timeline>        
                </div>
            </el-drawer>
        </el-main>
        <el-footer style="height:40px;line-height:40px;background:#f2f2f2;">
            {{ dt.info.join(' &nbsp; | &nbsp;') }}
        </el-footer>
    </el-container>
</template>

<script>
    import _ from 'lodash';
    import Papa from 'papaparse';
    
    export default{
        data() {
            return {
                dt: {
                    loading: false,
                    rows:[],
                    columns: [],
                    selected: [],
                    filter: "",
                    info: [],
                    drawer:{
                        sendstatus:{
                            show: false,
                            data: null
                        },
                        sendcontent:{
                            show: false,
                            data: null
                        }
                    }
                }
            }
        },
        created(){
            this.initData();
        },
        watch:{
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
            'dt.filter':{
                handler(val){
                    if(_.isEmpty(val)){
                        this.initData();
                    }else {
                        this.dt.rows = this.dt.rows.filter(data => {
                            return !val || window.atob(data.sendstatus).includes(val) || window.atob(data.content).includes(val) || data.name.includes(val)
                        })
                    }
                }
            }
        },
        methods: {
            onLayout:_.debounce(()=>{
                console.log(_.now(),this.$refs)
                this.$refs.table.doLayout();
            },1000),
            rowClassName({rowIndex}){
                return `row-${rowIndex}`;
            },
            initData(){
                this.dt.loading = true;
                let param = encodeURIComponent( JSON.stringify({action:'read'}) );
                this.m3.callFS("/matrix/m3event/notify/logAction.js",param).then((rt)=>{
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
                    this.dt.loading = false;
                }).catch(err=>{
                    this.dt.loading = false;
                });
            },
            onRefresh(){
                this.initData();
            },
            onLookLog(row){
                this.dt.drawer.sendstatus.show = true;
                this.dt.drawer.sendstatus.data = _.extend(row, {send: JSON.parse(this.decodeBase64Content(row.sendstatus))} );
            },
            onLookContent(row){
                this.dt.drawer.sendcontent.show = true;
                this.dt.drawer.sendcontent.data = {sendContent: JSON.parse(this.decodeBase64Content(row.content)), sendStatus:  JSON.parse(this.decodeBase64Content(row.sendstatus)) };
            },
            decodeBase64Content(base64Content) {
                let commonContent = base64Content.replace(/\s/g, '+');
                commonContent = Buffer.from(commonContent, 'base64').toString();
                return commonContent;
            },
            renderContent(content){
                return Papa.unparse(this.decodeBase64Content(content));
            },
            getSendStatus(data,index){
                console.log(data.sendStatus[index].status)
                try{
                    return data.sendStatus[index].status;
                }catch(err){
                    console.error(err);
                    return 'unknown';
                }
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  
  .el-header{
    height: 40px!important;
    line-height: 40px!important;
  }

  .el-table /deep/ .el-textarea__inner{
      border: unset;
      background-color: transparent;
  }

  /* 样式1 */
  .iphone {
      box-shadow: inset 0 0 3px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px #999, 0 0 30px 0px rgba(0, 0, 0, 0.7);
      border: 5px solid #d9dbdc;
      background: #f8f8f8;
      padding: 15px;
      border-radius: 50px;
      height: auto;
      width: 70%;
      margin: 0px 10%;
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
      min-height: 40vh;
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