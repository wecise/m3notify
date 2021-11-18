<template>
    <el-container style="height:calc(100vh - 135px);">
        <el-header>
            <el-tooltip content="刷新">
                <el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
            </el-tooltip>
            <div style="position: absolute;right: 20px;top: 0px;">
                <el-input v-model="dt.filter" clearable placeholder="关键字"></el-input>
            </div>
        </el-header>
        <el-main>
            <el-table
                :loading="dt.loading"
                stripe
                :data="dt.rows"
                :row-class-name="rowClassName"
                height="calc(100vh - 235px)"
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
                                    <el-input type="textarea" :rows="8" :value="renderContent(scope.row[item.field])"></el-input>
                                </div>
                                <div v-else>
                                    {{scope.row[item.field]}}
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                </template>
                <el-table-column label="操作" width="220" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="text" @click="onLookLog(scope.row)"><i class="el-icon-document-copy"></i> 发送日志</el-button>
                        <el-button type="text" @click="onLookContent(scope.row)"><i class="el-icon-tickets"></i>  发送内容</el-button>
                        <!-- <el-button type="text" @click="onDelete(scope.$index, scope.row)"> 删除</el-button> -->
                    </template>
                </el-table-column>
            </el-table>
            <el-drawer
                :title="'发送日志 ' + dt.drawer.sendstatus.data.id"
                :visible.sync="dt.drawer.sendstatus.show"
                :with-header="false"
                v-if="dt.drawer.sendstatus.data">
                <el-container>
                    <el-main>
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
                    </el-main>
                </el-container>
            </el-drawer>
            <el-drawer
                :title="'发送内容 ' + dt.drawer.sendcontent.data.id"
                :visible.sync="dt.drawer.sendcontent.show"
                :with-header="false"
                v-if="dt.drawer.sendcontent.data">
                <el-container>
                    <el-main>
                        <el-timeline>
                            <el-timeline-item
                                placement="top"
                                v-for="activity in dt.drawer.sendcontent.data"
                                :key="activity.id"
                                :timestatmp="activity.ctime">
                                <div>
                                    <div v-for="v in Object.entries(activity)" :key="index">
                                        <div v-if="v[0]==='rule'">
                                            发送规则：{{v[1]}}
                                        </div>
                                        <p v-else-if="v[0]==='id'">
                                            告警ID：<code>{{v[1]}}</code>
                                        </p>
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
                                            发送内容：<div v-html="v[1]" style="border:5px solid #dddddd;padding:5px;overflow:auto;border-radius:15px;margin:10px 0px 10px 0px;width:220px;"></div>
                                        </div>
                                        <p v-else>
                                            {{v[0]}}：<code>{{v[1]}}</code>
                                        </p>
                                    </div>
                                </div>
                            </el-timeline-item>
                        </el-timeline>
                        
                    </el-main>
                </el-container>
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
                this.dt.drawer.sendcontent.data = JSON.parse(this.decodeBase64Content(row.content));
            },
            decodeBase64Content(base64Content) {
                let commonContent = base64Content.replace(/\s/g, '+');
                commonContent = Buffer.from(commonContent, 'base64').toString();
                return commonContent;
            },
            renderContent(content){
                return Papa.unparse(this.decodeBase64Content(content));
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
  .el-main{
    overflow: hidden;
  }
</style>