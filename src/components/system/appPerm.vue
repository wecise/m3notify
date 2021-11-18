// App Permission Select
<template>
     <el-container style="height:70vh;background:#f2f2f2;">
        <el-aside :width="!_.isEmpty(selectedNode)?'100%':'100%'" style="overflow:hidden;">
            <el-header style="height:10%;line-height:60px;">
                <el-input
                    placeholder="输入关键字进行过滤"
                    v-model="filterText"
                    clearable>
                </el-input>
            </el-header>
            <el-main style="padding:0px 10px; height: 80%;">
                <el-tree :data="treeData" 
                        :props="defaultProps" 
                        :default-checked-keys="selectedKeys"
                        :filter-node-method="onFilterNode"
                        node-key="id"
                        highlight-current
                        default-expand-all
                        auto-expand-parent
                        @node-click="onNodeClick"
                        @check-change="onCheckChange"
                        :expand-on-click-node="false"
                        :check-on-click-node="false"
                        style="background:transparent;"
                        show-checkbox
                        ref="tree">
                    <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
                        <span v-if="data.ftype=='dir'">
                            <i class="el-icon-folder" style="color:#FFC107;"></i>
                            <span>{{node.label}}</span>
                        </span>
                        <span v-else>
                            <i class="el-icon-c-scale-to-original" style="color:#0088cc;"></i>
                            <span>{{node.label}}</span>
                            <el-checkbox-group v-model="data.perms" style="float: right;padding-right: 10px;display:none;" v-if="data.checked">
                                <el-checkbox label="add">添加</el-checkbox>
                                <el-checkbox label="delete">删除</el-checkbox>
                                <el-checkbox label="edit">编辑</el-checkbox>
                                <el-checkbox label="list">查询</el-checkbox>
                            </el-checkbox-group>
                        </span>
                    </span>  
                </el-tree>
            </el-main>
            <el-footer style="text-align:right;height:10%;line-height:60px;">
                <el-button type="default" @click="rowData.show = false;">关闭</el-button>
                <el-button type="primary" @click="onUpdateRoleGroupByApp" :loading="loading">更新应用权限</el-button>
            </el-footer>
        </el-aside>
        <el-container v-if="!_.isEmpty(selectedNode)" style="width:40%;">
            <el-header>
                <h4>{{currentAppTitle}}</h4>
            </el-header>
            <el-main style="overflow: hidden;">
                <el-checkbox-group v-model="selectedNode.tags" v-if="!_.isEmpty(selectedNode)">
                    <el-checkbox label="add">添加</el-checkbox>
                    <el-checkbox label="delete">删除</el-checkbox>
                    <el-checkbox label="edit">编辑</el-checkbox>
                    <el-checkbox label="list">查询</el-checkbox>
                </el-checkbox-group>
            </el-main>
        </el-container>
    </el-container>   
</template>
				
