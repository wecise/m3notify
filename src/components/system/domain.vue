/* 标签域管理 */
<template>
    <el-container style="height:100%;">
        <el-header style="line-height:60px;display:flex;">
            <h5 style="margin:0px;" v-if="tree.selected"><i class="el-icon-money"></i>  {{tree.selected.label}}</h5>
            <span style="position: absolute;right: 30px;">
            <el-popover
                placement="top-start"
                title="标题"
                width="200"
                trigger="hover"
                content="从标签目录中提取标签域，并进行初始化。可反复执行。">
                <el-button slot="reference" type="default" icon="el-icon-refresh" @click="onLoad(true)">初始化映射类</el-button>	
            </el-popover>
            
            <el-button type="success" icon="el-icon-plus" @click="onNewDomain">新建映射类</el-button>
            </span>
        </el-header>
        <el-main>
            <el-table
                :data="dt.rows"
                stripe
                border
                style="width: 100%">
                <el-table-column 
                    :key="index" 
                    v-for="(item,index) in dt.columns"
                    :prop="item.field"
                    :label="item.title"
                    v-if="item.visible">
                </el-table-column>
                <el-table-column
                    label="操作"
                    width="100">
                    <template slot-scope="scope">
                        <el-button @click="onDelete(scope.$index,scope.row)" type="text" size="small">删除</el-button>
                        <el-button @click="onEdit(scope.$index,scope.row)" type="text" size="small">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
        <el-footer style="line-height:60px;">
            标签域: {{_.uniqBy(dt.rows,'name').length}}
        </el-footer>
        <el-dialog title="标签域管理" 
            :visible.sync="dialog.domainAdd.show" 
            :close-on-press-escape="false" 
            :close-on-click-modal="false"
            :destroy-on-close="true" 
            v-if="dialog.domainAdd.show" width="50vw">
            <el-container style="height:100%;">
                <el-main style="overflow:hidden;padding:0px 10px;">
                    <el-form ref="form" :model="dialog.domainAdd.data" label-width="80px" v-if="dialog.domainAdd.data">
                        <el-form-item label="名称">
                            <el-input placeholder="名称" v-model="dialog.domainAdd.data.name">
                                <el-select v-model="dialog.domainAdd.data.name" slot="prepend" placeholder="请选择名称">
                                    <el-option :label="item.name+'('+item.remark+')'" :value="item.name" :key="index" v-for="(item,index) in _.uniqBy(dt.rows,'name')"></el-option>
                                </el-select>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="描述">
                            <el-input v-model="dialog.domainAdd.data.remark"></el-input>
                        </el-form-item>
                        <el-form-item label="对应类">
                            <el-input v-model="dialog.domainAdd.data.mclass" placeholder="选择对应类"
                                clearable
                                autofocus>
                                <template slot="prepend">
                                    <el-dropdown trigger="hover" placement="top-end"  :hide-on-click="true">
                                        <el-tooltip content="选则类" open-delay="800">
                                            <el-button type="text" size="mini">
                                                <i class="el-icon-office-building" style="font-size:16px;"></i>
                                            </el-button>
                                        </el-tooltip>
                                        <el-dropdown-menu slot="dropdown">
                                            <el-dropdown-item>
                                                <template scope="scope">
                                                    <mx-entity-tree root="/matrix" :filterEnable="false" ref="entityTree" @node-click="(data)=>{ dialog.domainAdd.data.mclass = data.class; }"></mx-entity-tree>
                                                </template>
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </el-dropdown>
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-form>
                </el-main>
            </el-container>
            <div slot="footer" class="dialog-footer">
                <el-button type="default" @click="dialog.domainAdd.show = false;">关闭</el-button>
                <el-button type="primary" @click="onSaveDomain(dialog.domainAdd.data)">确定</el-button>
            </div>
        </el-dialog>
        <el-dialog title="编辑标签域" 
            :visible.sync="dialog.domainEdit.show" 
            :close-on-press-escape="false" 
            :close-on-click-modal="false" 
            :destroy-on-close="true" 
            v-if="dialog.domainEdit.show" width="50vw">
            <el-container style="height:100%;">
                <el-main style="overflow:hidden;padding:0px 10px;">
                    <el-form ref="form" :model="dialog.domainEdit.data" label-width="80px" v-if="dialog.domainEdit.data">
                        <el-form-item label="名称">
                            <el-input v-model="dialog.domainEdit.data.name"></el-input>
                        </el-form-item>
                        <el-form-item label="描述">
                            <el-input v-model="dialog.domainEdit.data.remark"></el-input>
                        </el-form-item>
                        <el-form-item label="对应类">
                            <el-input v-model="dialog.domainEdit.data.mclass" placeholder="选择对应类"
                                clearable
                                autofocus>
                                <template slot="prepend">
                                    <el-dropdown trigger="hover" placement="top-end"  :hide-on-click="true">
                                        <el-tooltip content="选则类" open-delay="800">
                                            <el-button type="text" size="mini">
                                                <i class="el-icon-office-building" style="font-size:16px;"></i>
                                            </el-button>
                                        </el-tooltip>
                                        <el-dropdown-menu slot="dropdown">
                                            <el-dropdown-item>
                                                <template scope="scope">
                                                    <mx-entity-tree root="/matrix" :filterEnable="false" ref="entityTree" @node-click="(data)=>{ dialog.domainEdit.data.mclass = data.class; }"></mx-entity-tree>
                                                </template>
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </el-dropdown>
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-form>
                </el-main>
            </el-container>
            <div slot="footer" class="dialog-footer">
                <el-button type="default" @click="dialog.domainEdit.show = false;">关闭</el-button>
                <el-button type="primary" @click="onUpdateDomain(dialog.domainEdit.data)">确定</el-button>
            </div>
        </el-dialog>
    </el-container>
