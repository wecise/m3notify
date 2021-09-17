<template>
    <el-container>
        <el-header>
            <el-input v-model="filterText" 
                placeholder="搜索"
                clearable></el-input>

                <el-dropdown placement="top-start" trigger="click">
                    <el-tooltip content="导出、导入" >
                        <el-button type="text" icon="el-icon-menu" style="color:#333333;padding-left: 10px;"></el-button>
                    </el-tooltip>
                    <el-dropdown-menu slot="dropdown">
                        <div class="tool-box">
                            <div class="tool">
                                <div>导入</div>
                                <p>
                                    <label for="auto-file-upload">
                                        <span class="el-icon-download" style="cursor:pointer;font-size:16px;padding:10px;"></span>
                                    </label>
                                    <input id="auto-file-upload" type="file" @change="onImport" required="required" style="display:none;" />
                                </p>
                            </div>
                            <div class="tool" @click="onExport(null)">
                                <div>导出</div>
                                <p>
                                    <el-button type="text">
                                        <span class="el-icon-download" style="cursor:pointer;font-size:16px;"></span>
                                    </el-button>
                                </p>
                            </div>
                        </div>
                    </el-dropdown-menu>
                </el-dropdown>
        </el-header>
        <el-main>
            <el-tree :data="treeData" 
                    :props="defaultProps" 
                    node-key="key"
                    highlight-current
                    accordion
                    @node-click="onNodeClick"
                    :filter-node-method="onNodeFilter"
                    :expand-on-click-node="true"
                    auto-expand-parent
                    :default-expanded-keys="defaultExpandedKeys"
                    style="background:transparent;"
                    ref="tree">
                <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
                    <span v-if="data.dir">
                        <i class="el-icon-timer" style="color:#FFC107;" v-if="pickTypeFromLabel(node.label,'jobs')"></i>
                        <i class="el-icon-bank-card" style="color:#FFC107;" v-else-if="pickTypeFromLabel(node.label,'rules')"></i>
                        <i class="el-icon-s-platform" style="color:#FFC107;" v-else-if="pickTypeFromLabel(node.label,'hosts')"></i>
                        <i class="el-icon-lock" style="color:#FFC107;" v-else-if="pickTypeFromLabel(node.label,'lock')"></i>
                        <i class="el-icon-warning" style="color:#FFC107;" v-else-if="pickTypeFromLabel(node.label,'notify')"></i>
                        <i class="el-icon-folder" style="color:#FFC107;" v-else></i>
                        <span v-if="node.label==='/'"> 我的配置({{data.nodes.length}})</span>
                        <span v-else> {{ pickLabel(node.label) }}({{data.nodes.length}})</span>
                        <el-dropdown v-show="data.show" style="float:right;width:14px;margin:0 5px;">
                            <span class="el-dropdown-link">
                                <i class="el-icon-more el-icon--right"></i>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item @click.native="onRefresh(data)" icon="el-icon-refresh">刷新</el-dropdown-item>
                                <el-dropdown-item @click.native="onNewFile(data)" icon="el-icon-plus" divided>新建</el-dropdown-item>
                                <el-dropdown-item @click.native="onNewDir(data)" icon="el-icon-folder-add">新建目录</el-dropdown-item>
                                <el-dropdown-item @click.native="onEditFile(data)" icon="el-icon-edit-outline" divided>编辑</el-dropdown-item>
                                <el-dropdown-item @click.native="onExport(data)" icon="el-icon-download" divided>导出</el-dropdown-item>
                                <el-dropdown-item @click.native="onDelete(data)" icon="el-icon-delete" divided>删除</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </span>
                    <span v-else>
                        <i class="el-icon-c-scale-to-original" style="color:#0088cc;"></i>
                        <span draggable="true"  @dragstart="onDragStart(data,$event)" @dragend="onDragEnd($event)"> {{ pickLabel(node.label) }}</span>
                        <el-dropdown v-show="data.show" style="float:right;width:14px;margin:0 5px;">
                            <span class="el-dropdown-link">
                                <i class="el-icon-more el-icon--right"></i>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item @click.native="onEditFile(data)" icon="el-icon-edit-outline">编辑</el-dropdown-item>
                                <el-dropdown-item @click.native="onNewFile(data)" icon="el-icon-plus" divided>新建</el-dropdown-item>
                                <el-dropdown-item @click.native="onNewDir(data)" icon="el-icon-folder-add">新建目录</el-dropdown-item>
                                <el-dropdown-item @click.native="onDelete(data)" icon="el-icon-delete" divided>删除</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                        <el-tooltip content="编辑" >
                            <el-button v-show="data.show" type="text" @click.stop="onEditFile(data)" icon="el-icon-edit-outline" style="float:right;width:14px;margin:0 5px;"></el-button>
                        </el-tooltip>
                    </span>
                </span>  
            </el-tree>
            <el-dialog :title="dialog.configNew.formItem.ifDir?'新增目录':'新增配置'" 
                :visible.sync="dialog.configNew.show" 
                v-if="dialog.configNew.show"
                append-to-body>
                <el-container>
                    <el-main style="padding:0px 20px;height:100%;overflow:auto;">
                        <el-form :model="dialog.configNew.formItem" :rules="dialog.configNew.rules" label-width="100" label-position="top">
                            <el-form-item label="位置" prop="parent">
                                <el-input v-model="dialog.configNew.formItem.parent" placeholder="位置" :disabled="true"></el-input>
                            </el-form-item>
                            <el-form-item :label="dialog.configNew.formItem.ifDir?'目录':'配置'">
                                <el-switch v-model="dialog.configNew.formItem.ifDir"
                                    active-color="#13ce66"
                                    :active-value="true"
                                    :inactive-value="false"></el-switch>
                            </el-form-item>
                            <el-form-item label="名称" prop="name">
                                <el-input v-model="dialog.configNew.formItem.name" :placeholder="dialog.configNew.formItem.ifDir?'目录名称':'配置名称'" autofocus="true"></el-input>
                            </el-form-item>
                            <el-form-item label="TTL" prop="ttl">
                                <el-input-number v-model="dialog.configNew.formItem.ttl" placeholder="TTL"></el-input-number>
                            </el-form-item>
                            <el-form-item label="值" prop="value">
                                <el-input v-model="dialog.configNew.formItem.value" type="textarea" placeholder="配置内容"></el-input>
                            </el-form-item>
                        </el-form>
                    </el-main>
                    <el-footer style="text-align:right;">
                        <el-button type="default" @click="dialog.configNew.show = false;">取消</el-button>
                        <el-button type="primary" @click="onConfigSave" :loading="dialog.configNew.loading">提交</el-button>
                    </el-footer>
                </el-container>
            </el-dialog> 
        </el-main>
    </el-container>
