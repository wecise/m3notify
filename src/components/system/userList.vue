<template>
    <el-container style="height:100%;">
        <el-header style="height:40px;line-height:40px;">
            <el-tooltip content="切换视图" open-delay="800" placement="top">
                <el-button type="text" icon="el-icon-s-fold" @click="onTogglePanel"></el-button>
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
        </el-header>   
        <el-main style="padding:0px;overflow:hidden;">
            <el-table
                :data="dt.rows"
                highlight-current-row="true"
                stripe
                height="calc(100vh - 170px)"
                style="width: 100%;"
                :row-class-name="rowClassName"
                :header-cell-style="headerRender"
                @row-dblclick="onRowDblclick"
                @row-contextmenu="onRowContextmenu"
                @selection-change="onSelectionChange"
                @current-change="onCurrentChange"
                ref="table">
                <!--el-table-column type="selection" align="center"></el-table-column--> 
                <el-table-column align="center" fixed>
                    <template slot-scope="scope">
                        <i class="el-icon-office-building el-avatar el-avatar--48 el-avatar--circle" style="font-size:32px;color:#03a9f4;" v-if="scope.row.otype==='org'"></i>
                        <i class="el-icon-user el-avatar el-avatar--48 el-avatar--circle" style="font-size:32px;color:#ffffff;background:#ff9800" v-else-if="scope.row.otype!=='org' && scope.row.isadmin"></i>
                        <i class="el-icon-user el-avatar el-avatar--48 el-avatar--circle" style="font-size:32px;color:#ffffff;background:#2196F3;" v-else></i>
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
                                <div v-else-if="['email','mobile','telephone'].includes(item.field) && scope.row[item.field]">
                                    <el-tag v-for="subItem in scope.row[item.field]" :key="subItem" effect="light"> 
                                        {{subItem}}
                                    </el-tag>
                                </div>
                                <div v-else>
                                    {{scope.row[item.field]}}
                                </div>
                            </template>
                    </el-table-column>
                </template>
                <el-table-column label="操作" width="160" fixed="right">
                    <template slot="header" slot-scope="scope">
                        <el-input v-model="dt.term" placeholder="关键字" clearable></el-input>
                    </template>
                    <template slot-scope="scope">
                        <div v-if="scope.row.username.includes(['/','system','admin'])">
                            
                        </div>
                        <div v-else-if="scope.row.otype=='usr'">
                            <!--el-tooltip content="授权" open-delay="800" placement="top">
                                <el-button type="text" icon="el-icon-s-check" @click="onToogleExpand(scope.row, scope.$index, 'userPermission')"></el-button>
                            </el-tooltip-->
                            <el-tooltip content="编辑" open-delay="800" placement="top">
                                <el-button type="text" icon="el-icon-edit" @click="onUpdateUser(scope.row,scope.$index)"></el-button>
                            </el-tooltip>
                            <el-tooltip content="删除" open-delay="800" placement="top">
                                <el-button type="text" @click="onDeleteUser(scope.row, scope.$index)" icon="el-icon-delete" v-if="!scope.row.fullname.includes(['/系统组','/'])"></el-button>
                            </el-tooltip>
                        </div>
                        <div v-else>
                            <!--el-tooltip content="授权" open-delay="800" placement="top">
                                <el-button type="text" icon="el-icon-s-check" @click="onToogleExpand(scope.row, scope.$index, 'userPermission')"></el-button>
                            </el-tooltip-->
                            <el-tooltip content="新建组织" open-delay="800" placement="top">
                                <el-button type="text" @click="$emit('NewGroup',scope.row,$event)" icon="el-icon-folder-add"></el-button>
                            </el-tooltip>
                            <el-tooltip content="新建用户" open-delay="800" placement="top">
                                <el-button type="text" @click="$emit('NewUser',scope.row,$event)" icon="el-icon-plus"></el-button>
                            </el-tooltip>
                            <el-tooltip content="编辑" open-delay="800" placement="top">
                                <el-button type="text" icon="el-icon-edit"  @click="onUpdateUser(scope.row,scope.$index)"></el-button>
                            </el-tooltip>
                            <el-tooltip content="删除" open-delay="800" placement="top">
                                <el-button type="text" @click="onDeleteUser(scope.row,scope.$index)" icon="el-icon-delete" v-if="!scope.row.fullname.includes(['/系统组','/'])"></el-button>
                            </el-tooltip>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 用户编辑 -->
            <el-dialog 
                width="50%!important"
                :title="'用户编辑 ' + dialog.user.row.username" :visible.sync="dialog.user.show" 
                :close-on-press-escape="false"
                :close-on-click-modal="false"
                v-if="dialog.user.show">
                <el-container>
                    <el-main>
                        <el-form label-width="80px">

                            <el-form-item label="组名称" required>
                                <el-input v-model="dialog.user.row.parent">
                                    <el-dropdown slot="prepend" trigger="hover">
                                        <span class="el-dropdown-link">
                                        更换组<i class="el-icon-arrow-down el-icon--right"></i>
                                        </span>
                                        <el-dropdown-menu slot="dropdown">
                                            <el-dropdown-item>
                                                <ldapMove 
                                                    root="/" 
                                                    :rowData="dialog.user.row"
                                                    @update:selectedLdapToMove="(($event)=>{ onUserGroupMoved(dialog.user.row,$event); })" 
                                                    ref="ldapManageMove"></ldapMove>
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </el-dropdown>
                                </el-input>
                            </el-form-item>

                            <el-form-item label="登录名称" required>
                                <el-input v-model="dialog.user.row.username" disabled="true"></el-input>
                            </el-form-item>

                            <el-form-item label="重置密码">
                                <el-switch v-model="dialog.user.resetPasswd"></el-switch>
                            </el-form-item>

                            <el-form-item label="登录密码" required v-if="dialog.user.resetPasswd">
                                <el-input type="password" v-model="dialog.user.passwd" autocomplete="off" show-password @blur="onPasswordVaild($event)">
                                    <template v-if="dialog.user.validPasswd>0">
                                        <el-button slot="append" type="success" icon="el-icon-check" style="background: #67c23a;color: #fff;" v-if="dialog.user.validPasswd==1">
                                            密码设置安全
                                        </el-button>
                                        <el-button slot="append" type="error" style="background: #ffa500;color: #fff;" icon="el-icon-warning" v-else>
                                            密码设置安全级别过低，建议由数字、符号、字母组合设立
                                        </el-button>
                                    </template>
                                </el-input>
                            </el-form-item>

                            <el-form-item label="确认密码" required v-if="dialog.user.resetPasswd">
                                <el-input type="password" v-model="dialog.user.checkPasswd" autocomplete="off" show-password></el-input>
                            </el-form-item>

                            <el-form-item label="姓名">
                                <el-input v-model="dialog.user.row.firstname" autofocus placeholder="姓" style="width:30%;"></el-input>
                                <el-input v-model="dialog.user.row.lastname" placeholder="名" style="width:30%;"></el-input>
                            </el-form-item>
                            
                            <el-form-item label="邮箱" required>
                                <el-input v-model="dialog.user.row.email"></el-input>
                            </el-form-item>

                            <el-form-item label="手机">
                                <el-input v-model="dialog.user.row.mobile"></el-input>
                            </el-form-item>

                            <el-form-item label="座机">
                                <el-input v-model="dialog.user.row.telephone"></el-input>
                            </el-form-item>

                            <el-form-item label="微信">
                                <el-input v-model="dialog.user.row.wechat"></el-input>
                            </el-form-item>

                            <el-form-item label="地址">
                                <el-input type="textarea" v-model="dialog.user.row.address"></el-input>
                            </el-form-item>
                            
                            <el-form-item label="激活">
                                <el-switch v-model="dialog.user.row.isactive" true-value="true" false-value="false"></el-switch>
                            </el-form-item>

                            <el-form-item label="管理员">
                                <el-switch v-model="dialog.user.row.isadmin" true-value="true" false-value="false"></el-switch>
                            </el-form-item>

                        </el-form>
                    </el-main>
                </el-container>
                <div slot="footer" class="dialog-footer">
                    <el-button type="default" @click="dialog.user.show = false;">关闭</el-button>
                    <el-button type="primary" @click="onSaveUser(dialog.user.row)" :disabled="dialog.user.resetPasswd && dialog.user.validPasswd==2">更新用户</el-button>	
                </div>
            </el-dialog>
        </el-main>
        <el-footer  style="height:30px;line-height:30px;">
            {{ info.join(' &nbsp; | &nbsp;') }}
        </el-footer>
    </el-container>
