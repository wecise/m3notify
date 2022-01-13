<template>
    <Split :gutterSize="5" style="border:1px solid #ddd;">
        <SplitArea :size="20" :minSize="0" style="overflow:hidden;">
            <ldapMange root="/" @update:selectedNode="onLoadUser($event)" ref="ldapManage"></ldapMange>
        </SplitArea>
        <SplitArea :size="80" :minSize="0" style="overflow:hidden;">
            <user-list :model="model" ref="userList" @refresh-ldap="onRefreshLdap"></user-list>
        </SplitArea>
    </Split>
</template>

<script>
    export default {
        components:{
            ldapMange: () => import("./ldap.vue"),
            userList: () => import("./userList.vue"),
            userRoleGroup: () => import("./userRoleGroup.vue")
        },
        data(){
            return {
                selectedNode: null,
                model:{
                    rows: [],
                    columns: [
                                {"field":"firstname",title:"姓名", render:`var s=function(row, column, cellValue, index){
                                    return (row.firstname || "") + (row.lastname || "") || "";
                                };eval(s);`,width:160},
                                {"field":"email",title:"邮件",width:220},
                                {"field":"mobile",title:"手机",width:220},
                                {"field":"wechat",title:"微信",width:220},
                                {"field":"username",title:"用户名",width:120},
                                {"field":"passwd",title:"口令", visible:false},
                                {"field":"parent",title:"组",width:160},
                                {"field":"isactive",title:"状态", render:`var s=function(row, column, cellValue, index){
                                    return cellValue ? "正常" : "禁用";
                                };eval(s);`,width:60},
                                {"field":"fullname", title:"操作", visible:false}]
                },
                tabs: {
                    main: {
                        activeName: 'users'
                    }
                },
                splitInst: null,
                ldap: [],
                userList: []
            }
        },
        created(){
            this.m3.callFS("/matrix/m3system/ldap/ldap.js").then(res=>{
                this.userList = res;
            })
        },
        methods: {
            onTabClick(tab,event){
                if(tab.name == 'role' && this.$refs.userRoleGroupRef){
                    this.$refs.userRoleGroupRef.initData();
                }
            },
            onLoadUser(event) {
                this.selectedNode = event;
                this.ldap = [];
                // 只加载用户
                this.m3.user.listByFullname(event.fullname).then(res=>{
                    this.travelChildUser(res.message.nodes);
                    this.model.rows = _.orderBy(this.ldap.map(v=>{
                        return _.extend(v, _.find(this.userList,{id:v.id}));
                    }),'fullname');
                })
                
            },
            travelChildUser(nodes){
                
                _.forEach(nodes,(v)=>{
                    if(v.otype=='usr'){
                        this.ldap.push( _.extend( {grpset:[]}, v) );
                    }
                    if(v.nodes){
                        this.travelChildUser(v.nodes);
                    }
                })

            },
            onRefreshLdap(){
                this.$refs.ldapManage.onRefresh();
            }
        }
    }
</script>

<style scoped>
    .el-tabs--border-card /deep/ .el-tabs__content {
        padding: 0px;
        height: calc(100vh - 131px);
    }
    .el-tabs--border-card /deep/ .el-tab-pane{
        height: inherit;
    }

    .el-tabs--border-card /deep/ .el-tabs__header {
        background-color: #f2f2f2;
    }
</style>