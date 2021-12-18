<template>
    <el-container>
        <el-header style="height:40px;line-height:40px;text-align:right;display:flex;">
            
            <div style="display:none;">
                <el-input v-model="filterText" placeholder="关键字" style="width:100%;" clearable>
                    <el-button slot="append" type="primary" icon="el-icon-search"></el-button>
                </el-input>
            </div>
            
           <span style="float:right;width:100%;">
                <el-tooltip content="新建组织">
                    <el-button type="text" icon="el-icon-office-building" @click="onNewGroup({'fullname':'/'})"></el-button>
                </el-tooltip>
                <el-tooltip content="新建用户">
                    <el-button type="text" icon="el-icon-user" @click="onNewUser({'fullname':'/'})"></el-button>
                </el-tooltip>
            </span>
        </el-header>
        <el-main style="padding:0px;">
            <el-tree 
                node-key="fullname"
                :auto-expand-parent="false"
                highlight-current
                :data="nodes" 
                :props="defaultProps" 
                :filter-node-method="onFilterNode"
                :expand-on-click-node="true"
                @node-click="onNodeClick"
                style="background: transparent;"
                ref="tree">
                <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
                    <span v-if="data.otype==='org'">
                        <span class="el-icon-school" style="color:#FF9800;"></span>
                        
                        <span v-if="data.username === '/'">{{m3.auth.Company.fullname}}</span><span v-else>{{node.label}} ({{data | pickCount}})</span>
                        <el-button v-show="data.show" type="text" @click.stop="onDeleteUser(node, data)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-delete" v-if="!data.fullname.includes(['/system','/'])"></el-button>
                        <el-button v-show="data.show" type="text" @click.stop="onNewUser(data)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-plus"></el-button>
                        <el-button v-show="data.show" type="text" @click.stop="onNewGroup(data)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-folder-add"></el-button>
                        <!-- <el-button v-show="data.show" type="text" @click.stop="onRefresh(data)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-refresh"></el-button> -->
                    </span>
                    <span v-else>
                        <span class="el-icon-user" style="color:#67c23a;"></span>
                        <span>{{node.label}}</span>
                        <el-button v-show="data.show" type="text" @click.stop="onDeleteUser(node, data)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-delete" v-if="data.username != 'admin'"></el-button>
                    </span>
                </span>                  
            </el-tree>
            <el-dialog title="新建组织" 
                width="50%!important"
                :visible.sync="dialog.group.show" v-if="dialog.group.show" 
                :close-on-press-escape="false"
                :close-on-click-modal="false">
                <el-container>
                    <el-main>
                        <el-form ref="form" label-width="80px" size="mini">

                            <el-form-item label="父组织名称">
                                <el-input v-model="dialog.group.parent" disabled="true"></el-input>
                            </el-form-item>

                            <el-form-item label="组织名称">
                                <el-input v-model="dialog.group.username" autofocus clearable></el-input>
                            </el-form-item>
                            
                        </el-form>
                    </el-main>
                </el-container>
                <div slot="footer" class="dialog-footer">
                    <el-button type="default" @click="dialog.group.show = false;">关闭</el-button>
                    <el-button type="primary" icon="el-icon-" @click="onSaveGroup">创建组</el-button>
                </div>
            </el-dialog>
            <el-dialog title="新建用户" 
                width="50%!important"
                :visible.sync="dialog.user.show" v-if="dialog.user.show" 
                :close-on-press-escape="false"
                :close-on-click-modal="false">
                <el-container>
                    <el-main>
                        <el-form ref="newUserForm" label-width="80px">

                            <el-form-item label="组织名称" required>
                                <el-input v-model="dialog.user.ldap.parent" autofocus disabled="true"></el-input>
                            </el-form-item>

                            <el-form-item label="登录名称" required>
                                <el-input v-model="dialog.user.ldap.username" autocomplete="off"></el-input>
                            </el-form-item>

                            <el-form-item label="登录密码" required>
                                <el-input type="password" v-model="dialog.user.ldap.passwd" autocomplete="off" show-password @blur="onPasswordVaild($event)">
                                </el-input>
                                <template v-if="dialog.user.validPasswd>0">
                                    <div style="font-weight: 400;font-size: 8px;color:#4caf50;" v-if="dialog.user.validPasswd==1">
                                        密码设置安全
                                    </div>
                                    <div style="font-weight: 400;font-size: 8px;color:#ff0000;" v-else>
                                        密码设置安全级别过低，建议由数字、符号、字母、特殊字符组合设立，且不少于10位
                                    </div>
                                </template>
                            </el-form-item>
                            
                            <el-form-item label="确认密码" required>
                                <el-input type="password" v-model="dialog.user.checkPass" autocomplete="off" show-password></el-input>
                            </el-form-item>

                            <el-form-item label="姓名">
                                <el-input v-model="dialog.user.ldap.firstname" placeholder="姓" style="width:30%;"></el-input>
                                <el-input v-model="dialog.user.ldap.lastname" placeholder="名" style="width:30%;"></el-input>
                            </el-form-item>

                            <el-form-item label="邮箱"
                                        :rules="[
                                        { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
                                        ]" required>
                                <el-input v-model="dialog.user.email"></el-input>
                            </el-form-item>

                            <el-form-item label="手机">
                                <el-input v-model="dialog.user.mobile" autocomplete="off"></el-input>
                            </el-form-item>

                            <el-form-item label="微信">
                                <el-input v-model="dialog.user.ldap.wechat" autocomplete="off"></el-input>
                            </el-form-item>

                            <el-form-item label="座机">
                                <el-input v-model="dialog.user.telephone" autocomplete="off"></el-input>
                            </el-form-item>

                            <el-form-item label="地址">
                                <el-input type="textarea" v-model="dialog.user.ldap.address" autocomplete="off"></el-input>
                            </el-form-item>

                            <el-form-item label="激活">
                                <el-switch v-model="dialog.user.ldap.isactive" true-value="true" false-value="false"></el-switch>
                            </el-form-item>
                            
                        </el-form>
                    </el-main>
                </el-container>
                <div slot="footer" class="dialog-footer">
                    <el-button type="default" @click="dialog.user.show = false;">关闭</el-button>
                    <el-button type="warning" v-if="dialog.user.loading"><i class="el-icon-loading"></i> 创建用户、同步文件系统，请稍后。。。</el-button>
                    <el-button type="primary" @click="onSaveUser" v-else :disabled="dialog.user.validPasswd==2">创建用户</el-button>
                </div>
            </el-dialog>
        </el-main>
    </el-container>
