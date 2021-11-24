<template>
    <el-container style="background:#f2f2f2;height: inherit;">
        <el-main style="padding-top:0px;">
            <Split direction="horizontal" :gutterSize="5">
                <SplitArea :size="20" :minSize="0" style="overflow:hidden;background:#ffffff;">
                    <DfsTree :root="root" 
                        @node-click="onNodeClick"
                        @dfs-newdir="onNewDir"
                        @dfs-newfile="onNewFile"
                        @dfs-delete="onDfsDelete"></DfsTree>
                </SplitArea>
                <SplitArea :size="80" :minSize="0" style="overflow:hidden;background:#ffffff;position: relative;">
                    <ToolBar :root="root" 
                             :rootTitle="rootTitle" 
                             :selected="selectedItem"
                             @toggle-view="onToggleView"
                             @dfs-refresh="onRefresh"
                             @select-all="onSelectAll"
                             @node-click="onNodeClick"
                             @dfs-newdir="onNewDir"
                             @dfs-newfile="onNewFile"
                             @dfs-delete="onDfsDelete"
                             @dfs-copyTo="onCopyTo"
                             @dfs-moveTo="onMoveTo"
                             @order-by="onOrderBy"
                             @dfs-export="onDfsExport"
                             @dfs-import="onDfsImport"></ToolBar>
                    <component v-bind:is="currentView" 
                            :model="model"
                            :selected.sync="selectedItem"
                            v-if="model"
                            @dblclick.native="onResetStatus"
                            @dbl-click="onLoad"
                            @menu-command="onMenuCommand"
                            ref="dfsList"
                            style="overflow-x: hidden;"></component>
                    <el-footer  style="height:30px;line-height:30px;width:100%;position:absolute;bottom:0px;">
                        {{ info.join(' &nbsp; | &nbsp;') }}
                    </el-footer>    
                </SplitArea>
            </Split>
            <el-dialog
                title="文件复制"
                :visible.sync="dialog.copyTo.show"
                width="30%"
                @close="onCopyToClose"
                append-to-body>
                <CopyTo :model="dialog.copyTo" :sourceList="selectedItem"></CopyTo>
            </el-dialog>
            <el-dialog
                title="文件移动"
                :visible.sync="dialog.moveTo.show"
                width="30%"
                @close="onMoveToClose"
                append-to-body>
                <MoveTo :model="dialog.moveTo" :sourceList="selectedItem"></MoveTo>
            </el-dialog>
            <el-dialog
                title="文件信息"
                :visible.sync="dialog.info.show"
                width="40%"
                @close="onMoveToClose"
                append-to-body>
                <DfsInfo :node="dialog.info.data" :inst="dialog.info" @dfs-refresh="onRefresh"></DfsInfo>
            </el-dialog>
        </el-main>
    </el-container>
</template>

