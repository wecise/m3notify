<template>
    
    <div class="toolbar-container">

        <div class="breadcrumb">
            <el-breadcrumb separator-class="el-icon-arrow-right">
                <template v-for="(item,index) in filePath">
                    <el-breadcrumb-item  :key="index" v-if="index===0">
                        <el-button type="text" @click="onOpen(item)">{{rootTitle}}</el-button>
                    </el-breadcrumb-item>
                    <el-breadcrumb-item  :key="index" v-else>
                        <el-button type="text" @click="onOpen(item)">{{item}}</el-button>
                    </el-breadcrumb-item>
                </template>
            </el-breadcrumb>
        </div>

        <div class="toolbar">
            
            <el-tooltip content="格子" placement="top">
                <el-button type="text" @click="onToogleView('thumbnailsView')" icon="el-icon-picture">
                </el-button>
            </el-tooltip>
            <el-tooltip content="列表" placement="top">
                <el-button type="text" @click="onToogleView('gridView')" icon="el-icon-s-grid">
                </el-button>
            </el-tooltip>
            <el-tooltip content="表格" placement="top">
                <el-button type="text" @click="onToogleView('tableView')" icon="el-icon-menu">
                </el-button>
            </el-tooltip>
            <el-tooltip content="刷新" placement="top">
                <el-button type="text" @click="onRefresh" icon="el-icon-refresh">
                </el-button>
            </el-tooltip>
            <el-tooltip content="排序" placement="top">
                <el-dropdown @command="onOrderBy" style="margin-left: 5px;">
                    <span class="el-dropdown-link">
                        <el-button type="text" icon="el-icon-sort"></el-button>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command='{"prop":"name","type":"asc"}'>按名称升序</el-dropdown-item>
                        <el-dropdown-item command='{"prop":"name","type":"desc"}'>按名称降序</el-dropdown-item>
                        <el-dropdown-item command='{"prop":"ctime","type":"asc"}'>按时间升序</el-dropdown-item>
                        <el-dropdown-item command='{"prop":"ctime","type":"desc"}'>按时间降序</el-dropdown-item>
                        <el-dropdown-item command='{"prop":"ftype","type":"asc"}'>按类型升序</el-dropdown-item>
                    </el-dropdown-menu>
                    </el-dropdown>
            </el-tooltip>

            <el-tooltip content="新建目录" placement="top">
                <el-button type="text" @click="onNewDir" icon="el-icon-folder-add" style="margin-left: 5px;">
                </el-button>
            </el-tooltip>

            <el-tooltip content="新建文件" placement="top">
                <el-button type="text" @click="onNewFile" icon="el-icon-document-add">
                </el-button>
            </el-tooltip>

            <el-tooltip :content="selected.length===0?'选择所有':'取消选择'" placement="top">
                <el-button type="text" @click="onSelectAll" :icon="selected.length===0?'el-icon-folder-checked':'el-icon-document-remove'">
                </el-button>
            </el-tooltip>

            <el-tooltip content="复制到" placement="top">
                <el-button type="text" @click="onCopyTo" icon="el-icon-document-copy">
                </el-button>
            </el-tooltip>

            <el-tooltip content="移动到" placement="top">
                <el-button type="text" @click="onMoveTo" icon="el-icon-shopping-cart-full">
                </el-button>
            </el-tooltip>

            <el-tooltip content="删除" placement="top">
                <el-button type="text" @click="onDelete" icon="el-icon-delete">
                </el-button>
            </el-tooltip>

            <el-tooltip content="上传" placement="top">
                <el-button type="text" class="fileinput-button" style="color:#16e216;" icon="el-icon-upload">
                    <input id="file-upload" type="file" name="uploadfile" multiple>
                </el-button>
            </el-tooltip>
            <el-tooltip content="导出" placement="top">
                <el-button type="text" @click="onExport(rootPath)" icon="el-icon-download">
                </el-button>
            </el-tooltip>

            <el-tooltip content="导入" placement="top">
                <el-button type="text" class="fileinput-button" icon="el-icon-upload2">
                    <input type="file" name="loadfile" multiple @change="onImport">
                </el-button>
            </el-tooltip>

        </div>
    </div>

</template>

<script>
    import _ from 'lodash';

    export default {
        props: {
            root: Object,
            rootTitle: String,
            selected: Array
        },
        data(){
            return {
                rootFullName: _.clone(this.root.fullname.split("/")),
                rootPath: this.root.fullname
            }
        },
        computed: {
            filePath(){
                return this.rootPath.split("/");
            }
        },
        watch: {
            root: {
                handler(val){
                    this.rootPath = val.fullname;
                },
                immediate:true
            }
        },
        methods: {
            onToogleView(view){
                this.$emit("toggle-view",view);
            },
            onOpen(data){
                
                if(this.rootFullName.includes(data)) return;

                if(_.isEmpty(data)){
                    this.$emit("node-click", {parent:"/",fullname:"/"});
                } else {
                    let parent = this.filePath.slice(0,-1);
                    let fullname = _.uniq(parent.concat(data)).join("/");
                    
                    this.$emit("node-click",{parent:parent,fullname:fullname});
                }
                
            },
            onRefresh(){
                this.$emit("dfs-refresh",this.root);
            },
            onOrderBy(cmd){
                this.$emit("order-by",cmd);
            },
            onNewDir(){
                this.$emit("dfs-newdir",this.root);
            },
            onNewFile(){
                this.$emit("dfs-newfile",this.root);
            },
            onSelectAll(){
                this.$emit("select-all");
            },
            onCopyTo(){
                if(this.selected.length > 0){
                    this.$emit("dfs-copyTo",this.root);
                } else {
                    this.$message.warning("请选择需要复制的文件");
                    return false;
                }
            },
            onMoveTo(){
                if(this.selected.length > 0){
                    this.$emit("dfs-moveTo",this.root);
                } else {
                    this.$message.warning("请选择需要移动的文件");
                    return false;
                }
            },
            onDelete(){
                this.$emit("dfs-delete");
            },
            onExport(){
                this.$emit("dfs-export",this.root);
            },
            onImport(){
                this.$emit("dfs-import",this.root);
            }
        }   
    }
</script>

<style scoped>
    .toolbar-container{
        width: 100%;
        height: 80px;
    }
    .toolbar-container > .breadcrumb{
        background: #f2f2f2;
        height:40px;
        line-height:40px;
        padding: 0 10px;
    }
    .toolbar-container > .breadcrumb > .el-breadcrumb{
        height:40px;
        line-height:40px;
    }

    .toolbar-container > .toolbar{
        text-align:right;
        height:40px;
        line-height:40px;
        width:100%;
        background: #ffffff;
    }

    .toolbar-container > .toolbar > .el-button > [class^=el-icon-]{
        font-size: 15px!important;
    }
    .toolbar-container > .toolbar .fileinput-button {
        position: relative;
        overflow: hidden;
        display: inline-block;
    }
    .toolbar-container > .toolbar .fileinput-button input {
        position: absolute;
        top: 0;
        right: 0;
        margin: 0;
        opacity: 0;
        -ms-filter: 'alpha(opacity=0)';
        font-size: 200px !important;
        direction: ltr;
        cursor: pointer;
    }
</style>