// Api permission List
<template>
    <el-container style="width:100%;height:70vh;background:#f2f2f2;">
        <el-header style="height:40px;line-height:40px;">
            <el-tooltip content="刷新" open-delay="800" placement="top">
                <el-button type="text" icon="el-icon-refresh" @click="initData"></el-button>
            </el-tooltip>
            <el-tooltip content="新建接口组" open-delay="800" placement="top">
                <el-button type="text" icon="el-icon-plus" @click="dialog.newApi.show = true;"></el-button>
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
        </el-header>   
        <el-main style="width:100%;padding-top:0px;">
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
                ref="table"
                :loading="dt.loading">
                <el-table-column type="selection" align="center"></el-table-column> 
                <el-table-column
                    sortable 
                    show-overflow-tooltip
                    v-for="(item,index) in dt.columns"
                    :key="index"
                    :prop="item.field"
                    :label="item ? item.title : ''"
                    :width="item.width"
                    v-if="item.visible">
                        <template slot-scope="scope">
                            <div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
                                v-if="typeof item.render === 'function'">
                            </div>
                            <div v-else-if="_.includes(['pprefix'],item.field)">
                                <el-select :value="_.first(scope.row[item.field])" v-if="!_.isEmpty(scope.row[item.field])" placeholder="Group">
                                    <el-option
                                    v-for="subItem in scope.row[item.field]"
                                    :key="subItem"
                                    :label="subItem"
                                    :value="subItem">
                                    </el-option>
                                </el-select>
                            </div>
                            <div v-else>
                                {{scope.row[item.field]}}
                            </div>
                        </template>
                </el-table-column>
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-container style="width:100%;" v-if="expandedView == 'edit'">
                            <el-main>
                                <mx-fs-tree-select root="/script" :selected="scope.row.pprefix" @update:selected="onUpdatePprefix(scope.row, $event) "></mx-fs-tree-select>
                            </el-main>
                            <el-footer style="text-align:right;">
                                <el-button type="default" icon="el-icon-close" @click="onToogleExpand(scope.row, scope.$index, 'edit')">关闭</el-button>
                                <el-button type="primary" icon="el-icon-edit" @click="onUpdateApi(scope.row, scope.$index)">确定</el-button>
                            </el-footer>
                        </el-container>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="160">
                    <template slot-scope="scope">
                        
                        <el-tooltip content="编辑" open-delay="800" placement="top">
                            <el-button type="text" icon="el-icon-edit" @click="onToogleExpand(scope.row, scope.$index, 'edit')"></el-button>
                        </el-tooltip>
                        <el-tooltip content="删除" open-delay="800" placement="top">
                            <el-button type="text" icon="el-icon-delete" @click="onDeleteApi(scope.row, scope.$index)"></el-button>
                        </el-tooltip>
                        
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
        <el-footer  style="height:30px;line-height:30px;">
            {{ info.join(' &nbsp; | &nbsp;') }}
        </el-footer>
        <el-dialog title="新建接口组" 
            :visible.sync="dialog.newApi.show" 
            :close-on-press-escape="false" 
            :close-on-click-modal="false"
            append-to-body
            v-if="dialog.newApi.show">
            <el-container style="width:100%;">
                <el-main>
                    <el-form label-position="top">
                        <el-form-item label="接口组名称">
                            <el-input v-model="dialog.newApi.name"></el-input>
                        </el-form-item>
                        <el-form-item label="选择接口">
                            <mx-fs-tree-select root="/script" @update:selected="onSetPprefix($event)"></mx-fs-tree-select>
                        </el-form-item>
                    </el-form>
                </el-main>
            </el-container>
            <div slot="footer" class="dialog-footer">
                <el-tooltip content="取消" open-delay="800" placement="top">
                    <el-button type="default" icon="el-icon-close" @click="dialog.newApi.show = false;">关闭</el-button>
                </el-tooltip>	
                <el-tooltip content="确定" open-delay="800" placement="top">
                    <el-button type="primary" icon="el-icon-edit" @click="onSaveApi">确定</el-button>
                </el-tooltip>	
            </div>
        </el-dialog>
    </el-container>
</template>

