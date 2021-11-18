<template>
    <el-container style="height:100%;">
        <el-header style="line-height:60px;display:flex;">
            <h5 style="margin:0px;"><i class="el-icon-finished"></i> 解析规则</h5>
            <span style="position: absolute;right: 30px;">
                <el-button type="success" icon="el-icon-plus" @click="onNew">新建解析规则</el-button>
            </span>
        </el-header>
        <el-main style="height:100%;overflow:hidden;">
            <el-table
                :data="dt.rows.filter(data => !dt.search || data.name.toLowerCase().includes(dt.search.toLowerCase()))"
                stripe
                highlight-current-row
                fit="true"
                style="width: 100%"
                :row-class-name="rowClassName"
                :header-cell-style="headerRender"
                @current-change="onSelectionChange">
                <el-table-column type="index" label="序号" sortable align="center">
                    <template slot-scope="scope">
                        <div style="width:100%; text-align: center;"> <b> {{ (scope.$index + 1) }} </b> </div>
                    </template>
                </el-table-column>
                <el-table-column :prop="item.field" 
                    show-overflow-tooltip="true" 
                    :label="item.title"
                    sortable
                    resizable
                    v-for="item in dt.columns"
                    :key="item.field"
                    min-width="180">
                    <template slot-scope="scope" >
                        <span v-if="_.includes(['logo','icon'],item.field)">
                            <el-avatar shape="circle" size="48" :src="scope.row[item.field]"></el-avatar>
                        </span>
                        <span  v-else>{{scope.row[item.field]}}</el-avatar>
                    </template>
                </el-table-column>
                <el-table-column
                    label="操作">
                    <template slot="header" slot-scope="scope">
                        <el-input v-model="dt.search" placeholder="输入关键字搜索" clearable></el-input>
                    </template>
                    <template slot-scope="scope">
                        <el-button @click="onDelete(scope.row)" type="text" size="small">删除</el-button>
                        <el-button @click="onEdit(scope.row)" type="text" size="small">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
        <el-footer style="height:40px;line-height:40px;">
            数量：{{ dt.rows.length }}
        </el-footer>
        <el-dialog title="解析规则管理" 
            :visible.sync="dialog.add.show" 
            :close-on-press-escape="false" 
            :close-on-click-modal="false"
            :destroy-on-close="true" 
            v-if="dialog.add.show" width="50vw">
            <el-container style="height:100%;">
                <el-main style="overflow:hidden;padding:0px 10px;">
                    <el-form ref="form" :model="dialog.add.data" label-width="80px" v-if="dialog.add.data">
                        <el-form-item label="名称">
                            <el-input v-model="dialog.add.data.name" placeholder="名称" v-model="dialog.add.data.name"></el-input>
                        </el-form-item>
                        <el-form-item label="Pattern">
                            <groke-editor :value="dialog.add.data.pattern" @input-value="(data)=>{ dialog.add.data.pattern=data; }" style="height:10vh;"></groke-editor>
                        </el-form-item>
                        <el-form-item label="示例">
                            <groke-editor :value="dialog.add.data.eg" @input-value="(data)=>{ dialog.add.data.eg=data; }" style="height:15vh;"></groke-editor>
                        </el-form-item>
                    </el-form>
                </el-main>
            </el-container>
            <div slot="footer" class="dialog-footer">
                <el-button type="default" @click="dialog.add.show = false;">关闭</el-button>
                <el-button type="primary" @click="onSave(dialog.add.data)">确定</el-button>
            </div>
        </el-dialog>
    </el-container>
</template>

<script>
    export default {
        data(){
            return {
                dt:{
                    rows: [],
                    columns: [],
                    selected: [],
                    search: ""
                },
                dialog: {
                    add: {
                        show: false,
                        data: {
                            name: "",
                            pattern: "",
                            eg: ""
                        }
                    }
                }
            }
        },
        created(){
            this.initData();
        },
        methods: {
            rowClassName({row, rowIndex}){
                return `row-${rowIndex}`;
            },
            headerRender({ row, column, rowIndex, columnIndex }){
                if (rowIndex === 0) {
                    //return 'text-align:center;';
                }
            },
            onSelectionChange(val) {
                this.dt.selected = val;
            },
            initData(){

                grokHandler.grokListAsync().then((rtn)=>{
                    
                    let rows = _.orderBy(rtn.message,['name'],['asc']);
                    
                    _.extend(this.dt, {rows: rows});

                    _.map(this.dt.columns,(v)=>{
                        if(!v.render){
                            return v;
                        } else {
                            return _.extend(v,{render: eval(v.render) });;
                        }
                    })

                    this.dt.columns = [
                        {field:"name",title:"名称", width:120},
                        {field:"pattern",title:"规则"},
                        {field:"eg",title:"举例", width:120}
                    ];
                })
                
            },
            onNew(){
                this.dialog.add.data = {
                    name: "",
                    pattern: "",
                    eg: ""
                };
                this.dialog.add.show = true;
            },
            onSave(data){

                if(_.isEmpty(data.name)){
                    this.$message({
                        type: "warning",
                        message: "名称不能为空"
                    })
                    return false;
                }

                if(_.isEmpty(data.pattern)){
                    this.$message({
                        type: "warning",
                        message: "规则不能为空"
                    })
                    return false;
                }

                grokHandler.grokNew(data).then((rtn)=>{
                    if(rtn == 1){
                        this.$message({
                            type: "success",
                            message: "新建成功"
                        })

                        this.initData();

                        this.dialog.add.show = false;
                    } else {
                        this.$message({
                            type: "error",
                            message: "新建失败： "  + rtn.message
                        })
                    }
                })
            },
            onDelete(data){
                this.$confirm(`确定要删除 ${data.name}, 是否继续?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                    }).then(() => {
                        
                        grokHandler.grokDelete(data).then((rtn)=>{
                            this.$message({
                                type: "success",
                                message: "删除成功"
                            })
                            this.initData();
                        })
                    }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });          
                    });
            },
            onEdit(data){
                this.dialog.add.data = data;
                this.dialog.add.show = true;
            }
        }        
    }
</script>
