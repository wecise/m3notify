// 组管理 管理用
<template>
    <el-container style="height:inherit;">
        <el-main style="padding:0px;">
            <Split :gutterSize="5">
                <!--SplitArea :size="20" :minSize="0" style="overflow:hidden;background: #f2f2f2;">
                    <el-tree 
                        node-key="fullname"
                        default-expand-all
                        highlight-current
                        :data="tree.nodes"
                        :props="tree.defaultProps" 
                        @node-click="onNodeClick"
                        @node-expand="onNodeExpand"
                        style="background: transparent;"
                        ref="tree">
                        <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
                            <span class="el-icon-school" style="color:#FF9800;"></span>
                            <span>{{node.label}}</span>
                        </span>                  
                    </el-tree>
                </SplitArea-->
                <SplitArea :size="100" :minSize="0" style="overflow:hidden;">
                     <el-container>
                        <el-header style="height:40px;line-height:40px;display:flex;">
                            <el-breadcrumb separator=">" style="height:40px;line-height:40px;">
                                <el-breadcrumb-item>
                                    <el-button type="text" @click="onForward('')"><i class="el-icon-s-home"></i> 角色组</el-button>
                                </el-breadcrumb-item>
                                <template v-for="(item,index) in fullname">
                                    <el-breadcrumb-item  :key="index" v-if="index > 0">
                                        <el-button type="text" @click="onForward(fullname.slice(0,index+1).join('/'))">{{item}}</el-button>
                                    </el-breadcrumb-item>
                                </template>
                            </el-breadcrumb>
                            <div style="width: 100%;text-align: right;">
                                <!--el-tooltip content="切换视图" open-delay="800" placement="top">
                                    <el-button type="text" icon="el-icon-s-fold" @click="onTogglePanel"></el-button>
                                </el-tooltip-->
                                <el-tooltip content="新建角色组" open-delay="800" placement="top">
                                    <el-button type="text" icon="el-icon-plus" @click="onNewRole" style="padding-left:5px;"></el-button>
                                </el-tooltip>
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
                            </div>
                        </el-header>   
                        <el-main style="width:100%;padding:0px;">
                            <el-table
                                stripe
                                height="calc(100vh - 200px)"
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
                                <!--el-table-column type="selection" align="center"></el-table-column--> 
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
                                                <div v-else-if="item.field.includes(['name'])">
                                                    <el-link type="primary" :underline="true" @click.native.prevent="onForward(scope.row.fullname)" v-if="scope.row.isParent">
                                                        {{scope.row.name}} <i class="el-icon-more"></i>
                                                    </el-link>
                                                    <el-link type="info" :underline="true" v-else>
                                                        {{scope.row.name}}
                                                    </el-link>
                                                </div>
                                                <div v-else-if="item.field.includes(['isldap'])">
                                                    {{scope.row.isldap?'是':'否'}}
                                                </div>
                                                <div v-else-if="item.field.includes(['fields', 'member', 'writable', 'readexps', 'readonly'])">
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
                                <!--el-table-column label="标签" prop="tags" width="200">
                                    <template slot-scope="scope">
                                        <mx-tag domain='script' :model.sync="scope.row.tags" :id="scope.row.id" limit="1"></mx-tag>
                                    </template>
                                </el-table-column-->
                                <el-table-column label="操作" width="160">
                                    <template slot="header" slot-scope="scope">
                                        <el-input v-model="dt.term" placeholder="关键字" clearable></el-input>
                                    </template>
                                    <template slot-scope="scope">
                                    
                                        <div v-if="scope.row.name.includes(['/','system'])"></div>
                                        <div v-else-if="scope.row.name.includes(['admin']) && m3.auth.signedUser.username == 'admin'">
                                            <el-tooltip content="授权用户" open-delay="800" placement="top">
                                                <el-button type="text" icon="el-icon-user" @click="onSetLdap(scope.row)"></el-button>
                                            </el-tooltip>
                                        </div>
                                        <div v-else>
                                            <el-tooltip content="权限设置" open-delay="800" placement="top">
                                                <el-button type="text" icon="el-icon-lock" @click="onSetPermission(scope.row);"></el-button>
                                            </el-tooltip>
                                            <el-tooltip content="授权用户" open-delay="800" placement="top">
                                                <el-button type="text" icon="el-icon-user" @click="onSetLdap(scope.row)"></el-button>
                                            </el-tooltip>
                                            <el-tooltip content="新建角色组" open-delay="800" placement="top">
                                                <el-button type="text" icon="el-icon-plus" @click="onNewRole(scope.row)"></el-button>
                                            </el-tooltip>
                                            <!--el-tooltip content="编辑" open-delay="800" placement="top">
                                                <el-button type="text" icon="el-icon-edit" @click="onToogleExpand(scope.row,scope.$index,'roleGroupEdit')"></el-button>
                                            </el-tooltip-->
                                            <el-tooltip content="删除" open-delay="800" placement="top">
                                                <el-button type="text" icon="el-icon-delete" @click="onDeleteRole(scope.row)"></el-button>
                                            </el-tooltip>
                                        </div>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <el-dialog :title="permissionTitle" :visible.sync="dialog.permission.show" 
                                :close-on-press-escape="false"
                                :close-on-click-modal="false" v-if="dialog.permission.show" width="80vw">
                                <el-container style="width:100%;height:100%">
                                    <el-main style="padding:0px;overflow:hidden;">
                                        <el-tabs value="tagdirGroup">

                                            <el-tab-pane name="tagdirGroup">
                                                <span slot="label"><i class="el-icon-collection-tag"></i> 标签组合权限</span>
                                                <tagdir-group-select :model="{parent:'/system',name:'tagdir_tree_data.js',domain:'*'}" 
                                                    :rowData="dialog.permission"
                                                    @count:selectedTag="(count)=>{ this.count.tag = count;}"
                                                    @update:selectedTag="()=>{ this.initData(); }"
                                                    ref="tagdirTree"
                                                    v-if="!_.isEmpty(dialog.permission.row)"></tagdir-group-select>
                                            </el-tab-pane>
                                            <el-tab-pane name="app" lazy>
                                                <span slot="label"><i class="el-icon-files"></i> 应用权限 </span>
                                                <app-permission  :rowData="dialog.permission" ref="appTree" 
                                                    @count:selectedApp="(count)=>{ this.count.app = count;}"
                                                    @update:selectedApp="()=>{ this.initData(); }" v-if="!_.isEmpty(dialog.permission.row)"></app-permission>
                                            </el-tab-pane>	
                                            
                                            <el-tab-pane name="api" lazy>
                                                <span slot="label"><i class="el-icon-tickets"></i> 接口权限 </span>
                                                <api-permission 
                                                    @count:selectedApi="(count)=>{ this.count.api = count;}"
                                                    :roleGroup="dialog.permission.row"></api-permission>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-main>
                                </el-container>
                            </el-dialog>
                            <el-dialog :title="selectLdapTitle" :visible.sync="dialog.ldap.show" 
                                :close-on-press-escape="false" :close-on-click-modal="false" v-if="dialog.ldap.show" width="80vw">
                                <el-container style="height:100%;">
                                    <el-main style="overflow:hidden;padding:0px 10px;">
                                        <el-row :gutter="20">
                                            <el-col :span="24">
                                                <h4>用户成员</h4>
                                                <ldap-manage-select root="/" 
                                                    :rowData="dialog.ldap.row" 
                                                    @update:selectedLdap="onSetRoleGroupByLdap(dialog.ldap.row, $event)">
                                                </ldap-manage-select>
                                            </el-col>
                                        </el-row>
                                        <el-row :gutter="20">
                                            <el-col :span="24">
                                                <h4>角色成员</h4>
                                                <user-roleGroup-select showView="grid" 
                                                    :rowData="dialog.ldap.row"
                                                    @update:selectedRoleGroup="onSetRoleGroupByRoleGroup(dialog.ldap.row,$event)" 
                                                    ref="roleGroup">
                                                </user-roleGroup-select>
                                            </el-col>
                                        </el-row>
                                    </el-main>
                                </el-container>
                                <div slot="footer" class="dialog-footer">
                                    <el-button type="default" @click="dialog.ldap.show = false;">关闭</el-button>
                                    <el-button type="primary" @click="onUpdatePermission(dialog.ldap.row)">更新成员</el-button>
                                </div>
                            </el-dialog>
                            <el-dialog title="新建角色组" :visible.sync="dialog.role.show" 
                                :close-on-press-escape="false"
                                :close-on-click-modal="false" v-if="dialog.role.show" width="40vw">
                                <el-container>
                                    <el-main>
                                        <el-form ref="form" label-width="80px">

                                            <el-form-item label="角色组名称">
                                                <el-input v-model="dialog.role.row.name"></el-input>
                                            </el-form-item>

                                            <el-form-item label="父节点">
                                                <el-input v-model="dialog.role.row.parent" autofocus></el-input>
                                            </el-form-item>
                                            
                                        </el-form>
                                    </el-main>
                                    <el-footer style="text-align:right;">
                                        <el-button type="default" @click="dialog.role.show = false;">取消</el-button>
                                        <el-button type="primary" @click="onRoleSave">创建角色组</el-button>
                                    </el-footer>
                                </el-container>
                            </el-dialog>
                        </el-main>
                        <el-footer  style="height:30px;line-height:30px;">
                            {{ info.join(' &nbsp; | &nbsp;') }}
                        </el-footer>
                    </el-container>
                </SplitArea>
            </Split>
        
        </el-main>
    </el-container>
