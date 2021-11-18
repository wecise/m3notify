/* 应用映射管理 */
<template>
    <el-container style="height:100%;">
        <el-header style="line-height:60px;display:flex;">
            <span style="position: absolute;right: 30px;">
                <el-popover
                    placement="top-start"
                    title="标题"
                    width="200"
                    trigger="hover"
                    content="根据应用初始化默认的应用映射规则。可反复执行。">
                    <el-button slot="reference" type="default" icon="el-icon-refresh" @click="onInit">初始化映射规则</el-button>	
                </el-popover>
                <el-button type="success" icon="el-icon-plus" @click="onNewDomain">新建映射规则</el-button>
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
                    <template slot-scope="scope">
                        <template v-if="_.includes(['api_rule','class_rule','owner_class_rule'], item['field'])">
                            <div v-if="!_.isEmpty(_.compact(scope.row[item['field']]))">
                                <el-tag :key="index" v-for="(v,index) in scope.row[item['field']]">
                                    {{v}}
                                </el-tag>
                            </div>
                        </template>
                        <span v-else>{{ scope.row[item['field']] }}</span>
                    </template>
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
            映射规则: {{_.uniqBy(dt.rows,'name').length}}
        </el-footer>
        <el-dialog title="映射规则" 
            :visible.sync="dialog.add.show" 
            :close-on-press-escape="false" 
            :close-on-click-modal="false"
            :destroy-on-close="true" 
            v-if="dialog.add.show" width="50vw">
            <el-container style="height:100%;">
                <el-main style="overflow:hidden;padding:0px 10px;">
                    <el-form ref="form" :model="dialog.add.data" label-width="80px" v-if="dialog.add.data">
                        <el-form-item label="名称">
                            <el-input placeholder="名称" v-model="dialog.add.data.name">
                                <el-select v-model="dialog.add.data.name" slot="prepend" placeholder="请选择名称">
                                    <el-option :label="item.name" :value="item.name" :key="index" v-for="(item,index) in _.uniqBy(dt.rows,'name')"></el-option>
                                </el-select>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="接口规则">
                            <el-select
                                v-model="dialog.add.data.api_rule"
                                multiple
                                filterable
                                allow-create
                                default-first-option
                                placeholder="请选择">
                                <el-option
                                    v-for="(item,index) in dialog.api.list"
                                    :key="index"
                                    :label="item.name"
                                    :value="item.name">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="类规则">
                            <span>
                                <el-dropdown trigger="hover" placement="top-end"  :hide-on-click="true">
                                    <el-tooltip content="选则类" open-delay="800">
                                        <el-button type="text" size="mini">
                                            <i class="el-icon-office-building" style="font-size:16px;"></i>
                                        </el-button>
                                    </el-tooltip>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item>
                                            <template scope="scope">
                                                <mx-entity-tree root="/matrix" :filterEnable="false" ref="entityTree" @node-click="(data)=>{ dialog.add.data.class_rule=_.xor(dialog.add.data.class_rule,[data.class]); }"></mx-entity-tree>
                                            </template>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                                <el-select
                                    v-model="dialog.add.data.class_rule"
                                    multiple
                                    filterable
                                    allow-create
                                    default-first-option
                                    placeholder="选择类"
                                    style="width:100%;">
                                    <el-option
                                    v-for="item in dialog.add.data.class_rule"
                                    :key="item"
                                    :label="item"
                                    :value="item">
                                    </el-option>
                                </el-select>
                            </span>
                        </el-form-item>
                        <el-form-item label="所属类规则">
                            <span>
                                <el-dropdown trigger="hover" placement="top-end"  :hide-on-click="true">
                                    <el-tooltip content="选则类" open-delay="800">
                                        <el-button type="text" size="mini">
                                            <i class="el-icon-office-building" style="font-size:16px;"></i>
                                        </el-button>
                                    </el-tooltip>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item>
                                            <template scope="scope">
                                                <mx-entity-tree root="/matrix" :filterEnable="false" @node-click="(data)=>{ dialog.add.data.owner_class_rule=_.xor(dialog.add.data.owner_class_rule,[data.class]); }"></mx-entity-tree>
                                            </template>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                                <el-select
                                    v-model="dialog.add.data.owner_class_rule"
                                    multiple
                                    filterable
                                    allow-create
                                    default-first-option
                                    placeholder="选择类"
                                    style="width:100%;">
                                    <el-option
                                    v-for="item in dialog.add.data.owner_class_rule"
                                    :key="item"
                                    :label="item"
                                    :value="item">
                                    </el-option>
                                </el-select>
                            </span>
                        </el-form-item>
                    </el-form>
                </el-main>
            </el-container>
            <div slot="footer" class="dialog-footer">
                <el-button type="default" @click="dialog.add.show = false;">关闭</el-button>
                <el-button type="primary" @click="onSaveDomain(dialog.add.data)">确定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="编辑应用映射规则" 
            :visible.sync="dialog.edit.show" 
            :close-on-press-escape="false" 
            :close-on-click-modal="false" 
            :destroy-on-close="true" 
            v-if="dialog.edit.show" width="50vw">
            <el-container style="height:100%;">
                <el-main style="overflow:hidden;padding:0px 10px;">
                    <el-form ref="form" :model="dialog.edit.data" label-width="80px" v-if="dialog.edit.data">
                        <el-form-item label="名称">
                            <el-input v-model="dialog.edit.data.name"></el-input>
                        </el-form-item>
                        <el-form-item label="接口规则">
                            <el-select
                                v-model="dialog.edit.data.api_rule"
                                multiple
                                filterable
                                allow-create
                                default-first-option
                                placeholder="请选择">
                                <el-option
                                    v-for="(item,index) in dialog.api.list"
                                    :key="index"
                                    :label="item.name"
                                    :value="item.name">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="类规则">
                            <span>
                                <el-dropdown trigger="hover" placement="top-end"  :hide-on-click="true">
                                    <el-tooltip content="选则类" open-delay="800">
                                        <el-button type="text" size="mini">
                                            <i class="el-icon-office-building" style="font-size:16px;"></i>
                                        </el-button>
                                    </el-tooltip>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item>
                                            <template scope="scope">
                                                <mx-entity-tree root="/matrix" :filterEnable="false" ref="entityTree" @node-click="(data)=>{ dialog.edit.data.class_rule=_.xor(dialog.edit.data.class_rule,[data.class]); }"></mx-entity-tree>
                                            </template>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                                <el-select
                                    v-model="dialog.edit.data.class_rule"
                                    multiple
                                    filterable
                                    allow-create
                                    default-first-option
                                    placeholder="选择类"
                                    style="width:100%;">
                                    <el-option
                                    v-for="item in dialog.edit.data.class_rule"
                                    :key="item"
                                    :label="item"
                                    :value="item">
                                    </el-option>
                                </el-select>
                            </span>
                        </el-form-item>
                        <el-form-item label="所属类规则">
                            <span>
                                <el-dropdown trigger="hover" placement="top-end"  :hide-on-click="true">
                                    <el-tooltip content="选则类" open-delay="800">
                                        <el-button type="text" size="mini">
                                            <i class="el-icon-office-building" style="font-size:16px;"></i>
                                        </el-button>
                                    </el-tooltip>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item>
                                            <template scope="scope">
                                                <mx-entity-tree root="/matrix" :filterEnable="false" ref="entityTree" @node-click="(data)=>{ dialog.edit.data.owner_class_rule=_.xor(dialog.edit.data.owner_class_rule,[data.class]); }"></mx-entity-tree>
                                            </template>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                                <el-select
                                    v-model="dialog.edit.data.owner_class_rule"
                                    multiple
                                    filterable
                                    allow-create
                                    default-first-option
                                    placeholder="选择类"
                                    style="width:100%;">
                                    <el-option
                                    v-for="item in dialog.edit.data.owner_class_rule"
                                    :key="item"
                                    :label="item"
                                    :value="item">
                                    </el-option>
                                </el-select>
                            </span>
                        </el-form-item>
                    </el-form>
                </el-main>
            </el-container>
            <div slot="footer" class="dialog-footer">
                <el-button type="default" @click="dialog.edit.show = false;">关闭</el-button>
                <el-button type="primary" @click="onUpdateDomain(dialog.edit.data)">确定</el-button>
            </div>
        </el-dialog>
    </el-container>
