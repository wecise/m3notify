<template>
    <el-container style="height:100%;">
        <el-header style="height:40px;line-height:40px;padding:0px 10px;">
            <el-input v-model="filterText"  placeholder="关键字" size="mini" clearable></el-input>
        </el-header>
        <el-main style="padding:0px 10px; height: 100%;background:#f2f2f2;">
            <el-tree :data="treeData" 
                    :props="defaultProps" 
                    node-key="fullname"
                    highlight-current
                    default-expand-all
                    auto-expand-parent
                    @node-click="onNodeClick"
                    :filter-node-method="onFilterNode"
                    :expand-on-click-node="false"
                    style="background:transparent;"
                    ref="tree">
                <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
                    <span v-if="data.ftype==='dir'">
                        <i class="el-icon-folder-opened" style="color:#FFC107;" v-if="node.expanded"></i>
                        <i class="el-icon-folder" style="color:#FFC107;" v-else></i>
                        <span> {{node.label}}</span>
                        <el-dropdown v-show="data.show" style="float:right;width:14px;margin:0 5px;">
                            <span class="el-dropdown-link">
                                <i class="el-icon-more el-icon--right"></i>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item @click.native="onDelete(data)" icon="el-icon-delete">删除</el-dropdown-item>
                                <el-dropdown-item @click.native="onNodeClick(data)" icon="el-icon-refresh">刷新</el-dropdown-item>
                                <el-dropdown-item @click.native="onNewFile(data)" icon="el-icon-plus">新建文件</el-dropdown-item>
                                <el-dropdown-item @click.native="onNewDir(data)" icon="el-icon-folder-add">新建目录</el-dropdown-item>
                                <el-dropdown-item @click.native="onUpload(data,$event)" icon="el-icon-upload">上传</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </span>
                    <span v-else>
                        <i class="el-icon-c-scale-to-original" style="color:#0088cc;"></i>
                        <span> {{node.label}}</span>
                        <el-button v-show="data.show" type="text" @click.stop="onDelete(data)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-delete"></el-button>
                    </span>
                </span>  
            </el-tree>
        </el-main>
    </el-container>
</template>

<script>
    import _ from 'lodash';
    export default {
        props: {
            root: Object
        },
        data(){
            return {
                defaultProps: {
                    children: 'children',
                    label: 'name'
                },
                treeData: [],
                filterText: ""
            }
        },
        watch: {
            filterText(val) {
                if(_.isEmpty(val)){
                    this.onInit();
                } else {
                    this.$refs.tree.filter(val);
                }
            }
        },
        created(){
            this.onInit();
        },
        methods: {
            onMouseEnter(item){
                this.$set(item, 'show', true)
                this.$refs.tree.setCurrentKey(item.key);
            },
            onMouseLeave(item){
                this.$set(item, 'show', false)
            },
            onRefresh(item,index){
                this.m3.dfs.list({fullname:item.fullname}).then( rtn=>{
                    this.$set(item, 'children', rtn.message);
                } );
            },
            onNewDir(item){
                this.$emit("dfs-newdir",item);
            },
            onNewFile(item){
                this.$emit("dfs-newfile",item);
            },
            onDelete(item){
                this.$emit("dfs-delete",item);
            },
            onUpload(item,index){

                /* let wnd = null;
                let wndID = `jsPanel-upload-${objectHash.sha1(item.id)}`;

                try{
                    if(jsPanel.activePanels.getPanel(wndID)){
                        jsPanel.activePanels.getPanel(wndID).close();
                    }
                } catch(error){

                }
                finally{
                    wnd = maxWindow.winUpload(this.$t('fsview.tree_contextmenu_file_upload'), `<div id="${wndID}"></div>`, null, null);
                }
                
                new Vue({
                    i18n,
                    delimiters: ['#{', '}#'],
                    template:   `<el-container>
                                    <el-main>
                                        <el-upload drag
                                            multiple
                                            show-file-list="false"
                                            :action="upload.url"
                                            :on-success="onSuccess"
                                            :on-remove="onRemove"
                                            list-type="text"
                                            name="uploadfile">
                                            <i class="el-icon-upload"></i>
                                        </el-upload>
                                    </el-main>
                                    <el-footer>
                                        <i class="fas fa-clock"></i> #{$t('fsview.tree_contextmenu_file_uploaded')}# #{upload.fileList.length}# 
                                    </el-footer>
                                </el-container>`,
                    data: {
                        upload: {
                            url: `/fs/${item.fullname}?issys=true`,
                            fileList: []
                        }
                    },
                    created(){
                        
                    },
                    methods: {
                        beforeUpload(file){
                            
                        },
                        onSuccess(res,file,FileList){
                            this.upload.fileList = FileList;
                        },
                        onRemove(file, fileList) {
                            fsHandler.fsDeleteAsync(item.fullname,file.name).then( (rtn)=>{

                            } );
                        },
                        onPreview(file) {
                            console.log(file);
                        }
                    }
                }).$mount(`#${wndID}`); */
                
            },  
            onFilterNode:_.debounce(function(value, data) {
                const self = this;

                if (!value) return true;

                try{
                    this.m3.callFS("/matrix/m3dfs/getFsByTerm.js", encodeURIComponent(value)).then( (rtn)=>{
                        self.treeData = rtn.message;
                    } );
                } catch(err){
                    self.treeData = [];
                }
            },1000),
            onNodeClick(data){

                if(data.isdir) {
                    this.m3.dfs.list({fullname:data.fullname}).then( res=>{
                        
                        let children =  _.chain(res.message).map(v=>{
                                            return _.extend(v,{show:false});
                                        }).sortBy('fullname').value();
    
                        this.$set(data, 'children', children);
    
                    })
                }
                
                this.$emit("node-click",data);

            },
            onInit(){
                if(window.FS_TREE_DATA){
                    this.treeData = window.FS_TREE_DATA;
                } else {
                    this.m3.callFS("/matrix/devops/getFsForTree.js", encodeURIComponent(this.root.fullname)).then( (rtn)=>{
                        this.treeData = rtn.message
                    } );
                }
            }
        }
    }
</script>