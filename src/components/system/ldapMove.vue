<template>
    <el-container>
        <el-main>
            <el-tree 
                node-key="fullname"
                highlight-current
                default-expand-all="true"
                :data="nodes" 
                :props="defaultProps" 
                :filter-node-method="onFilterNode"
                :expand-on-click-node="false"
                @node-click="onNodeClick"
                style="background: transparent;"
                ref="tree">
                <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;">
                    <span v-if="data.otype==='org'">
                        <span class="el-icon-school" style="color:#FF9800;"></span>
                        <span v-if="data.username === '/'">{{m3.auth.Company.fullname}}</span><span v-else>{{node.label}}</span>
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
            handler(){
                // 只显示组织
                if(this.$refs.tree){
                    this.$refs.tree.filter('org');	
                }
            },
            deep:true
        }
    },
    created(){
        this.initNodes();
    },
    mounted(){
        this.$nextTick(()=>{
            this.$refs.tree.filter("undefined");
        })
    },
    methods:{
        initNodes() {
            
            try{

                /* const traverse = (obj) => {
                    
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
                this.m3.user.list().then(res=>{
                    console.log(res.message)
                    this.nodes = _.sortBy([res.message],'fullname');
                    traverse(this.nodes);
                }) */


                try{
                    this.m3.user.listByFullname("/").then( (rtn)=>{
                        this.nodes = [rtn.message];
                    } );
                } catch(err){
                    console.error(err)
                } 
                

            } catch(err){
                console.error(err)
            } finally{
                
                // 设置已选择项 需要勾选子节点
                if( this.rowData ){
                    _.forEach(this.rowData.member,(v)=>{
                        this.selectedNodes.push(v.replace(/^['G','U','O']/g,''));
                    })
                }
            }

        },
        onFilterNode(value, data){
            console.log(1111,value,data)
            return data.otype.indexOf(value) !== -1
        },
        onNodeClick(data){
            if(data.otype !== "org"){
                this.$message.info("请选择一个组");
                return false;
            }
            this.$emit('update:selectedLdapToMove', data);
        }
    }
}
</script>