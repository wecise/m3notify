// 组管理 选择用
<template>
    <el-container style="width:100%;height:100%;background:#f2f2f2;">
        <el-header style="height:35px;line-height:35px;">
            <el-row>
                <el-col :span="12">
                    <el-breadcrumb separator=">">
                        <el-breadcrumb-item>
                            <el-button type="text" @click="onForward('')"><i class="el-icon-s-home"></i> 角色组</el-button>
                        </el-breadcrumb-item>
                        <template v-for="(item,index) in fullname">
                            <el-breadcrumb-item   :key="index" v-if="index > 0">
                                <el-button type="text" @click="onForward(fullname.slice(0,index+1).join('/'))">{{item}}</el-button>
                            </el-breadcrumb-item>
                        </template>
                    </el-breadcrumb>
                </el-col>
                <el-col :span="12" style="text-align:right;">
                    <el-tooltip content="格子视图" placement="top">
                        <el-button type="text" @click="showView='grid'" icon="el-icon-picture">
                        </el-button>
                    </el-tooltip>
                    <el-tooltip content="表格视图" placement="top">
                        <el-button type="text" @click="showView='table'" icon="el-icon-menu">
                        </el-button>
                    </el-tooltip>
                    <!--el-tooltip content="更新权限" open-delay="800" v-if="showView=='table'">
                        <el-button type="text" icon="el-icon-edit-outline" @click="$parent.$parent.$parent.$parent.$parent.onUpdateRoleGroup"></el-button>
                    </el-tooltip-->	
                    <el-tooltip content="刷新" open-delay="800" placement="top">
                        <el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
                    </el-tooltip>
                    <el-tooltip content="导出" delay-time="500">
                        <el-dropdown @command="onExport">
                            <span class="el-dropdown-link">
                                <i class="el-icon-download el-icon--right"></i>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item command="csv">CSV</el-dropdown-item>
                                <el-dropdown-item command="json">JSON</el-dropdown-item>
                                <!--el-dropdown-item command="pdf">PDF</el-dropdown-item-->
                                <el-dropdown-item command="png">PNG</el-dropdown-item>
                                <!--el-dropdown-item command="sql">SQL</el-dropdown-item-->
                                <el-dropdown-item command="xls">XLS (Excel 2000 HTML format)</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </el-tooltip>
                </el-col>
            </el-row>
        </el-header>   
        <el-main style="width:100%;" v-if="showView=='table'">
            <el-table
                :data="dt.rows"
                highlight-current-row="true"
                style="width: 100%;"
                :row-class-name="rowClassName"
                :header-cell-style="headerRender"
                @row-dblclick="onRowDblclick"
                @row-contextmenu="onRowContextmenu"
                @selection-change="onSelectionChange"
                @current-change="onCurrentChange"
                ref="table">
                <el-table-column type="selection" align="center"></el-table-column> 
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        
                    </template>
                </el-table-column>
                <template v-for="(item,index) in dt.columns">
                    <el-table-column
                        sortable 
                        show-overflow-tooltip
                        
                        :key="index"
                        :prop="item.field"
                        :label="item ? item.title : ''"
                        :width="item.width"
                        v-if="item.visible">
                            <template slot-scope="scope">
                                <div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
                                    v-if="typeof item.render === 'function'">
                                </div>
                                <div v-else-if="_.includes(['name'],item.field)">
                                    <el-link type="info" :underline="true" @dblclick.native.prevent="onForward(scope.row.fullname)">
                                        {{scope.row.name}}
                                    </el-link>
                                </div>
                                <div v-else-if="_.includes(['fields', 'member', 'writable', 'readexps', 'readonly'],item.field)">
                                    <el-select :value="_.first(scope.row[item.field])" :placeholder="_.upperFirst(item.field)">
                                        <el-option
                                        v-for="subItem in scope.row[item.field]"
                                        :key="subItem"
                                        :label="subItem"
                                        :value="subItem">
                                        </el-option>
                                    </el-select>
                                </div>
                                <div v-else>
                                    {{ scope.row[item.field] }}
                                </div>
                            </template>
                    </el-table-column>
                </template>
                <el-table-column label="标签" prop="tags" width="200">
                    <template slot-scope="scope">
                        <mx-tag domain='script' :model.sync="scope.row.tags" :id="scope.row.id" limit="1"></mx-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
        <el-main style="width:100%;" v-else>
            <el-checkbox-group v-model="dt.selected" class="roleGroup-grid-node">
                <el-button type="default" 
                        style="max-width: 12em;width: 12em;height:110px;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);"
                        @dblclick.native="onForward(item.fullname)"
                        @click="onTriggerClick(item)"
                        :key="item.id"
                        v-for="item in dt.rows">
                        <i class="el-icon-s-check" style="font-size:48px;margin:5px;color:#FF9800;"></i>
                        <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:center;">
                            {{item.name}}
                        </p>
                        <el-checkbox :label="item" :ref="'checkBox_'+item.id"></el-checkbox>
                </el-button>
            </el-checkbox-group>
        </el-main>
        <el-footer  style="height:30px;line-height:30px;" v-if="showView=='table'">
            {{ info.join(' &nbsp; | &nbsp;') }}
        </el-footer>
    </el-container>
