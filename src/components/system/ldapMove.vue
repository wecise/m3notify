<template>
    <el-container style="height:100%;background:#f2f2f2;">
        <el-main style="">
            <el-tree 
                node-key="fullname"
                highlight-current
                :data="nodes" 
                :props="defaultProps" 
                :filter-node-method="onFilterNode"
                :expand-on-click-node="false"
                @node-click="onNodeClick"
                style="background: transparent;"
                ref="tree">
                <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;">
                    <span v-if="data.otype=='org'">
                        <span class="el-icon-school" style="color:#FF9800;"></span>
                        <span v-if="data.username === '/'">{{window.COMPANY_FULLNAME}}</span><span v-else>{{node.label}}</span>
                    </span>
                    <span v-else>
                        <span class="el-icon-user" style="color:#67c23a;"></span>
                        <span>{{node.label}}</span>
                    </span>
                </span>                  
            </el-tree>
        </el-main>
    </el-container>
</template>

<script>
export default {
    props:{
        rowData: Object,
        root:String
    },
    data(){
        return {
            defaultProps: {
                children: 'nodes',
                label: 'username'
            },
            nodes: [],
            selectedNodes: []
        }
    },
    watch: {
        nodes:{
            handler(val,oldVal){
                // 只显示组织
                this.$refs.tree.filter('org');
            },
            deep:true
        }
    },
    created(){
        this.initNodes();
    },
    methods:{
        initNodes() {
            const self = this;

            try{

                const traverse = (obj) => {
                    
                    _.forEach(obj,(v)=>{
                        
                        let disabled = false;

                        if( v ){
                            
                            // 禁止admin权限操作
                            if(v.fullname == '/admin'){
                                disabled = true;
                                this.selectedNodes.push(v.fullname);
                            }

                            // LDAP 当前组织不能删除
                            if(this.rowData.isldap ){
                                disabled = true;

                                // 设置已选择项 需要勾选子节点  111111
                                // this.selectedNodes.push(v.fullname);
                            }

                            // 设置已选择项 需要勾选子节点   111111
                            if( _.startsWith(v.fullname, this.rowData.fullname+"/") ) {
                                this.selectedNodes.push(v.fullname);
                            }

                            _.extend(v,{ show:false, disabled:disabled });

                        }
                        
                        if(v.nodes){
                            traverse(v.nodes);
                        }
                    })
                    
                }

                // 只显示组织
                this.nodes = _.sortBy([userHandler.userList("/").message],'fullname');

                traverse(this.nodes);

            } catch(err){

            } finally{
                
                // 设置已选择项 需要勾选子节点  111111
                if( this.rowData ){
                    _.forEach(this.rowData.member,(v)=>{
                        self.selectedNodes.push(v.replace(/^['G','U','O']/g,''));
                    })
                }
            }

        },
        onFilterNode(value, data){
            return data.otype.indexOf(value) !== -1
        },
        onNodeClick(data){
            this.$emit('update:selectedLdapToMove', data);
        }
    }
}
</script>