<script>
    import _ from 'lodash';

    export default {
        props:{
            root: Object
        },
        data(){
            return {
                rootTitle: "我的文件",
                currentView: "gridView",
                selectedItem: [],
                info: [],
                model: null,
                dialog: {
                    copyTo:{
                        show: false
                    },
                    moveTo:{
                        show: false
                    },
                    info:{
                        show: false,
                        data: null
                    }
                }
            }
        },
        watch:{
            selectedItem: {
                handler(val){
                    this.info = [];
                    this.info.push(`共 ${this.model?this.model.length:0} 项`);
                    this.info.push(`已选择 ${val.length} 项`);
                    this.info.push(moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
                },
                deep:true,
                immediate:true
            }
        },
        components:{
            DfsTree: resolve => {require(['./dfsTree.vue'], resolve)},
            ToolBar: resolve => {require(['./toolBar.vue'], resolve)},
            gridView: resolve => {require(['./gridView.vue'], resolve)},
            thumbnailsView: resolve => {require(['./thumbnailsView.vue'], resolve)},
            tableView: resolve => {require(['./tableView.vue'], resolve)},
            CopyTo: resolve => {require(['./dfsCopyTo.vue'], resolve)},
            MoveTo: resolve => {require(['./dfsMoveTo.vue'], resolve)},
            DfsInfo: resolve => {require(['./dfsInfo.vue'], resolve)}
        },
        mounted(){
            this.$nextTick(()=>{
                this.onLoad(this.root);
            })
        },
        methods:{
            onToggleView(view){
                this.currentView = view;
            },
            onNodeClick(node){
                this.onLoad(node);
            },
            onSelectAll(){
                if(_.isEmpty(this.selectedItem)){
                    this.selectedItem = this.model;
                } else {
                    this.selectedItem = [];
                }
            },
            onLoad(node){

                
                let fullname = node ? node.fullname : this.root.fullname;
                this.root = node ? node : {fullname: this.root.fullname};
                this.m3.dfs.list({fullname:fullname}).then( res=>{
                    this.model = _.orderBy(_.map(res.message,(v,k)=>{

                                    return _.merge(v, {editable: false});

                                }),[v => v.name.toLowerCase(),"ctime"],["asc","desc"]);
                    this.info[0]=`共 ${this.model?this.model.length:0} 项`;
                });
            },
            onResetStatus(){

            },
            onMenuCommand(cmd){
                if(!cmd.type){
                    this[cmd.fun](cmd.param);
                } else {
                    this[cmd.fun](cmd.param,cmd.type);
                }
            },
            onRefresh(node){
                this.onLoad(node);
            },
            onNewDir(node){
                
                this.$prompt('请输入目录名称', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消'
                }).then(({ value }) => {

                    if(_.isEmpty(value)){
                        this.$message({
                            type: 'warning',
                            message: '请输入目录名称'
                        });
                        return false;
                    }

                    let param = {
                                    parent: node.fullname, 
                                    name: value,
                                    data:{content:null,ftype:'dir',attr:""}
                    };
                    
                    this.m3.dfs.newFile(param).then(res=>{
                        
                        this.$message({
                            type: "success",
                            message: '新建目录成功'
                        })

                        this.onRefresh(this.root);
                        
                    }).catch(err=>{
                        this.$message({
                            type: "error",
                            message: '新建目录失败：' + err
                        })
                    });

                    
                }).catch(err => {
                    this.$message({
                    type: 'info',
                    message: '取消新建目录操作 ' + err
                    });       
                });
            },
            onNewFile(node){
                this.$prompt('请输入文件名称', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消'
                }).then(({ value }) => {
                    
                    if(_.isEmpty(value)){
                        this.$message({
                            type: 'warning',
                            message: '请输入文件名称'
                        });
                        return false;
                    }

                    let param = {
                                    parent: node.fullname, 
                                    name: [value,'md'].join("."),
                                    data:{content:null,ftype:'md',attr:""}
                    };
                    
                    this.m3.dfs.newFile(param).then(res=>{
                        this.$message({
                            type: "success",
                            message: '新建文件成功'
                        })

                        this.onRefresh(this.root);

                    }).catch(err=>{
                        this.$message({
                            type: "error",
                            message: '新建文件失败：' + err
                        })
                    });
                    
                }).catch(err => {
                    this.$message({
                    type: 'info',
                    message: '取消新建文件操作 ' + err
                    });       
                });
            },
            onDfsDelete(node){
                
                let nodes = node?[node]:this.$refs.dfsList.selected;
                
                if(_.isEmpty(nodes)){
                    this.$message.warning("请选择需要删除项目")
                    return false;
                }

                const h = this.$createElement;
                this.$msgbox({
                    title: `确定要删除`,
                    message: h('p', null, [
                            _.map(nodes,s=>{
                                return h('p', null, s.fullname)
                            })
                        ]
                    ),
                    showCancelButton: true,
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'error'
                }).then(() => {
                    
                    nodes.forEach(v=>{
                        this.m3.dfs.deleteFile({parent:v.parent, name:v.name}).then(res=>{
                            if(res.status === 'ok'){
                                this.$message({
                                    type: "success",
                                    message: '删除成功'
                                })

                                this.onRefresh(this.root);
                            } else {
                                this.$message({
                                    type: "error",
                                    message: '删除失败：' + res.message
                                })
                            }

                        }).catch(err=>{
                            this.$message({
                                type: "error",
                                message: '删除失败：' + err
                            })
                        });
                    })

                }).catch(err => {
                    this.$message({
                        type: 'info',
                        message: '取消删除操作 ' + err
                    });   
                });
                
            },
            onOrderBy(data){
                let command = JSON.parse(data);
                this.model = _.orderBy(this.model,[command.prop],[command.type]);
            },
            onCopyTo(){
                this.dialog.copyTo.show = true;
            },
            onMoveTo(){
                this.dialog.moveTo.show = true;
            },
            onCopyToClose(){
                this.selectedItem = [];
            },
            onMoveToClose(){
                this.selectedItem = [];
            },
            onDownload(data){   
                if(data.ftype == 'dir'){
                    console.log(data)
                } else {
                    let url = `/fs/${data.parent}/${data.name}?type=download&issys=true`;
                    let target = '_blank';
                    window.open(url, target);
                }
            },
            onDfsExport(data){
                this.$confirm(`确认要导出 ${data.parent} 目录下的所有文件?`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                }).then(() => {
                    this.$message({
                        type: "info",
                        message: "导出操作将提交至后台，请稍后。。。"
                    })
                }).catch(() => {
                        
                }); 
            },
            onDfsImport(data){
                let file = data.target.files[0];
                    
                const h = this.$createElement;
                this.$msgbox({
                        title: `导入文件确认`, 
                        message: h('span', null, [
                            h('h4', null, `提示：导入后将覆盖原有文件，请确认！`),
                            h('p', null, `文件名称：${file.name}`),
                            h('p', null, `修改时间：${file.lastModifiedDate}`),
                            h('p', null, `文件大小：${file.size}`)
                        ]),
                        showCancelButton: true,
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        customClass: "fs-custom-msgbox"
                }).then(() => {

                    this.$message({
                        type: "info",
                        message: "导入操作将提交至后台，请稍后。。。"
                    })

                }).catch(() => {
                    this.$message({
                        type: "info",
                        message: "导入操作已取消"
                    })  
                }); 
            },
            onInfo(node){
                this.dialog.info.data = node;
                this.dialog.info.show = true;
            },
            getMenuByType(item){
                // 根据文件类型返回右键菜单
                let model = {
                    "js": [
                        { name: "下载", icon: "el-icon-download", fun: "onDownload", type: true },
                        { name: "编辑/运行", icon: "el-icon-video-play", fun: "editIt" },
                        { name: "删除", icon: "el-icon-delete", fun: "onDfsDelete", type: true },
                        { name: "共享", icon: "el-icon-share", fun: "shareIt" },
                        { name: "属性", icon: "el-icon-tickets", fun: "onInfo", divided:true }
                    ],
                    "html": [
                        { name: "发布应用", icon: "el-icon-thumb", fun: "onNewAppDeploy" },
                        { name: "下载", icon: "el-icon-download", fun: "onDownload", type: true },
                        { name: "编辑", icon: "el-icon-edit-outline", fun: "editIt" },
                        { name: "运行", icon: "el-icon-video-play", fun: "runHtml" },
                        { name: "运行链接", icon: "el-icon-link", fun: "copyUrl" },
                        { name: "删除", icon: "el-icon-delete", fun: "onDfsDelete", type: true },
                        { name: "共享", icon: "el-icon-share", fun: "shareIt" },
                        { name: "属性", icon: "el-icon-tickets", fun: "onInfo", divided:true }
                    ],
                    "htm": [
                        { name: "发布应用", icon: "el-icon-thumb", fun: "onNewAppDeploy" },
                        { name: "下载", icon: "el-icon-download", fun: "onDownload", type: true },
                        { name: "编辑", icon: "el-icon-edit-outline", fun: "editIt" },
                        { name: "运行", icon: "el-icon-video-play", fun: "runHtml" },
                        { name: "运行链接", icon: "el-icon-link", fun: "copyUrl" },
                        { name: "删除", icon: "el-icon-delete", fun: "onDfsDelete", type: true },
                        { name: "共享", icon: "el-icon-share", fun: "shareIt" },
                        { name: "属性", icon: "el-icon-tickets", fun: "onInfo" }
                    ],
                    "md":[
                        { name: "下载", icon: "el-icon-download", fun: "onDownload", type: true },
                        { name: "编辑", icon: "el-icon-edit-outline", fun: "editIt" },
                        { name: "打开", icon: "el-icon-video-play", fun: "openIt", type: null },
                        { name: "打开链接", icon: "el-icon-link", fun: "copyUrl" },
                        { name: "删除", icon: "el-icon-delete", fun: "onDfsDelete", type: true },
                        { name: "共享", icon: "el-icon-share", fun: "shareIt" },
                        { name: "属性", icon: "el-icon-tickets", fun: "onInfo", divided:true }
                    ],
                    "json":[
                        { name: "下载", icon: "el-icon-download", fun: "onDownload", type: true },
                        { name: "编辑", icon: "el-icon-edit-outline", fun: "editIt" },
                        { name: "打开", icon: "el-icon-video-play", fun: "openIt", type: true },
                        { name: "打开链接", icon: "el-icon-link", fun: "copyUrl" },
                        { name: "删除", icon: "el-icon-delete", fun: "onDfsDelete", type: true },
                        { name: "共享", icon: "el-icon-share", fun: "shareIt" },
                        { name: "属性", icon: "el-icon-tickets", fun: "onInfo", divided:true }
                    ],
                    "imap":[
                        { name: "下载", icon: "el-icon-download", fun: "onDownload", type: true },
                        { name: "编辑", icon: "el-icon-edit-outline", fun: "editIt" },
                        { name: "删除", icon: "el-icon-delete", fun: "onDfsDelete", type: true },
                        { name: "共享", icon: "el-icon-share", fun: "shareIt" },
                        { name: "属性", icon: "el-icon-tickets", fun: "onInfo", divided:true }
                    ],
                    "ishow":[
                        { name: "下载", icon: "el-icon-download", fun: "onDownload", type: true },
                        { name: "编辑", icon: "el-icon-edit-outline", fun: "editIt" },
                        { name: "删除", icon: "el-icon-delete", fun: "onDfsDelete", type: true },
                        { name: "共享", icon: "el-icon-share", fun: "shareIt" },
                        { name: "属性", icon: "el-icon-tickets", fun: "onInfo", divided:true }
                    ],
                    "iflow":[
                        { name: "下载", icon: "el-icon-download", fun: "onDownload", type: true },
                        { name: "编辑", icon: "el-icon-edit-outline", fun: "editIt" },
                        { name: "删除", icon: "el-icon-delete", fun: "onDfsDelete", type: true },
                        { name: "共享", icon: "el-icon-share", fun: "shareIt" },
                        { name: "属性", icon: "el-icon-tickets", fun: "onInfo", divided:true }
                    ],
                    "dir": [
                        { name: "打开", icon: "el-icon-folder-opened", fun: "openIt" },
                        { name: "删除", icon: "el-icon-delete", fun: "onDfsDelete", type: true },
                        { name: "共享", icon: "el-icon-share", fun: "shareIt" },
                        { name: "属性", icon: "el-icon-tickets", fun: "onInfo", divided:true }
                    ],
                    "normal": [
                        { name: "打开", icon: "el-icon-folder-opened", fun: "openIt" },
                        { name: "下载", icon: "el-icon-download", fun: "onDownload", type: true },
                        { name: "删除", icon: "el-icon-delete", fun: "onDfsDelete", type: true },
                        { name: "共享", icon: "el-icon-share", fun: "shareIt" },
                        { name: "属性", icon: "el-icon-tickets", fun: "onInfo", divided:true }
                    ]
                };

                var menu = null;
                try{
                    if(model[item.ftype]){
                        menu = model[item.ftype];
                    } else {
                        menu = model["normal"];
                    }
                } catch(err){
                    menu = model["normal"];
                } finally{
                    
                    if(_.startsWith(item.parent,'/web')){
                        menu.push({ name: "同步", icon: "el-icon-download", fun: "onSyncToLocal", divided:true});
                    }

                    if(_.endsWith(window.location.pathname,'api') && _.includes(['js'],item.ftype)) {
                        menu.push({ name: "任务", icon: "fas fa-tasks", fun: "", divided:true});
                    }
                }
                return menu;

            }
        }
    }
</script>

<style scoped>
    
    .el-main{
        overflow: hidden;
    }

    .el-main .content{
        height: calc(100% - 110px);
        overflow: auto;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-items: flex-start;
        align-content: flex-start;
        background: #ffffff;
    }

   
</style>