<script>
    export default {
        props: {
            roleGroup: Object
        },
        data(){
            return {
                dt:{
                    rows:[],
                    columns: [
                        { "field":"name", title:"名称", width:200 },
                        { "field":"pprefix", title:"角色组" }
                    ],
                    selected: [],
                    loading: true
                },
                info: [],
                dialog: {
                    newApi: {
                        show: false,
                        name: "",
                        pprefix: []
                    }
                },
                expandedView: 'edit',
                loading: false
            }
        },
        filters:{
            pickDatetime(item){
                return moment(item).format(mx.global.register.format);      
            }
        },
        watch: {
            'dt.rows': {
                handler(val,oldVal){
                    //this.initData();
                    this.layout();
                },
                deep:true,
                immediate:true
            },
            dt: {
                handler(val,oldVal){
                    this.info = [];
                    this.info.push(`共 ${this.dt.rows.length} 项`);
                    this.info.push(`已选择 ${this.dt.selected.length} 项`);
                    this.info.push(moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
                },
                deep:true,
                immediate:true
            },
            'dt.selected':{
                handler(val){
                    this.$emit("count:selectedApi",val.length);
                }
            }
        },
        mounted(){
            this.initData();

            // 当前角色组对应的接口
            _.delay(()=>{
                if(!_.isEmpty(this.roleGroup)){
                    _.forEach(this.dt.rows,(v)=>{
                        if(v._group && _.includes(v._group._all, this.roleGroup.fullname) ){
                            this.$refs.table.toggleRowSelection(v);
                        }
                    })
                }
            },1000)
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
                
                let init = ()=>{
                    
                    try{

                        userHandler.getApiPermissionsAsync().then( (rtn)=>{
                            this.dt.rows = rtn;
                            this.dt.loading = false;
                        } );

                        _.extend(this.dt, {columns: _.map(this.dt.columns, function(v){
                            
                            if(_.isUndefined(v.visible)){
                                _.extend(v, { visible: true });
                            }

                            if(!v.render){
                                return v;
                            } else {
                                return _.extend(v, { render: eval(v.render) });
                            }
                            
                        })});

                        _.extend(this.dt, {rows: this.dt.rows});

                        
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
            onSaveApi(){
                
                if(_.isEmpty(this.dialog.newApi.name)){
                    this.$message({
                        type: "warning",
                        message: "接口组名称不能为空！"
                    })

                    return false;
                }

                if(_.isEmpty(this.dialog.newApi.pprefix)){
                    this.$message({
                        type: "warning",
                        message: "接口组不能为空！"
                    })

                    return false;
                }

                userHandler.addApiPermissionsAsync( this.dialog.newApi ).then( (rtn)=>{
                    if(rtn === 1){
                        this.$message({
                            type: 'success',
                            message: `接口组 ${this.dialog.newApi.name} 添加成功！`
                        });
                        
                        this.dialog.newApi.show = false;
                        this.initData();

                    } else {
                        this.$message({
                            type: 'error',
                            message: `接口组 ${this.dialog.newApi.name} 添加失败！`
                        });
                    }
                } );

            },
            onUpdateApi(row,index){
                
                if(_.isEmpty(row.pprefix)){
                    this.$message({
                        type: "warning",
                        message: "接口组不能为空！"
                    })

                    return false;
                }

                let rtn = userHandler.UpdateApiPermissions( row );

                if(rtn === 1){
                    this.$message({
                        type: 'success',
                        message: `接口组 ${row.name} 更新成功！`
                    });
                    
                    this.initData();

                } else {
                    this.$message({
                        type: 'error',
                        message: `接口组 ${row.name} 更新失败！`
                    });
                }
            },
            onSetPprefix(event){
                this.dialog.newApi.pprefix = event.data;
            },
            onUpdatePprefix(row,event){
                row.pprefix = event.data;
            },
            onDeleteApi(row,index){

                this.$confirm(`确认要删除该接口组：${row.name}？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    
                    let rtn = userHandler.deleteApiPermissions(row);
                    
                    if(rtn==1){
                        this.$message({
                            type: 'success',
                            message: '删除接口组成功!'
                        });
                        
                        _.delay(()=>{
                            this.initData();
                        },500)

                    }else {
                        this.$message({
                            type: 'error',
                            message: '删除接口组失败!'
                        });
                    }
                }).catch(() => {
                    
                });
            },
            // 设置角色组
            onSelectionChange(val) {
                
                this.loading = true;

                if(_.isEmpty(val)){
                    _.forEach(this.dt.rows, (v,index)=>{
                        
                        userHandler.deleteApiPermissionsGroupsAsync({name:v.name, roleGroups: _.map([this.roleGroup],'fullname') });

                        // 删除角色组
                        let term = encodeURIComponent( JSON.stringify( { roleGroup: [this.roleGroup], data: [ _.extend(v, {checked:false} )] } ) );
                        this.m3.callFS("/matrix/m3system/updateGroupByApi.js", term);
                        
                    })	
                } else {
                    _.forEach(val, (v,index)=>{
                        userHandler.setApiPermissionsGroupsAsync({name:v.name, roleGroups: _.map([this.roleGroup],'fullname') });

                        // 更新角色组
                        let term = encodeURIComponent( JSON.stringify( { roleGroup: [this.roleGroup], data: [ _.extend(v, {checked:true} )] } ) );
                        this.m3.callFS("/matrix/m3system/updateGroupByApi.js", term);
                    })
                }
                
                this.dt.selected = val;

                this.loading = false;
            },
            onCurrentChange(val){
                this.dt.selected = [val];
            },
            onRowContextmenu(row, column, event){
                
            },
            onRowDblclick(row, column, event){
                
            },
            onToogleExpand(row,index,view){
                
                if(row.expand){
                    this.$refs.table.toggleRowExpansion(row,false);
                    this.$set(row, 'expand', !row.expand);
                    return false;
                }

                this.$refs.table.toggleRowExpansion(row);

                this.expandedView = view;

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
            onTogglePanel(){
                // So bad
                $(this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$refs.leftView.$el).toggle();
            },
            onSetRoleGroups(row,roleGroups){
                row.roleGroups = _.map(roleGroups,'fullname');
            },
            onUpdateRoleGroup(row,index){
                
                userHandler.setApiPermissionsGroupsAsync(row).then( (rtn)=>{
                    if(rtn === 1){
                    
                        this.$message({
                            type: 'success',
                            message: `${row.name} 角色组设置成功！`
                        });

                        this.initData();

                    } else {
                        this.$message({
                            type: 'error',
                            message: `${row.name} 角色组设置失败！`
                        });
                    }
                } );
            }
        }
    }
</script>