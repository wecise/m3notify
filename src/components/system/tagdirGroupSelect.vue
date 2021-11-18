// tagdir 组合选择树
<template>
    <el-container>
        <el-header style="height:auto;float:left;display:flex;flex-wrap:wrap;padding:0px;">
            <el-radio-group v-model="selectedDomain">
                <el-button v-for="item,key in domain.mapping" :key="item.id" style="margin:5px;">
                    <el-radio :label="item.name">{{item.remark || item.name}}</el-radio>
                </el-button>
            </el-radio-group>	
        </el-header>
        <el-main style="height:70vh;background:#f2f2f2;overflow:hidden;">
            <el-row :gutter="20" style="height: 100%;">
                <el-col :span="10" style="height: 100%;">
                    <el-container style="height:100%;background: #ffffff;">
                        <el-header style="height:50px;line-height:50px;display:flex;">
                            <el-input
                                placeholder="输入关键字进行过滤"
                                v-model="filterText"
                                clearable
                                style="width:70%;">
                            </el-input>
                            <el-checkbox v-model="ifCheckStrictly" label="节点关联" style="margin-left:20px;float:right;"></el-checkbox>
                        </el-header>
                        <el-main style="overflow:hidden;">
                            <el-tree 
                                node-key="id"
                                show-checkbox
                                highlight-current="true"
                                :default-expanded-keys="selectedKeys"
                                :default-checked-keys="selectedKeys"
                                :expand-on-click-node="false"
                                :filter-node-method="onFilterNode"
                                :data="nodes" 
                                :props="defaultProps" 
                                :check-strictly="!ifCheckStrictly"
                                @check-change="onCheckChange"
                                style="background: transparent;height:100%;overflow:auto;"
                                ref="tree">
                                <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
                                    <span class="el-icon-price-tag" style="color: #f8a502;font-size: 14px;"></span>
                                    <span v-if="_.isEmpty(data.name)">
                                        <span>{{data.domain}}</span>
                                        <el-dropdown style="float:right;display:none;">
                                            <span class="el-dropdown-link">
                                                <i class="el-icon-more el-icon--right"></i>
                                            </span>
                                            <el-dropdown-menu slot="dropdown">
                                                <el-dropdown-item>
                                                    <el-checkbox-group v-model="data.perms" style="float: right;padding-right: 10px;" v-if="data.checked">
                                                        <el-checkbox label="add">添加</el-checkbox>
                                                        <el-checkbox label="delete">删除</el-checkbox>
                                                        <el-checkbox label="edit">编辑</el-checkbox>
                                                        <el-checkbox label="list">查询</el-checkbox>
                                                    </el-checkbox-group>
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    </span>
                                    <span v-else>
                                        <span>{{node.label}}</span>
                                        <el-dropdown style="float:right;display:none;">
                                            <span class="el-dropdown-link">
                                                <i class="el-icon-more el-icon--right"></i>
                                            </span>
                                            <el-dropdown-menu slot="dropdown">
                                                <el-dropdown-item>
                                                    <el-checkbox-group v-model="data.perms" style="float: right;padding-right: 10px;" v-if="data.checked">
                                                        <el-checkbox label="add">添加</el-checkbox>
                                                        <el-checkbox label="delete">删除</el-checkbox>
                                                        <el-checkbox label="edit">编辑</el-checkbox>
                                                        <el-checkbox label="list">查询</el-checkbox>
                                                    </el-checkbox-group>
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    </span>
                                </span>                  
                            </el-tree>
                        </el-main>
                    </el-container>
                </el-col>
                <el-col :span="4" style="height: 100%;">
                    <div style="height:100%;padding-top:10em;text-align:center;">
                        <p>
                            <el-button type="primary" @click="onSelectByRel(',')">加入标签组（或者）</el-button>
                        </p>
                        <p>
                            <el-button type="primary" @click="onSelectByRel('+')">加入标签组（并且）</el-button>
                        </p>
                    </div>
                </el-col>
                <el-col :span="10" style="height: 100%;">
                    <el-container style="height:100%;background: #ffffff;">
                        <el-header style="height:40px;line-height:40px;">
                            <el-button type="text" icon="el-icon-refresh" @click="selectedNodes = []">重置</el-button>
                            <span style="float:right;display:none;">
                                <el-switch
                                    v-model="logical"
                                    active-text="标签组关系(或者)"
                                    inactive-text="标签组关系(并且)">
                                </el-switch>
                            </span>
                        </el-header>
                        <el-main styl="display:flex;flex-wrap:wrap;" v-if="!_.isEmpty(selectedNodes)">
                            
                            <span v-for="item,index in _.filter(selectedNodes,{type:','})" :key="item.id" v-if="!_.isEmpty(item.data)">
                                <!--el-divider content-position="left" v-if="!_.isEmpty(_.keys(_.groupBy(item.data,'domain')))">{{ _.keys(_.groupBy(item.data,'domain'))[0]  }}</el-divider-->
                                <el-tag
                                    :key="tag.id"
                                    effect="plain"
                                    closable
                                    type="primary"
                                    :disable-transitions="false"
                                    @close="onTagClose(tag,item)" 
                                    style="margin:5px;width:100%;"
                                    v-for="tag,idx in item.data"
                                    v-if="tag.name">
                                    {{ tag.path }} 
                                </el-tag>
                            </span>
                            <span v-for="item,index in _.filter(selectedNodes,{type:'+'})" 
                                :key="item.id"
                                style="margin:5px;width:100%;max-height:300px;overflow:auto;display:flex;flex-wrap: wrap;border: 1px solid #b3d8ff;color: #409eff;border-radius: 5px;"
                                v-if="!_.isEmpty(item.data)">
                                <!--el-divider content-position="left" v-if="!_.isEmpty(_.keys(_.groupBy(item.data,'domain')))">{{ _.keys(_.groupBy(item.data,'domain'))[0]  }}</el-divider-->
                                <el-tag
                                    :key="tag.id"
                                    :disable-transitions="false"
                                    @close="onTagClose(tag,item)"
                                    style="margin:5px;"
                                    v-for="tag,idx in item.data"
                                    v-if="tag.name">
                                    {{tag.path}}
                                </el-tag>
                                <el-button type="text" icon="el-icon-close" style="float:right;" @click="onTagGroupClose(item)"></el-button>
                            </span>
                            
                        </el-main>
                    </el-container>
                </el-col>
            </el-row>
        </el-main>
        <el-footer style="text-align:right;line-height:60px;background: #f2f2f2;">
            <el-button type="default" @click="rowData.show = false;">关闭</el-button>
            <el-button type="primary" @click="onUpdateRoleGroupByTagGroup" :loading="loading">更新标签权限</el-button>
        </el-footer>
    </el-container>