</template>

<script>
    export default {
        props: {
            model: Object
        },
        data(){
            return {
                dt:{
                    rows:[],
                    columns: [],
                    selected: [],
                    pagination:{
                        pageSize: 20,
                        currentPage: 1
                    },
                    term: ""
                },
                info: [],
                dialog: {
                    user: {
                        show: false,
                        row: null,
                        passwd: "",
                        checkPasswd: "",
                        resetPasswd: false,
                        changeGroup: {
                            change: false,
                            user: null,
                            newGroup: null
                        },
                        validPasswd: 0
                    }
                }
            }
        },
        components:{
            ldapMove: () => import("./ldapMove.vue")
        },
        filters:{
            pickDatetime(item){
                return window.moment(item).format(window.global.register.format);      
            }
        },
        watch: {
            model: {
                handler(){
                    this.initData();
                },
                deep:true,
                immediate:true
            },
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
                        this.dt.rows = this.dt.rows.filter(data => {
                            return !val || JSON.stringify(data).includes(val) || JSON.stringify(data).toLowerCase().includes(val)
                        })
                    }
                }
            }
        },
        methods: {
            onRefresh(){
                this.$emit("refresh-ldap");
            },
            initData(){
                _.extend(this.dt, {columns: _.map(this.model.columns, (v)=>{
                            
                    if(_.isUndefined(v.visible)){
                        _.extend(v, { visible: true });
                    }

                    if(!v.render){
                        return v;
                    } else {
                        return _.extend(v, { render: eval(v.render) });
                    }
                    
                })});

                _.extend(this.dt, {rows: this.model.rows});
                
            },
            rowClassName({row, rowIndex}){
                return `row-${rowIndex}`;
            },
            headerRender({ row, column, rowIndex, columnIndex }){
                if (rowIndex === 0) {
                    //return 'text-align:center;';
                }
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
            onDeleteUser(data,index){

                if(data.fullname === '/system'){
                    this.$message({
                        type: "warning",
                        message: "系统组，禁止删除！"
                    })
                    return false;
                }
                if(data.fullname === '/system/admin'){
                    this.$message({
                        type: "warning",
                        message: "系统管理员，禁止删除！"
                    })
                    return false;
                }

                const h = this.$createElement;
                this.$msgbox({
                        title: `确认要删除该用户`, 
                        message: h('span', null, [
                            h('p', null, `用户名称：${data.username}`),
                            h('p', null, `用户全称：${data.fullname}`)
                        ]),
                        showCancelButton: true,
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'error'
                }).then(() => {

                    this.m3.user.remove(data).then(rtn=>{
                        if(rtn.status === 'ok'){
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            });
                            
                            // 清除对象_group中的角色组信息
                            this.m3.callFS("/matrix/m3system/clearRoleGroupInstAfterDeleteRoleGroup.js",encodeURIComponent(data.fullname));

                            // 更新Ldap树
                            this.$emit("refresh-ldap");

                            // 更新Table
                            this.dt.rows.splice(index, 1);
                            
                        } else {
                            this.$message({
                                type: 'error',
                                message: '删除失败: ' + rtn
                            });
                        }
                    });

                }).catch(err => {
                    this.$message.info("删除操作已取消 " + err);
                }); 

            },
            onUpdateUser(row,index){
                this.dialog.user.row = row;
                this.dialog.user.resetPasswd = false;
                this.dialog.user.passwd = "";
                this.dialog.user.checkPasswd = "";
                this.dialog.user.show = true;
                this.dialog.user.validPasswd = 0;
            },
            onUserGroupMoved(user,newGroup){
                
                this.dialog.user.row.parent = newGroup.fullname;
                this.dialog.user.changeGroup.change = true;
                this.dialog.user.changeGroup.user = user;
                this.dialog.user.changeGroup.newGroup = newGroup;

                this.$confirm(`确认要更新该用户到新组：${newGroup.fullname}？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                        
                    this.m3.user.updateUserGroup(user, newGroup).then( res=>{
                        if(res.status === 'ok'){
                            this.$message({
                                type: "success",
                                message: "更新组成功"
                            })

                            // 更新Ldap树
                            this.$emit("refresh-ldap");

                            this.dialog.user.row.id = res.message; // 返回新的用户id
                            this.dialog.user.row.parent = newGroup.fullname;
                            
                        } else{
                            this.$message({
                                type: "error",
                                message: "更新组失败 " + res.message
                            })
                        }
                    } )
                    
                }).catch( () => {
                    this.$message({
                        type: "info",
                        message: "更新组操作已取消"
                    })
                });
                
            },
            onSaveUser(row){
                
                if(this.dialog.user.resetPasswd){

                    if (_.isEmpty(this.dialog.user.passwd)) {
                        this.$message({
                            type: "warning",
                            message: `登录密码不能为空！`
                        })
                        return false;
                    }

                    if (_.isEmpty(this.dialog.user.checkPasswd)) {
                        this.$message({
                            type: "warning",
                            message: `确认密码不能为空！`
                        })
                        return false;
                    }

                    if ( this.dialog.user.passwd !== this.dialog.user.checkPasswd) {
                        this.$message({
                            type: "warning",
                            message: `确认密码不一致！`
                        })
                        return false;
                    }

                    this.$set(row, 'resetPasswd', this.dialog.user.resetPasswd);
                    this.$set(row, 'passwd', this.dialog.user.passwd);
                }
                
                
                if (_.isEmpty(row.email)) {
                    this.$message({
                        type: "warning",
                        message: `邮件不能为空！`
                    })
                    return false;
                }

                if(typeof row.email == 'string'){
                    this.$set(row, 'email', _.compact(row.email.split(",")));
                }

                if(typeof row.mobile == 'string'){
                    this.$set(row, 'mobile', _.compact(row.mobile.split(",")));
                }

                if(typeof row.telephone == 'string'){
                    this.$set(row, 'telephone', _.compact(row.telephone.split(",")));
                }

                /* let checkEmail = function(email){
                    let regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
                    let emails = [];
                    let rtn = [];
                    if(typeof emails == 'object'){
                        emails = email;
                    } else {
                        emails = email.split(",");
                    }
                    _.forEach(emails,(v)=>{
                        rtn.push(regEmail.test(v));
                    })
                    
                    return _.includes(rtn,false);
                }
                
                if( checkEmail(row.email) ){
                    this.$message({
                        type: "warning",
                        message: `邮件格式不正确！`
                    })
                    return false;
                } */ 


                this.$confirm(`确认要更新该用户：${row.fullname}？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    
                    this.m3.user.update(row).then( rtn=>{
                        
                        if(rtn.status === 'ok'){
                            this.$message({
                                type: "success",
                                message: `更新用户: ${row.username} 成功！`
                            })

                            if(this.dialog.user.changeGroup.change){
                                this.onUserGroupMoved(this.dialog.user.changeGroup.user,this.dialog.user.changeGroup.newGroup);
                            }

                            this.dialog.user.show = false;

                        }
                    }).catch(err=>{
                        this.$message({
                            type: "error",
                            message: `更新用户: ${row.username} 失败 ` + err
                        })
                    });
                    
                }).catch(err => {
                    this.$message({
                        type: "info",
                        message: `更新用户: ${row.username} 操作已取消 ` + err
                    })
                });

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
                // $(this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$refs.leftView.$el).toggle();
            },
            onUpdateRoleGroup(row,roleGroups){
                _.forEach(roleGroups, (v)=>{
                    let group = userHandler.getGroupPermissionsById({id:v});
                    
                    let fullname = group.isldap?`U${row.fullname}`:`G${row.fullname}`
                    group.member.push(fullname);
                    
                    userHandler.updateGroupPermissionsAsync(group);
                })
            },
            onPasswordVaild(evt){
                this.m3.user.passwordVaild(evt.target.value).then((rtn)=>{
                    if(rtn.status === 'ok'){
                        this.dialog.user.validPasswd = 1;
                    } else {
                        this.dialog.user.validPasswd = 2;
                    }
                });
            }
        }
    }
</script>