</template>
				
<script>
    export default{
        data () {
            return {
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
                        title: "应用",
                        visible: true
                    },
                    {
                        field:"api_rule",
                        title: "对应接口规则",
                        visible: true
                    },
                    {
                        field:"class_rule",
                        title: "对应类规则",
                        visible: true
                    },
                    {
                        field:"owner_class_rule",
                        title: "所属类规则",
                        visible: true
                    }],
                    selected: []
                },
                dialog: {
                    api: {
                        list: []
                    },
                    add: {
                        show: false,
                        data: {
                            name: "",
                            api_rule: [],
                            class_rule: [],
                            owner_class_rule: []
                        }
                    },
                    edit: {
                        show: false,
                        data: null
                    }
                }
            }
        },
        created(){
            this.onLoad();
        },
        methods: {
            onInit(){
                this.m3.callFS("/matrix/m3system/app/initAppMapping.js").then((rtn)=>{
                    this.onLoad();
                })
            },
            onLoad(){
                this.m3.callFS("/matrix/m3system/app/getAppMapping.js").then((rtn)=>{
                    this.dt.rows = rtn.message;
                    this.onInitApi();
                })
            },
            onInitApi(){
                this.m3.callFS("/matrix/m3system/app/getApi.js").then((rtn)=>{
                    this.dialog.api.list = rtn.message;
                })
            },
            onDelete(index,data){
                this.$confirm('确定要删除, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                    }).then(() => {
                        let param = encodeURIComponent( JSON.stringify( _.extend( data, {type: 'delete'} ) ) );
                        this.m3.callFS("/matrix/m3system/app/actions.js",param).then((rtn)=>{
                            this.$message({
                                type: "success",
                                message: "删除成功"
                            })
                            this.onLoad();
                        })
                    }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });          
                    });
            },
            onEdit(index,row){
                this.dialog.edit.data = row;
                this.dialog.edit.show = true;
                setTimeout(()=>{
                    $(".el-dialog__body .el-input--small .el-input__inner").css("height","40px");
                    $(".el-dialog__body .el-input--small .el-input__inner").css("line-height","40px");
                },50)
            },
            onNewDomain(){
                this.dialog.add.data = {
                    name: "",
                    remark: "",
                    class_rule: [],
                    owner_class_rule: []
                };
                this.dialog.add.show = true;
                setTimeout(()=>{
                    $(".el-dialog__body .el-input--small .el-input__inner").css("height","40px");
                    $(".el-dialog__body .el-input--small .el-input__inner").css("line-height","40px");
                },50)
            },
            onSaveDomain(data){
                let param = encodeURIComponent( JSON.stringify( _.extend( data, {type: 'add'} ) ) );
                this.m3.callFS("/matrix/m3system/app/actions.js",param).then((rtn)=>{
                    this.$message({
                        type: "success",
                        message: "新建成功"
                    })
                    this.dialog.add.show = false;
                    this.onLoad();
                })
            },
            onUpdateDomain(data){
                let param = encodeURIComponent( JSON.stringify( _.extend( data, {type: 'edit'} ) ) );
                this.m3.callFS("/matrix/m3system/app/actions.js",param).then((rtn)=>{
                    this.$message({
                        type: "success",
                        message: "新建成功"
                    })
                    this.dialog.edit.show = false;
                    this.onLoad();
                })
            }
        }
    }
</script>