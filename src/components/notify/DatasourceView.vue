<template>
    <el-container>
        <el-header style="height:40px;line-height:40px;padding:0px 10px;">
            <el-input v-model="filterText" 
                placeholder="搜索" size="mini"
                clearable></el-input>
        </el-header>
        <el-main style="padding:0px 10px; height: 100%;">
            <el-tree :data="treeData" 
                    :props="defaultProps" 
                    node-key="class"
                    highlight-current
                    default-expand-all
                    auto-expand-parent
                    @node-click="onNodeClick"
                    :filter-node-method="onFilterNode"
                    style="background:transparent;"
                    ref="tree">
                <span slot-scope="{ node, data }" style="width:100%;">
                    <span v-if="data">
                        <i class="el-icon-c-scale-to-original" style="color:#0088cc;"></i> {{ node.label }}
                    </span>
                    <span v-else>
                        <i class="el-icon-folder" style="color:#ffa500;"></i> {{ node.label }}
                    </span>
                </span>
            </el-tree>
        </el-main>
    </el-container>
</template>

<script>
import _ from 'lodash';

export default {
    name:'DatasourceView',
    props: {
        root: String
    },
    data(){
        return {
            treeData: [],
            defaultProps: {
                children: 'children',
                label: 'alias'
            },
            filterText: ""
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
    created(){
        this.initData();
    },
    methods: {
        initData(){
            this.m3.callFS("/matrix/entity/entity_class.js",encodeURIComponent(this.root)).then( (rtn)=>{
                this.treeData = rtn.message;
                this.$emit("treedata-loaded",this.treeData);
            } );
        },
        onFilterNode:_.debounce((value)=>{
            
            if (!value) return true;
            
            try{
                this.m3.callFS("/matrix/graph/entity-search-by-term.js",encodeURIComponent(value)).then( (val)=>{
                    let rtn = val.message
                    this.treeData = _.map(rtn,(v)=>{
                        return _.extend(v,{ children:[], alias:_.last(v.class.split("/"))});
                    });
                } );
            } catch(err){
                this.treeData = [];
            }
        },1000),
        onNodeClick(data){
            this.$emit('node-click',data);
        }
    }
}
</script>
<style scoped>

</style>