</template>

<script>
    export default {
        data () {
            return {
                tree: {
                    data: [],
                    defaultProps: {
                        children: 'children',
                        label: 'label'
                    },
                    selected: null
                },
                dt:{
                    rows: [],
                    columns: [{
                        field:"id",
                        title: "ID",
                        visible: false
                    },
                    {
                        field:"class",
                        title: "CLASS",
                        visible: false
                    },
                    {
                        field:"name",
                        title: "标签域",
                        visible: true
                    },
                    {
                        field:"mclass",
                        title: "对应类",
                        visible: true
                    },
                    {
                        field:"remark",
                        title: "备注",
                        visible: true
                    }],
                    selected: []
                },
                dialog: {
                    domainAdd: {
                        show: false,
                        data: {
                            name: "",
                            remark: "",
                            mclass: []
                        }
                    },
                    domainEdit: {
                        show: false,
                        data: null
                    }
                }
            }
        },
        created(){
            this.onLoad(false);
        },
        methods: {
            onLoad(type){
                this.m3.callFS("/matrix/m3system/domain/getDomains.js",type).then((rtn)=>{
                    this.tree.data = rtn.message;
                    this.dt.rows = rtn.message;
                })
            },
            onNodeClick(data){
                
                this.tree.selected = data;

                this.m3.callFS("/matrix/m3system/domain/getClassByDomain.js", encodeURIComponent(data.label) ).then( (rtn)=>{
                    this.dt.rows = rtn.message;
                });
            },
            onDelete(index,data){
                this.$confirm('确定要删除, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                    }).then(() => {
                        let param = encodeURIComponent( JSON.stringify( _.extend( data, {type: 'delete'} ) ) );
                        this.m3.callFS("/matrix/m3system/domain/actions.js",param).then((rtn)=>{
                            this.$message({
                                type: "success",
                                message: "删除成功"
                            })
                            this.onLoad(false);
                        })
                    }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });          
                    });
            },
            onEdit(index,row){
                this.dialog.domainEdit.data = row;
                this.dialog.domainEdit.show = true;
                setTimeout(()=>{
                    $(".el-dialog__body .el-input--small .el-input__inner").css("height","40px");
                    $(".el-dialog__body .el-input--small .el-input__inner").css("line-height","40px");
                },50)
            },
            onSave(index,row){
                
            },
            onNewDomain(){
                this.dialog.domainAdd.data = {
                    name: "",
                    remark: "",
                    mclass: []
                };
                this.dialog.domainAdd.show = true;
                setTimeout(()=>{
                    $(".el-dialog__body .el-input--small .el-input__inner").css("height","40px");
                    $(".el-dialog__body .el-input--small .el-input__inner").css("line-height","40px");
                },50)
            },
            onSaveDomain(data){
                let param = encodeURIComponent( JSON.stringify( _.extend( data, {type: 'add'} ) ) );
                this.m3.callFS("/matrix/m3system/domain/actions.js",param).then((rtn)=>{
                    this.$message({
                        type: "success",
                        message: "新建成功"
                    })
                    this.dialog.domainAdd.show = false;
                    this.onLoad(false);
                })
            },
            onUpdateDomain(data){
                let param = encodeURIComponent( JSON.stringify( _.extend( data, {type: 'edit'} ) ) );
                this.m3.callFS("/matrix/m3system/domain/actions.js",param).then((rtn)=>{
                    this.$message({
                        type: "success",
                        message: "新建成功"
                    })
                    this.dialog.domainEdit.show = false;
                    this.onLoad(false);
                })
            }
        }
    }
</script>