
<template>
    <el-container  style="height:50vh;">
        <el-header>
            移动到：<span v-if="node">{{node.fullname}}</span>
        </el-header>
        <el-main style="padding:10px;">
            <el-tree
                :data="tree.classList"
                node-key="id"
                :props="tree.defaultProps"
                @node-click="onNodeClick"
                accordion="true"
                style="background-color:transparent;">
                <span slot-scope="{ node, data }">
                    <span>
                        <i class="el-icon-folder-opened" style="color:#FFC107;" v-if="node.expanded"></i>
                        <i class="el-icon-folder" style="color:#FFC107;" v-else></i>
                        <span> {{node.label}}</span>
                    </span>
                </span>
            </el-tree>
        </el-main>
        <el-footer style="height:40px;line-height:40px;text-align:right;">
            <el-button type="default" @click="onCancel">取消</el-button>
            <el-button type="primary" @click="onMove" :loading="loading" :disabled="node?false:true">移动</el-button>
        </el-footer>
    </el-container>
</template>

<script>
export default {
    props:{
        model: Object,
        sourceList: Array
    },
    data(){
        return {
            tree:{
                classList: null,
                defaultProps: {
                    children: 'children',
                    label: 'alias'
                },
                loading: false
            },
            node: null,
            loading: false
        }
    },
    created(){
        this.tree.loading = true;
        this.m3.callFS("/matrix/m3dfs/fs_list.js",encodeURIComponent(JSON.stringify({path:null,onlyDir:true}))).then( res=>{
            this.tree.classList = res.message;
            this.tree.loading = false;
        } );
    },
    methods:{
        onNodeClick(node){
            this.node = node;
        },
        onCancel(){
            this.model.show = false;
        },
        onMove(){
            try {
                this.sourceList.forEach(v=> {
                    this.m3.dfs.move({srcpath:[v.parent,v.name].join("/"), dstpath:this.node.fullname}).then( res =>{
                        if(res.status === 'ok'){
                            this.$message({
                                message: "移动成功 " + v.fullname,
                                type: 'success'
                            });
                        }
                    } );
                })
            }
            catch(error){
                console.error(error);
            }
            finally{
                this.sourceList = [];
            }
        }
    }
}
</script>

<style scoped>
    .el-header{
        height:30px!important;
        line-height:30px;
        background-color:#f2f2f2;
    }
</style>