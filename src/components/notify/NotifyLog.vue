<template>
    <el-container style="height:calc(100vh - 135px);" @mouseover.native="onLayout">
        <el-header style="padding:20px;">
            <el-form :inline="true" :model="formInline" class="demo-form-inline" size="mini">
               <!--  <el-form-item label="事件ID">
                    <el-input v-model="search.id" clearable></el-input>
                </el-form-item> -->
                <el-form-item label="接收人">
                    <el-input v-model="search.person" clearable></el-input>
                </el-form-item>
                <el-form-item label="时间区间">
                    <el-date-picker
                        size="mini"
                        v-model="search.time.value"
                        :picker-options="search.time.options"
                        type="datetimerange"
                        value-format="timestamp"
                        range-separator="至"
                        start-placeholder="开始时间"
                        end-placeholder="结束时间"
                        ref="datePicker">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="success" @click="onSearch">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="default" @click="onRefresh">刷新</el-button>
                </el-form-item>
            </el-form>

        </el-header>
        <el-main style="overflow: hidden;padding-top:0px;">
            <el-table
                border
                stripe
                v-loading="dt.loading"
                element-loading-spinner="el-icon-loading"
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
                                <div style="display:flex;flex-wrap:wrap;" v-else-if="item.field === 'people'">
                                    <el-popover
                                        width="550"
                                        trigger="click">
                                        <el-container>
                                            <el-main v-if="scope.row[item.field]">
                                                <el-input type="textarea" :value="scope.row[item.field].join('\n')" :rows="6" style="width:98%;white-space:nowrap;"></el-input>
                                            </el-main>
                                        </el-container>
                                        <el-button type="text" slot="reference"><i class="el-icon-user"></i> {{ scope.row[item['field']] | pickPeople }}</el-button>
                                    </el-popover>
                                </div>
                                <div style="display:flex;flex-wrap:wrap;" v-else-if="item.field === 'msg'">
                                    <el-popover
                                        width="550"
                                        trigger="click">
                                        <el-container>
                                            <el-main>
                                                <el-input type="textarea" :value="scope.row[item.field]" :rows="6" style="width:98%;white-space:nowrap;"></el-input>
                                            </el-main>
                                        </el-container>
                                        <el-button type="text" slot="reference">{{ scope.row[item['field']] }} <i class="el-icon-user"></i></el-button>
                                    </el-popover>
                                </div>
                                <div v-else>
                                    {{scope.row[item.field]}}
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                </template>
                <el-table-column label="操作" width="120" fixed="right">
                    <template slot="header" slot-scope="scope">
                        <el-input v-model="dt.filter" clearable placeholder="关键字"></el-input>
                    </template>
                    <template slot-scope="scope" >
                        <el-popover
                            width="300"
                            trigger="click">
                            <el-container>
                                <el-main>
                                    <el-input type="textarea" :value="scope.row['sendstatus']['msg']" :rows="6" style="width:98%;white-space:nowrap;"></el-input>
                                </el-main>
                            </el-container>
                            <el-button slot="reference" :type="scope.row['sendstatus']['status']==='ok'?'success':'danger'" style="display:none;">
                                {{scope.row['sendstatus']==='ok'?'发送成功':'发送失败'}}
                            </el-button>
                        </el-popover>
                        <!--el-button type="text" @click="onLookContent(scope.row)"><i class="el-icon-tickets"></i>  查看详情</el-button-->
                        <!-- <el-button type="text" @click="onDelete(scope.$index, scope.row)"> 删除</el-button> -->
                    </template>
                </el-table-column>
            </el-table>
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
            const eTime = new Date();
            const sTime = new Date();
            sTime.setTime(sTime.getTime() - 3600 * 1000 * 1);

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
                },
                search:{
                    time: {
                        options: {
                            shortcuts: [
                            {
                                text: '最近30分钟',
                                onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 1800 * 1000 * 1);
                                picker.$emit('pick', [start, end]);
                                }
                            },
                            {
                                text: '最近一小时',
                                onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 1);
                                picker.$emit('pick', [start, end]);
                                }
                            },
                            {
                                text: '最近一天',
                                onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', [start, end]);
                                }
                            },
                            {
                                text: '最近一周',
                                onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                                picker.$emit('pick', [start, end]);
                                }
                            }, 
                            {
                                text: '最近一个月',
                                onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                picker.$emit('pick', [start, end]);
                                }
                            }, 
                            {
                                text: '最近三个月',
                                onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                                picker.$emit('pick', [start, end]);
                                }
                            }]
                        },
                        value: [sTime,eTime]
                    },
                    id:"",
                    person: ""
                }
            }
        },
        filters:{
            pickPeople(val){
                try{
                    return val.map(v=>{
                        return v.split(",")[0]}
                    ).sort().join(" ")
                }catch(err){
                    console.error(err);
                    return null;
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
            'dt.filter':{
                handler(val){
                    if(_.isEmpty(val)){
                        this.initData();
                    }else {
                        this.dt.rows = this.dt.rows.filter(data => {
                            return !val || JSON.stringify(data).includes(val) || JSON.stringify(data).toLowerCase().includes(val)
                        })
                    }
                }
            }
        },
        methods: {
            onLayout(){
                this.$nextTick(()=>{
                    this.$refs.table.doLayout();
                })
            },
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
                    console.error(err);
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
                try{
                    return data.sendStatus[index].status;
                }catch(err){
                    console.error(err);
                    return 'unknown';
                }
            },
            onSearch(){
                let tmp = _.cloneDeep(this.search);
                let term = _.extend(tmp, {time:this.search.time.value});

                let param = encodeURIComponent(JSON.stringify(  {action:'search', data:term} ));
                
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
                    console.error(err);
                    this.dt.loading = false;
                });
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

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
      width: 90%;
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