</template>

<script>
    export default {
        props: {
            rowData: Object,
            showView: String
        },
        data(){
            return {
                dt:{
                    rows:[],
                    columns: [
                        { "field":"name", title:"名称" },
                        { "field":"fullname", title:"全名称", visible:false},
                        { "field":"id", title:"ID", visible:false },
                        { "field":"isldap", title:"LDAP" },
                        { "field":"parent", title:"父节点" },
                        { "field":"member", title:"成员", width:200 },
                        { "field":"fields", title:"属性", width:200 },
                        { "field":"readexps", title:"数据表达式", width:200 },
                        { "field":"readonly", title:"读权限", width:200 },
                        { "field":"writable", title:"写权限", width:200 },
                        { "field":"selected", title:"选择", width:200, visible:false }
                    ],
                    selected: []
                },
                info: [],
                fullname: ["/"]
            }
        },
        filters:{
            pickDatetime(item){
                return moment(item).format(mx.global.register.format);      
            }
        },
        watch: {
            dt: {
                handler(val,oldVal){
                    this.info = [];
                    this.info.push(`共 ${this.dt.rows.length} 项`);
                    this.info.push(`已选择 ${this.dt.selected.length} 项`);
                    this.info.push(moment().format("YYYY-MM-DD hh:mm:ss.SSS"));
                },
                deep:true,
                immediate:true
            },
            'dt.selected'(val,oldVal){
                this.$emit('update:selectedRoleGroup', val);
            }
        },
        mounted(){
            this.initData();
        },
        methods: {
            layout(){
                let doLayout = ()=>{
                    if($(".el-table-column--selection",this.$el).is(':visible')){
                        _.delay(()=>{
                            //this.$refs.table.setCurrentRow(this.dt.rows[0]);
                            this.$refs.table.doLayout();
                        },1000)
                    } else {
                        setTimeout(doLayout,50);
                    }
                }
                doLayout();
            },
            initData(){
                const self = this;
                
                // 过滤系统组、当前角色组、同步的组织
                this.dt.rows = _.filter(userHandler.getGroupPermissionsByParent({parent:""}),(v)=>{
                    
                    if(!_.includes(['/','system','admin'],v.name) && v.fullname != this.rowData.fullname && !v.isldap){
                        return v;
                    };

                });

                let selected = _.map(this.rowData.member,(v)=>{ return v.replace(/^['G','U','O']/g,''); });
                if(selected){
                    this.dt.selected = _.filter(this.dt.rows, (v)=>{
                        if(_.includes(selected,v.fullname)){
                            return v;
                        }
                    });
                }

                let init = function(){
                    
                    try{
                        _.extend(self.dt, {columns: _.map(self.dt.columns, function(v){
                            
                            if(_.isUndefined(v.visible)){
                                _.extend(v, { visible: true });
                            }

                            if(!v.render){
                                return v;
                            } else {
                                return _.extend(v, { render: eval(v.render) });
                            }
                            
                        })});
                        
                    } catch(err){
                        console.error(err);
                    }
                };

                _.delay(()=>{
                    init();
                },1000)
                
            },
            rowClassName({row, rowIndex}){
                return `row-${rowIndex}`;
            },
            headerRender({ row, column, rowIndex, columnIndex }){
                if (rowIndex === 0) {
                    //return 'text-align:center;';
                }
            },
            onRefresh(){
                this.initData();
            },
            onForward(fullname){
                let rtn = userHandler.getGroupPermissionsByParent({parent: fullname});
                
                if(!_.isEmpty(rtn)){
                    this.dt.rows = rtn;

                    if(fullname){
                        this.fullname = fullname.split("/");
                    } else {
                        this.fullname = ["/"];
                    }
                }
            },
            onSelectionChange(val) {
                this.dt.selected = val;
            },
            onCurrentChange(val){
                this.dt.selected = [val];
            },
            onRowContextmenu(row, column, event){
                
            },
            onRowDblclick(row, column, event){
                
            },
            onToogleExpand(row,index){
                this.$refs.table.toggleRowExpansion(row);
            },
            onExport(type){
        
                let options = {
                    csvEnclosure: '',
                    csvSeparator: ', ',
                    csvUseBOM: true,
                    ignoreColumn: [0,1],
                    fileName: `tableExport_${moment().format("YYYY-MM-DD HH:mm:ss")}`,
                    type: type,
                };

                if(type === 'png'){
                    //$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
                    $(this.$refs.table.$el.querySelector("table.el-table__body")).tableExport(options);
                } else if(type === 'pdf'){
                    _.extend(options, {
                        jspdf: {orientation: 'l',
                                format: 'a3',
                                margins: {left:10, right:10, top:20, bottom:20},
                                autotable: {styles: {fillColor: 'inherit', 
                                                        textColor: 'inherit'},
                                            tableWidth: 'auto'}
                        }
                    });
                    $(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
                } else {
                    $(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
                }
                
            },
            onToggle(){
                this.$root.$refs.probeView.onToggle();
            },
            onNewRole(row){
                const self = this;

                let wnd = null;

                try{
                    if(jsPanel.activePanels.getPanel('jsPanel-user')){
                        jsPanel.activePanels.getPanel('jsPanel-user').close();
                    }
                }catch(error){

                }
                finally{
                    wnd = maxWindow.winUser("新建角色组",`<div id="ldap-newRoleGroup-container"></div>`,null,null); 
                }

                new Vue({
                    delimiters: ['{{', '}}'],
                    template: `<el-container>
                                    <el-main>
                                        <el-form ref="form" label-width="80px">

                                            <el-form-item label="角色组名称">
                                                <el-input v-model="role.name"></el-input>
                                            </el-form-item>

                                            <el-form-item label="父节点">
                                                <el-input v-model="role.parent" autofocus></el-input>
                                            </el-form-item>
                                            
                                        </form>
                                    </el-main>
                                    <el-footer style="text-align:right;">
                                        <el-button type="primary" @click="onSave">创建角色组</el-button>
                                    </el-footer>
                                </el-container>`,
                    data: {
                        role: {
                            name: "", 
                            parent: "",
                            member: []                  
                        }
                    },
                    created(){
                        if(!_.isEmpty(row)){
                            this.role.parent = row.fullname;
                        }
                    },
                    methods: {
                        onSave(){
                            
                            if (_.isEmpty(this.role.name)) {
                                this.$message({
                                    type: 'warning',
                                    message: '角色组名称不能为空！!'
                                });
                                return false;
                            }

                            userHandler.addGroupPermissionsAsync(this.role).then( (rtn)=>{
                                if(rtn == 1){
                                    this.$message({
                                        type: 'success',
                                        message: `角色组: ${this.role.name} 添加成功！`
                                    });
                                    
                                    self.onRefresh();
                                    wnd.close();
                                } else {
                                    this.$message({
                                        type: 'error',
                                        message: `角色组: ${this.role.name} 添加失败 ` + rtn
                                    });
                                }
                            } );

                        }
                    }
                }).$mount("#ldap-newRoleGroup-container");
            },
            onDeleteRole(row){
                const self = this;

                if( row.isldap ){
                    this.$message({
                        type: "warning",
                        message: "系统角色组，禁止删除！"
                    })
                    return false;
                }

                this.$confirm(`确认要删除该角色组：${row.fullname}？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    
                    let _csrf = window.CsrfToken;
                    let rtn = userHandler.deleteGroupPermissions(row,_csrf);
                    
                    if(rtn == 1){
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        });
                        
                        _.delay(()=>{
                            self.onRefresh();
                        },500)
                        
                    } else {
                        this.$message({
                            type: 'error',
                            message: '删除失败: ' + rtn
                        });
                    }
                }).catch(() => {
                    
                });
            },
            onTriggerClick(item){
                this.$refs['checkBox_'+item.id][0].$el.click();
            }
        }
    }
</script>