</template>
<script>
import _ from 'lodash';

export default {
    name: 'TreeView',
    props:{
        root: String
    },
    data(){
        return {
            auth: window.auth,
            defaultProps: {
                children: 'nodes',
                label: 'key'
            },
            treeData: [],
            defaultExpandedKeys: ["/"],
            filterText: "",
            dialog:{
                configNew: {
                    show: false,
                    formItem: {
                        parent: '',
                        name: '',
                        key: '',
                        value: '',
                        ttl: null,
                        ifDir: true,
                    },
                    rules: {
                        name:[
                            { required: true, message: '请输入名称', trigger: 'blur' }
                        ]
                    },
                    data: null,
                    loading: false
                }
            }
        }
    },
    watch: {
        filterText(val) {
            if(_.isEmpty(val)){
                this.initData();
            } else {
                this.$refs.tree.filter(val);
            }
        }
    },
    computed:{
        rootPath(){
            return this.root?this.root:["",this.auth.signedUser.Company.ospace].join("/");
        }
    },
    mounted(){
        this.initData();
    },
    methods: {
        pickTypeFromLabel(label,value){
            return _.endsWith(label,value);
        },
        pickLabel(label){
            return _.last(label.split("/"));
        },
        initData(){
            let root = this.rootPath;
            this.m3.ruleGet(root).then( (rtn)=>{
                this.treeData = [rtn.message];
            });
        },
        onMouseEnter(item){
            this.$set(item, 'show', true)
            this.$refs.tree.setCurrentKey(item.key);
        },
        onMouseLeave(item){
            this.$set(item, 'show', false)
        },
        onNodeFilter(value, data) {
            if(!value) return true;
            
            return data.key.indexOf(value) !== -1;
        },
        onCollapseAll(){
            _.forEach(this.$refs.tree.store._getAllNodes(), (v)=>{
                this.$set(v, 'expanded', false);
            })
        },                      
        onRefresh(data){
            this.m3.ruleGet(data.key).then( (rtn)=>{
                this.$set(data, 'nodes', rtn.message.nodes);
            });
        },
        onNodeClick(data){
            
            this.$emit("node-click",data);
            
            this.onRefresh(data);

        },
        onDelete(data){
            
            let item = data;
            let parent = this.$refs.tree.getNode(data.key).parent.data;

            const h = this.$createElement;
            this.$msgbox({
                    title: `确认要删除以下配置`, 
                    message: h('span', null, [
                        h('p', null, `位置：${item.key}`),
                        h('p', null, `值：${_.truncate(item.value)}`),
                        h('p', null, `TTL：${  _.isUndefined(item.ttl) ? '' : item.ttl }`)
                    ]),
                    showCancelButton: true,
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
            }).then(() => {

                this.m3.ruleDelete(item).then( ()=>{
                    this.$message.success("删除成功");

                    // 刷新
                    let root = this.rootPath;
                    if(item.key == root){
                        this.initData();
                    } else {
                        this.onRefresh(parent);
                    }
                    
                    // 关闭Tab
                    this.$emit("node-close",item.key);

                }).catch(err=>{
                    this.$message.error("删除失败 " + JSON.stringify(err.message));
                });

            }).catch(() => {
                this.$message.info("取消删除操作");
            }); 

        },
        onNewFile(data){

            this.dialog.configNew.formItem.ifDir = false;
            this.dialog.configNew.data = data;
            this.dialog.configNew.formItem.parent = data.key || '/';
            
            this.dialog.configNew.show = true;
            
        },
        onNewDir(data){
            
            this.dialog.configNew.formItem.ifDir = true;
            this.dialog.configNew.data = data;
            this.dialog.configNew.formItem.parent = data.key || '/';

            this.dialog.configNew.show = true;
        },
        onEditFile(data){

            this.m3.ruleGet(data.key).then( (rtn)=>{
                this.$emit("node-open", rtn.message);
            } );
        },
        onResetConfig(){
            
            this.dialog.configNew.formItem.parent = '';
            this.dialog.configNew.formItem.name = '';
            this.dialog.configNew.data = null;
            this.dialog.configNew.formItem.key = '';
            this.dialog.configNew.formItem.value = '';
            this.dialog.configNew.formItem.ttl = null;
            this.dialog.configNew.formItem.ifDir = true;

        },
        onConfigSave(){
            

            if(_.isEmpty(this.dialog.configNew.formItem.name)){
                this.$message({
                    type: "warning",
                    message: "配置名称不能为空！"
                })
                return false;
            }

            this.dialog.configNew.loading = true;
            
            this.dialog.configNew.formItem.key = [this.dialog.configNew.formItem.parent, this.dialog.configNew.formItem.name].join("/").replace(/\/\//g,'/');
            
            this.m3.ruleAdd(this.dialog.configNew.formItem).then( ()=>{
                this.$message({
                    type: "success",
                    message: "保存成功！"
                })
                
                // 刷新
                this.onRefresh(this.dialog.configNew.data);

                this.onResetConfig();
                
                this.dialog.configNew.show = false;
                
                this.dialog.configNew.loading = false;
            }).catch(err=>{
                this.$message({
                    type: "error",
                    message: "保存失败：" + err.message
                })
            });

        },
        onExport(data){
            
            let key = "";
    
            if(_.isNull(data)){
                key = this.rootPath;
            }else {
                key = data.key;
            }

            this.$confirm(`确认要导出 ${key} 下的配置?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                
                this.m3.ruleExport(key).then(res=>{
                    this.$message.success("配置导出成功 " + res);
                }).catch(err=>{
                    this.$message.error("配置导出失败 " + err);
                });
                
            }).catch(() => {
                this.$message({
                    type: "info",
                    message: "已取消导出操作"
                })
            });
        }, 
        onImport(event){
            
            let file = event.target.files[0];
            const h = this.$createElement;

            this.$msgbox({
                    title: `确认要导入配置`, 
                    message: h('span', null, [
                        h('p', null, `文件名称：${file.name}`),
                        h('p', null, `修改时间：${file.lastModifiedDate}`),
                        h('p', null, `文件大小：${this.m3.bytesToSize(file.size)}`)
                    ]),
                    showCancelButton: true,
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    customClass:'rule-messagebox',
                    type: 'warning'
            }).then(() => {

                this.m3.ruleImport(file).then(()=>{
                    this.$message({
                        type: "success",
                        message: "导入成功"
                    })
                    
                    this.initData();

                    event.target.value = '';

                }).catch(err=>{
                    this.$message({
                        type: "error",
                        message: "导入失败 " + err
                    })

                    event.target.value = '';
                });

            }).catch(() => {
                this.$message({
                    type: "info",
                    message: "已取消导入操作"
                })

                event.target.value = '';
            }); 
            
        },
        onDragStart(data, event) {
            
            let node = {
                type: 'rule',
                name: data.key,
                title: data.key
            };
            event.dataTransfer.setData("Text", JSON.stringify(node));
        },
        onDragEnd(event){
            console.log(event)
        },
        onAllowDrag(draggingNode) {
            return draggingNode.childNodes.length === 0;
        }
    }    
}
</script>
<style scoped>
    .el-container{
        
    }
    .el-header{
        height:40px!important;
        line-height:40px;
        display:flex;
    }
    .el-main{
        overflow:auto;
    }

    .tool-box{
        display:flex;
        flex-wrap: wrap;
        align-items:flex-start;
        padding:20px;
        width: 235px;
    }
    .tool-box .tool{
        text-align:center;
        padding:20px;
        margin:5px;
        border:1px solid #efefef;
        height: 60px;
        width: 65px;
        border-radius: 5px;
    }
    .tool-box .tool:hover{
        cursor: pointer;
        background: rgba(125, 202, 253,.2);
    }
</style>

<style>
    .rule-messagebox.el-message-box{
        width:40vw!important;
    }
    .rule-messagebox .el-message-box__message p {
        line-height: 43px;
    }
</style>