</template>
				
<script>
    export default {
        data(){
                return {
                    dt:{
                        rows:[],
                        columns: [
                            { "field":"name", title:"角色名称", width:200 },
                            { "field":"fullname", title:"全名称", width:200, visible:false},
                            { "field":"id", title:"ID", width:200, visible:false },
                            { "field":"isldap", title:"同步组织" , width:200 },
                            { "field":"parent", title:"父角色组" , width:200 },
                            { "field":"member", title:"成员" },
                            { "field":"fields", title:"属性", width:200 , visible:false },
                            { "field":"readexps", title:"数据表达式", width:200 , visible:false },
                            { "field":"readonly", title:"读权限", width:200 , visible:false },
                            { "field":"writable", title:"写权限", width:200 , visible:false },
                            { "field":"selected", title:"选择", width:200, visible:false }
                        ],
                        selected:[],
                        term: ""
                    },
                    info: [],
                    tree: {
                        defaultProps: {
                            children: 'children',
                            label: 'name'
                        },
                        nodes: []	
                    },
                    fullname: ["/"],
                    dialog: {
                        permission:{
                            row: {},
                            show: false
                        },
                        ldap:{
                            row: {},
                            show: false
                        },
                        role: {
                            show: false,
                            row: {
                                name: "", 
                                parent: "",
                                member: []
                            }
                        }
                    },
                    count: {
                        app: 0,
                        data: 0,
                        api: 0,
                        tag: 0

                    }
                }
            },
            filters:{
                pickDatetime(item){
                    return moment(item).format(mx.global.register.format);      
                }
            },
            computed:{
                permissionTitle(){
                    try{
                        return `权限设置 ${this.dialog.permission.row.fullname}`;
                    } catch(err){}
                },
                selectLdapTitle(){
                    try{
                        return `当前角色组 ${this.dialog.ldap.row.fullname}`;
                    } catch(err){}
                }
            },
            watch: {
                dt: {
                    handler(val){
                        this.info = [];
                        this.info.push(`共 ${val.rows.length} 项`);
                        this.info.push(`已选择 ${val.selected.length} 项`);
                        this.info.push(moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
                    },
                    deep:true,
                    immediate:true
                },
                'dt.term':{
                    handler(val){
                        if(_.isEmpty(val)){
                            this.initData();
                        } else {
                            this.dt.rows = this.dt.rows.filter(data => !val || data.name.toLowerCase().includes(val.toLowerCase()));
                        }
                    }
                }
            },
            mounted(){
                // 获取角色组树
                //this.initNodes();
                // 获取角色组列表
                this.initData();
            },
            methods: {				
                getRoleGroupChildrens(fullname){
                    
                    let rtn = userHandler.getGroupPermissionsByParent({parent: fullname});
                    if(!_.isEmpty(rtn)){
                        return true;
                    } else {
                        return false;
                    }
                    
                },
                initData(){
                    
                    this.m3.callFS("/matrix/m3system/group/getGroupList.js","").then( (rtn)=>{
                        
                        this.dt.rows = rtn.message;
                        
                        try{
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
                            
                        } catch(err){
                            console.error(err);
                        }
                    } )

                    // const self = this;
                    // 过滤 "/" 角色组
                    /* userHandler.getGroupPermissionsByParentAsync({parent:""}).then( (rtn)=>{
                        this.dt.rows = _.sortBy(_.filter(rtn,(v)=>{ 
                                            if(v.fullname != '/'){
                                                let isParent = this.getRoleGroupChildrens(v.fullname);
                                                return _.extend(v, {isParent: isParent}); 
                                            }
                                    }),['fullname'],['asc']);
                    } ); 
                    
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

                    init();
                    */
                    
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

                    this.m3.callFS("/matrix/m3system/group/getGroupList.js", encodeURIComponent(fullname)).then( (rtn)=>{
                        
                        if(!_.isEmpty(rtn.message)){
                            this.dt.rows = rtn.message;

                            if(fullname){
                                this.fullname = fullname.split("/");
                            } else {
                                this.fullname = ["/"];
                            }
                        }
                        
                    } )

                    /* userHandler.getGroupPermissionsByParentAsync({parent: fullname}).then( (rtn)=>{
                        
                        if(!_.isEmpty(rtn)){
                            this.dt.rows = _.map(rtn,(v)=>{
                                let isParent = this.getRoleGroupChildrens(v.fullname);
                                return _.extend(v, {isParent: isParent}); 
                            });

                            if(fullname){
                                this.fullname = fullname.split("/");
                            } else {
                                this.fullname = ["/"];
                            }
                        }
                    } ); */
                    
                },
                onSelectionChange(val) {
                    this.dt.selected = [val];
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
                    $(this.$refs.leftView.$el).toggle();
                },
                onNewRole(row){
                    this.dialog.role.row = row;
                    if(!_.isEmpty(row)){
                        this.dialog.role.row.parent = row.fullname;
                    }
                    this.dialog.role.show = true;
                },
                onRoleSave(){
                    if (_.isEmpty(this.dialog.role.row.name)) {
                        this.$message({
                            type: 'warning',
                            message: '角色组名称不能为空！!'
                        });
                        return false;
                    }

                    this.m3.user.addGroupPermissions(this.dialog.role.row).then( (rtn)=>{
                        if(rtn == 1){
                            
                            this.$message({
                                type: 'success',
                                message: `角色组: ${this.dialog.role.row.name} 添加成功！`
                            });
                            
                            this.onRefresh();

                        } else {
                            this.$message({
                                type: 'error',
                                message: `角色组: ${this.dialog.role.row.name} 添加失败 ` + rtn
                            });
                        }
                    });
                },
                onDeleteRole(row){
                    
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

                            // 清除对象_group中的角色组信息
                            this.m3.callFS("/matrix/m3system/clearRoleGroupInstAfterDeleteRoleGroup.js",encodeURIComponent(row.fullname)).then( ()=>{
                                this.onRefresh();
                            } );

                            // 清除对象UI选择实例
                            fsHandler.fsDeleteAsync("/matrix/system/group/tagdir",row.id);
                            
                        } else {
                            this.$message({
                                type: 'error',
                                message: '删除失败: ' + rtn
                            });
                        }
                    }).catch(() => {
                        
                    });
                },
                initNodes() {
                    this.m3.callFS("/matrix/system/getRoleGroupTree.js",null).then( (rtn)=>{
                        this.tree.nodes = rtn.message;
                    } );
                },
                onNodeClick(node){
                    this.onForward(row.fullname);
                },
                onNodeExpand(node){
                    
                },
                onMouseEnter(data){
                    this.$set(data, 'show', true)
                },
                onMouseLeave(data){
                    this.$set(data, 'show', false)
                },
                // 更新角色组合用户关联
                onUpdatePermission(row){
                    
                    userHandler.updateGroupPermissionsAsync(row).then( (rtn)=>{
                        if(rtn == 1){
                            this.$message({
                                type: "success",
                                message: "更新成功！"
                            })
                            this.dialog.ldap.show = false;
                        } else {
                            this.$message({
                                type: "error",
                                message: "更新失败 " + rtn
                            })
                            //this.initData();
                        }
                    } );
                    
                },
                // 更新角色组的用户
                onSetRoleGroupByLdap(row,event){
                    
                    _.forEach(event,(v)=>{
                        
                        if(_.isUndefined(v)) return;

                        if(v.checked){
                            row.member.push( 'U'+v.fullname );
                        } else {
                            _.pull(row.member, 'U'+v.fullname);
                        }
                    });

                },
                // 更新角色组的子角色组
                onSetRoleGroupByRoleGroup(row,event){
                    
                    let roleGroups = _.map(event,(v)=>{ return 'G'+ v.fullname; });
                    
                    row.member = _.filter(row.member,(v)=>{
                        if(!_.startsWith(v,'G')){
                            return v;
                        }
                    });
                    
                    row.member = _.filter(_.uniq( _.concat( row.member, roleGroups ) ), null);
                    
                },
                // 当前角色组授权
                onSetPermission(row){
                    this.$set(this.dialog.permission, 'row', row);
                    this.dialog.permission.show = true;
                },
                // 当前角色组关联ldap
                onSetLdap(row){
                    this.$set(this.dialog.ldap, 'row',row);
                    this.dialog.ldap.show = true;
                }

            }        
    }
</script>