</template>

<script>
export default {
    props:{
        root:String
    },
    data(){
        return {
            defaultProps: {
                children: 'nodes',
                label: 'username'
            },
            nodes: [],
            selectedNode: null,
            dialog: {
                group: {
                    show: false,
                    parent: "", 
                    username: "",
                    passwd: "",
                    isactive: true,
                    isadmin: false,
                    otype: 'org' 
                },
                user: {
                    validPasswd: 0,
                    show: false,
                    ldap: {
                        parent: "", 
                        username: "",
                        firstname: "",
                        lastname: "",
                        passwd: "",
                        isactive: true,
                        isadmin: false,
                        otype: 'usr',
                        address: "",
                        wechat: ""            
                    },
                    email: "",
                    mobile: "",
                    telephone: "",
                    checkPass: "",
                    loading: false
                }
            }
        }
    },
    filters:{
        pickCount(data){
            try{
                return data.nodes.length;
            } catch(err){
                return 0;
            }
        }
    },
    created(){
        this.initNodes();

        // 刷新当前节点的用户列表
        this.$on("REFRESH-LDAP-LIST",()=>{
            this.$emit('update:selectedNode', this.$refs.tree.getCurrentNode());
        });
    },
    mounted(){
        this.$nextTick(()=>{
            this.$refs.tree.filter("undefined");
        })
    },
    watch: {
        nodes:{
            handler(val,oldVal){
                // 只显示组织
                if(this.$refs.tree){
                    this.$refs.tree.filter('org');	
                }
            }
        }
    },
    methods:{
        onRefresh(data){
            this.initNodes();
        },
        initNodes() {
            
            try{
                this.m3.user.listByFullname("/").then( (rtn)=>{
                    this.nodes = [rtn.message];
                    // 首次赋值给LDAP-LIST
                    this.$emit('update:selectedNode', _.first(this.nodes));
                } );
            } catch(err){
                console.error(err)
            } 

        },
        onFilterNode(value, data){
            return data.otype.indexOf(value) !== -1
        },
        onNodeClick(node){
            this.$emit('update:selectedNode', node);
            this.selectedNode = node;
        },
        onMouseEnter(data){
            this.$set(data, 'show', true);
            //this.$refs.tree.setCurrentKey(data.fullname);
        },
        onMouseLeave(data){
            this.$set(data, 'show', false);
        },
        onDeleteUser(node,data){
            
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

            this.$confirm(`确认要删除该用户：${data.fullname}？`, '提示', {
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
                        const parent = node.parent;
                        const children = parent.data.nodes || parent.data;
                        const index = children.findIndex(d => d.id === data.id);
                        children.splice(index, 1);
                        
                    } else {
                        this.$message({
                            type: 'error',
                            message: '删除失败: ' + rtn.message
                        });
                    }
                });
                
            }).catch(() => {
                this.$message.info("删除操作已取消");
            });
            
        },
        onNewUser(row){
            this.selectedNode = row;
            this.dialog.user.validPasswd = 0;
            this.dialog.user.show = true;
            this.dialog.user.ldap.parent = !_.isEmpty(row.fullname) ? row.fullname : '/';
            this.$nextTick(() => {
                this.dialog.user.ldap.username = "";
                this.dialog.user.ldap.passwd = "";
                this.dialog.user.ldap.isactive = true;
                this.dialog.user.ldap.isadmin = false;
                this.dialog.user.ldap.otype = 'usr';
                this.dialog.user.ldap.firstname = "";
                this.dialog.user.ldap.lastname = "";
                this.dialog.user.ldap.address = "";
                this.dialog.user.ldap.wechat = "";
                this.dialog.user.email = "";
                this.dialog.user.mobile = "";
                this.dialog.user.telephone = "";
                this.dialog.user.checkPass = "";
            })
        },
        onNewGroup(row){
            this.selectedNode = row;
            this.dialog.group.show = true;
            this.dialog.group.parent = !_.isEmpty(row.fullname) ? row.fullname : '/';
            this.$nextTick(() => {
                this.dialog.group.username = "";
            })
        },
        onSaveGroup(){
            
            if (_.isEmpty(this.dialog.group.parent)) {
                this.$message({
                    type: 'warning',
                    message: '所属组名称不能为空！!'
                });
                return false;
            }

            if (_.isEmpty(this.dialog.group.username)) {
                this.$message({
                    type: 'warning',
                    message: '组名称不能为空！'
                });
                return false;
            }

            this.m3.user.add(this.dialog.group).then(rtn=>{
                
                if(rtn.status==='ok'){
                    this.$message({
                        type: 'success',
                        message: `组: ${this.dialog.group.parent} 添加成功！`
                    });
                    
                    
                    this.onRefresh(this.selectedNode);
                    this.dialog.group.show = false;
                    

                } else {
                    this.$message({
                        type: 'error',
                        message: `组: ${this.dialog.group.parent}  添加失败 ` + rtn.message
                    });
                }
            }).catch(err=>{
                this.$message({
                    type: "error",
                    message: `组: ${this.dialog.group.parent} 添加失败 ` + err
                })
            });
        },
        onSaveUser(){
                        
            if (_.isEmpty(this.dialog.user.ldap.username)) {
                
                this.$message({
                    type: "warning",
                    message: `登录名称不能为空！`
                })
                return false;
            }

            if (_.isEmpty(this.dialog.user.email)) {
                this.$message({
                    type: "warning",
                    message: `用户邮件不能为空！`
                })
                return false;
            }

            
            /* let checkEmail = function(email){
                let regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
                let emails = email.split(",");
                let rtn = [];

                _.forEach(emails,(v)=>{
                    rtn.push(regEmail.test(v));
                })
                return _.includes(rtn,false);
            }
            
            if( checkEmail(this.dialog.user.email) ){
                this.$message({
                    type: "warning",
                    message: `用户邮件格式不正确！`
                })
                return false;
            } */

            if (_.isEmpty(this.dialog.user.ldap.passwd)) {
                this.$message({
                    type: "warning",
                    message: `登录密码不能为空！`
                })
                return false;
            }

            if (_.isEmpty(this.dialog.user.checkPass)) {
                this.$message({
                    type: "warning",
                    message: `确认密码不能为空！`
                })
                return false;
            }

            if ( this.dialog.user.ldap.passwd !== this.dialog.user.checkPass) {
                this.$message({
                    type: "warning",
                    message: `确认密码不一致！`
                })
                return false;
            }

            // emial
            this.$set(this.dialog.user.ldap,'email', _.compact(this.dialog.user.email.split(",")));
            // mobile
            this.$set(this.dialog.user.ldap,'mobile', _.compact(this.dialog.user.mobile.split(",")));
            // telephone
            this.$set(this.dialog.user.ldap, 'telephone', _.compact(this.dialog.user.telephone.split(",")));

            this.dialog.user.loading = true;

            this.m3.user.add(this.dialog.user.ldap).then(rtn=>{
                if(rtn.status === 'ok'){
                
                    this.$message({
                        type: "success",
                        message: `${this.dialog.user.ldap.username} ${this.dialog.user.email} 添加成功！`
                    })
                    
                    this.dialog.user.loading = false;

                    
                    this.initNodes;
                    this.$emit('update:selectedNode', this.selectedNode);
                    this.dialog.user.show = false;
                    

                } else {
                    this.$message({
                        type: "error",
                        message: `${this.dialog.user.ldap.username} ${this.dialog.user.email} 添加失败 ` + rtn.message
                    })
                    
                    this.dialog.user.loading = false;
                }
            }).catch(err=>{
                this.$message({
                    type: "error",
                    message: `${this.dialog.user.ldap.username} ${this.dialog.user.email} 添加失败 ` + err
                })
                
                this.dialog.user.loading = false;
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