</template>

<script>

    export default{
        props: {
            model: Object,
            rowData: Object
        },
        data(){
            return {
                defaultProps: {
                    children: 'nodes',
                    label: 'name'
                },
                filterText: "",
                nodes: [],
                filterNodes: [],
                selectedKeys: [],
                selectedNodes: [],
                selectedDomain: '',
                domain:{
                    mapping: null,
                    list: []
                },
                logical: false,
                loading:false,
                ifCheckStrictly: true
            }
        },
        computed:{
            logicalStr(){
                return this.logical ? '或' : '且';
            }
        },
        watch: {
            filterText(val) {
                this.$refs.tree.filter(val);
            },
            selectedDomain(val){
                this.selectedNodes = [];
                this.nodes = _.filter(this.filterNodes,{domain:val});
                this.onSetSelected();
            },
            selectedKeys(val){
                this.$emit("count:selectedTag", val.length);
            }
        },
        created(){
            this.loadNodes();
            this.initDomain();
        },
        methods:{
            initDomain(){
                this.m3.callFS("/matrix/m3system/domain/getDomains.js",false).then((rtn)=>{
                    //  过滤mclass为空的
                    this.domain.mapping = _.filter(rtn.message,(v)=> { return !_.isEmpty(v.mclass); });
                    this.selectedDomain = _.head(this.domain.mapping).label;
                })
            },
            loadNodes(){
                this.m3.callFS(`${['/matrix'+this.model.parent,this.model.name].join("/")}`).then( (val)=>{
                    let rtn = val.message;
                    
                    this.filterNodes = _.cloneDeep(rtn);
                    this.nodes = _.filter(this.filterNodes,{domain:this.selectedDomain});
                    this.onSetSelected();
                    
                } );
            },
            onSetSelected(){
                
                let param = encodeURIComponent( JSON.stringify({domain: this.selectedDomain, roleGroup: this.rowData.row}) );
                this.m3.callFS("/matrix/m3system/perm/byTagdir/getPermByGroup.js", param ).then( (rtn)=>{
                    if(_.isEmpty(rtn.message)) return;
                    this.selectedNodes = rtn.message;
                } );
                
            },
            onMouseEnter(data){
                this.$set(data, 'show', true)
            },
            onMouseLeave(data){
                this.$set(data, 'show', false)
            },
            onFilterNode(value, data) {
                if (!value) return true;
                return data.path.indexOf(value) !== -1;
            },
            onTagGroupClose(item){
                
                item.nodes = [];

                let index = this.selectedNodes.indexOf(item);
                this.selectedNodes.splice(index, 1);

            },
            onTagClose(node,item){
                let index = item.nodes.indexOf(node);
                item.nodes.splice(index, 1);

                let selectedNode = _.find(this.selectedNodes,{ id:item.id });
                this.$set(selectedNode, 'nodes',item.nodes);
                this.$set(selectedNode, 'data',item.nodes);
                
                
            },
            onResetChecked() {
                this.$refs.tree.setCheckedKeys([]);
            },
            onDisabledNodes(nodes,flag){
                _.forEach(nodes,(v)=>{
                    v.disabled = flag;
                })
            },
            parentNodesCheckChange(data){
                
                let perms = ['add','delete','edit','list'];
                let node = null;

                try{
                    if(data.id){
                        node = this.$refs.tree.getNode(data.id);
                    } else {
                        node = this.$refs.tree.getNode("");
                    }
                    
                    if(node && node.parent){
                        this.$refs.tree.setChecked(node.parent.data, true, false);
                        this.$set( node.parent.data, 'perms', perms );	
                    }

                    this.parentNodesCheckChange(node.parent.data);
                } catch(err){

                }

            },
            onCheckChange(data, checked, indeterminate){
                
                // 选择父节点
                if(checked && this.ifCheckStrictly){
                    //this.childNodesCheckChange(data);
                    this.parentNodesCheckChange(data);
                }

            },
            onSelectByRel(type){
                
                // Tag用
                // let nodes = this.$refs.tree.getCheckedNodes(false,false);
                //let nodes = this.$refs.tree.getCheckedNodes(true,false);
                // Tlist用
                let data = this.$refs.tree.getCheckedNodes(true,false);
                console.log(1,data)
                if(_.isEmpty(data)) return false;

                let id = objectHash.sha1(JSON.stringify(data));
                let title = _.truncate(_.map(data,'name').join(" "),{
                    'length': 10,
                    'omission': ' ...'
                });

                // 已选择
                if(_.find(this.selectedNodes, {id:id})) return false;

                this.selectedNodes.push( {id: id, title: title, type: type, data: data} );

                // 选过的禁用
                //this.onDisabledNodes(nodes,true);
                this.onResetChecked();

            },
            // 标签授权
            onUpdateRoleGroupByTagGroup(){
                
                /* if(_.isEmpty(this.selectedNodes)){
                    this.$message({
                        type: "warning",
                        message: "请选择标签组"
                    })
                    return false;
                } */

                this.loading = true;

                // 更新
                let domain = _.groupBy(this.domain.mapping,'name');
                let term =  JSON.stringify( { domain: domain[this.selectedDomain], roleGroup: this.rowData.row, data: this.selectedNodes, logical: this.logical?',':'+'} );
                
                this.m3.callFS("/matrix/m3system/perm/byTagdir/setPermByTagdirGroup.js", encodeURIComponent(term)).then( (rtn)=>{
                    
                    this.loading = false;

                    if(rtn.message){

                        if(rtn.message.status !== 'error'){
                            
                            this.$message({
                                type: "success",
                                message: "更新标签权限成功！"
                            })

                            this.$emit('update:selectedTag');
                        } else {
                            this.$message({
                                type: "error",
                                message: "更新标签权限失败：" + typeof rtn.message == 'object' ? _.truncate(JSON.stringify(rtn.message.message),{
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

                        this.$emit('update:selectedTag');
                    }
                    
                })
            }
        }
    }
</script>