<script>
    export default {
        props: {
            rowData: Object
        },
        data(){
            return {
                defaultProps: {
                    children: 'children',
                    label: 'cnname'
                },
                treeData: [],
                selectedNode: null,
                selectedNodes: [],
                selectedKeys: [],
                filterText: "",
                loading: false
            }
        },
        watch: {
            filterText(val) {
                if(_.isEmpty(val)){
                    this.onInit();
                } else {
                    this.$refs.tree.filter(val);
                }
            },
            selectedNodes(val){
                this.$emit("count:selectedApp", _.uniq(_.filter(val,(v)=>{ return v.checked; })).length);
            }
        },
        computed:{
            currentAppTitle(){
                return _.isEmpty(this.selectedNode) ? '页面权限': `${this.selectedNode.name} 页面权限`;
            }
        },
        created(){
            this.onInit();
        },
        methods: {
            onInit(){
                this.m3.callFS("/matrix/m3system/getAppList.js").then( (rtn)=>{
                    this.treeData = rtn.message;

                    this.onSetSelected();
                } );
            },
            onSetSelected(){
                let param = encodeURIComponent( JSON.stringify(this.rowData.row) );
                this.m3.callFS("/matrix/m3system/perm/byApp/getPermByApp.js", param).then( (rtn)=>{
                    let apps = rtn.message;

                    _.forEach(apps,(v)=>{
                        _.extend( this.findNodeById(v.id), { perms: ["add","delete","edit","list"], checked:true } );
                    });

                    this.selectedKeys = _.values(_.map(apps,'id'));
                } );
            },
            onFilterNode(value, data) {
                if (!value) return true;
                return data.name.indexOf(value) !== -1 || data.cnname.indexOf(value) !== -1 || data.enname.indexOf(value) !== -1 ;
            },
            findNodeById(id){
                let rtn = null;

                let find = function(nodes){
                    _.forEach(nodes,(v)=>{
                        
                        if(v.id == id){
                            rtn = v;
                            return;
                        }

                        if(v.nodes){
                            find(v.nodes)
                        }
                    })	
                } 

                find(this.treeData);

                return rtn;
            },
            onMouseEnter(item){
                this.$set(item, 'show', true)
            },
            onMouseLeave(item){
                this.$set(item, 'show', false)
            },
            onRefresh(item,index){
                let childrenData = fsHandler.fsList(item.fullname);

                this.$set(data, 'children', childrenData);
            },
            onNodeClick(data){
                try{

                    if(!data.isdir) {
                        eventHub.$emit("FS-NODE-OPENIT-EVENT", data, data.parent);

                    } else {

                        let rtn = _.map(fsHandler.fsList(data.fullname),(v)=>{
                            return _.extend(v,{show:false});
                        });

                        let childrenData = _.sortBy(rtn,'fullname');

                        this.$set(data, 'children', childrenData);

                        eventHub.$emit("FS-FORWARD-EVENT", data, data.fullname);
                        
                    }

                    this.selectedNode = data;

                    window.FS_TREE_DATA = this.$refs.tree.data;

                } catch(err){

                }

            },
            onCheckChange(data, checked, indeterminate){
                    
                // 设置复选框状态
                let perms = ['add','delete','edit','list'];

                if(checked){
                    if(!_.isEmpty(data.name)){
                        this.$set(data, 'checked', true);
                        this.$set(data, 'perms', perms);
                    }
                } else {
                    this.$set(data, 'checked', false);
                }

                // 更新
                if(_.isEmpty(data.name)) {
                    return false;
                }
                
                this.selectedNodes.push(data);

            },
            // 应用授权
            onUpdateRoleGroupByApp(event){
                
                this.loading = true;
                
                // 更新
                let checkedApps = _.filter(this.selectedNodes,{checked:true});
                let param = encodeURIComponent( JSON.stringify( { roleGroup: this.rowData.row, data: checkedApps } ) );
                
                this.m3.callFS("/matrix/m3system/perm/byApp/setPermByApp.js", param).then( (rtn)=>{
                    
                    if(rtn.message){

                        if(rtn.message.status !== 'error'){
                            
                            this.$message({
                                type: "success",
                                message: "更新应用权限成功！"
                            })

                            this.$emit('update:selectedApp');
                        } else {
                            this.$message({
                                type: "error",
                                message: "更新应用权限失败：" + typeof rtn.message.message == 'object' ? _.truncate(JSON.stringify(rtn.message.message),{
                                    'length': 500,
                                    'separator': ' '
                                }) : _.truncate(rtn.message.message,{
                                    'length': 500,
                                    'separator': ' '
                                })
                            })
                        }

                    } else {
                        
                        this.$message({
                            type: "success",
                            message: "更新标签权限成功！"
                        })

                        this.$emit('update:selectedApp');
                    }
                    
                    // 刷新应用缓存，针对应用权限过滤
                    userHandler.refreshAppCache();

                    this.loading = false;
                } );
            }
        }
    }
</script>